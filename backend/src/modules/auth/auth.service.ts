import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { LltAuthUser } from './entities/llt-auth-user.entity';
import { LltumUser } from './entities/lltum-user.entity';
import { LltUmtlog } from './entities/llt-umtlog.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MoodleService } from '../moodle/moodle.service';
import { Role } from './enums/role.enum';
import { PlatformGatewayService } from '../platform-gateway/platform-gateway.service';

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly moodlePasswordSyncEnabled: boolean;
  private readonly loginAttempts = new Map<string, { count: number; lockedUntil: Date | null }>();

  constructor(
    @InjectRepository(LltAuthUser)
    private readonly authUserRepository: Repository<LltAuthUser>,
    @InjectRepository(LltumUser)
    private readonly lltumUserRepository: Repository<LltumUser>,
    @InjectRepository(LltUmtlog)
    private readonly umtlogRepository: Repository<LltUmtlog>,
    private moodleService: MoodleService,
    private readonly platformGatewayService: PlatformGatewayService,
    private jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.moodlePasswordSyncEnabled =
      this.configService.get<string>('ENABLE_MOODLE_PASSWORD_SYNC') === 'true';
  }

  async register(dto: RegisterDto): Promise<{
    message: string;
    user: { id: number; username: string; email: string; role: string };
  }> {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.authUserRepository.findOne({
      where: [{ email }, { username: email }],
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    if (dto.citizenId) {
      const citizenDup = await this.lltumUserRepository.findOne({
        where: { userCitizenId: dto.citizenId },
      });
      if (citizenDup) {
        throw new ConflictException('Citizen ID already registered');
      }
    }

    // Derive username from email local-part
    const username = email
      .split('@')[0]
      .replace(/[^a-z0-9._-]/gi, '')
      .toLowerCase();

    const plainPassword = dto.password;
    const hashedPassword = await bcrypt.hash(plainPassword, BCRYPT_ROUNDS);

    const authUser = this.authUserRepository.create({
      username,
      email,
      password: hashedPassword,
      role: Role.Student,
      createUser: 'SELF_REGISTER',
    });
    const savedAuthUser = await this.authUserRepository.save(authUser);

    const lltumUser = this.lltumUserRepository.create({
      firstNameTh: dto.firstNameTh.trim(),
      lastNameTh: dto.lastNameTh.trim(),
      firstNameEn: dto.firstNameEn.trim().toUpperCase(),
      lastNameEn: dto.lastNameEn.trim().toUpperCase(),
      tel: dto.phone?.trim() ?? '',
      username,
      email,
      password: hashedPassword,
      status: 'A',
      createUser: 'SELF_REGISTER',
      userCitizenId: dto.citizenId ?? null,
    });
    await this.lltumUserRepository.save(lltumUser);

    try {
      await this.syncWithMoodle(savedAuthUser, plainPassword);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Moodle sync failed for new user ${username}: ${errorMsg}`);
    }

    return {
      message: 'Registration successful',
      user: {
        id: savedAuthUser.id,
        username: savedAuthUser.username,
        email: savedAuthUser.email,
        role: savedAuthUser.role,
      },
    };
  }

  async login(
    loginDto: LoginDto,
    req?: Request,
  ): Promise<{
    message: string;
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
      facId?: number | null;
      facName?: string | null;
      avatarUrl?: string | null;
    };
  }> {
    const { username, password } = loginDto;

    // 1. Find user in LLT_AUTH_USERS (Acting as LDAP)
    const user = await this.authUserRepository.findOne({
      where: [{ username }, { email: username }],
      relations: { faculty: true },
    });

    if (!user) {
      this.logger.warn(`Login failed: User not found in LLT_AUTH_USERS - ${username}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // 2. Check account lockout
    const attempts = this.loginAttempts.get(user.username);
    if (attempts?.lockedUntil && attempts.lockedUntil > new Date()) {
      const remaining = Math.ceil((attempts.lockedUntil.getTime() - Date.now()) / 60000);
      this.logger.warn(
        `Login blocked: Account locked for ${user.username} (${remaining}m remaining)`,
      );
      throw new UnauthorizedException('ACCOUNT_LOCKED');
    }

    // 3. Validate password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      const current = this.loginAttempts.get(user.username) ?? { count: 0, lockedUntil: null };
      current.count += 1;
      if (current.count >= MAX_FAILED_ATTEMPTS) {
        current.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        this.logger.warn(`Account locked: ${user.username} after ${current.count} failed attempts`);
      }
      this.loginAttempts.set(user.username, current);
      this.logger.warn(
        `Login failed: Incorrect password for - ${username} (attempt ${current.count}/${MAX_FAILED_ATTEMPTS})`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset lockout on successful login
    this.loginAttempts.delete(user.username);

    // 3. Sync with Moodle (Ensure user exists and has correct info)
    try {
      await this.syncWithMoodle(user, password);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Moodle sync failed for ${user.username}: ${errorMsg}`);
    }

    const lltumUser = await this.lltumUserRepository.findOne({
      where: { username: user.username },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      lltumSub: lltumUser?.id ?? null,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    // Fire-and-forget: record login audit log — must not block or fail the login
    try {
      const ip =
        (req?.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
        req?.socket?.remoteAddress ??
        null;
      const device = req?.headers['user-agent'] ?? null;
      const ultype = user.role === Role.Student ? 'S' : 'P';

      await this.umtlogRepository.save({
        ulusid: String(lltumUser?.id ?? user.id),
        ullogintime: new Date(),
        ulip: ip ?? undefined,
        ulcmd: device ?? undefined,
        uluslogin: user.username,
        ultype,
      });
    } catch (logErr) {
      const logErrMsg = logErr instanceof Error ? logErr.message : String(logErr);
      this.logger.warn(`Failed to write LLTUMTLOG for ${user.username}: ${logErrMsg}`);
    }

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        facId: user.facId,
        facName: (user.faculty as { name?: string } | null)?.name ?? null,
        avatarUrl: this.buildAvatarUrl(user.avatarPath),
      },
    };
  }

  async uploadAvatar(
    authUserId: number,
    file: Express.Multer.File,
  ): Promise<{ avatarPath: string; avatarUrl: string }> {
    const user = await this.authUserRepository.findOne({ where: { id: authUserId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const uploaded = await this.platformGatewayService.uploadByCategory('profile', file, authUserId);
    const avatarPath = uploaded.path;
    const previousAvatarPath = user.avatarPath;

    user.avatarPath = avatarPath;
    await this.authUserRepository.save(user);

    if (
      previousAvatarPath &&
      previousAvatarPath !== avatarPath &&
      previousAvatarPath.startsWith('/uploads/profile/')
    ) {
      void this.platformGatewayService.deleteFile(previousAvatarPath).catch((error: unknown) => {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Failed to delete previous avatar for ${user.username}: ${errorMessage}`);
      });
    }

    return {
      avatarPath,
      avatarUrl: this.buildAvatarUrl(avatarPath) ?? '',
    };
  }

  /**
   * Generate a Moodle password that always satisfies Moodle's password policy
   * (>=8 chars, upper, lower, digit, special). The Moodle account password is
   * never used for login — users reach Moodle via SSO (auth_userkey) — so it is
   * decoupled from the (possibly weaker) LLT_AUTH_USERS password. This prevents
   * core_user_create_users from failing when the user's LLL password is weak.
   */
  private generateMoodlePassword(): string {
    return `Aa1#${randomBytes(12).toString('hex')}`;
  }

  private async syncWithMoodle(user: LltAuthUser, plainPassword: string): Promise<number | null> {
    // Check if user exists in Moodle using core_user_get_users with criteria
    const searchParams = new URLSearchParams();
    searchParams.append('criteria[0][key]', 'username');
    searchParams.append('criteria[0][value]', user.username);

    const searchResult = (await this.moodleService.callMoodleApi(
      'core_user_get_users',
      searchParams,
    )) as { users: { id: number; lastname?: string; email?: string }[] };

    if (searchResult.users && searchResult.users.length > 0) {
      const moodleUser = searchResult.users[0];
      this.logger.log(`User ${user.username} already exists in Moodle (ID: ${moodleUser.id}).`);

      // Sync role/email if changed in LLT_AUTH_USERS; password only when explicitly enabled
      if (moodleUser.lastname !== user.role || moodleUser.email !== user.email) {
        this.logger.log(
          `Syncing user ${user.username} (role: ${user.role}, email: ${user.email}) in Moodle...`,
        );
        const updateParams = new URLSearchParams();
        updateParams.append('users[0][id]', moodleUser.id.toString());
        updateParams.append('users[0][lastname]', user.role);
        updateParams.append('users[0][email]', user.email);
        if (this.moodlePasswordSyncEnabled) {
          updateParams.append('users[0][password]', plainPassword);
        }
        // else: ไม่ sync password — Moodle login ใช้ SSO; รหัส LLL ที่ weak จะ fail password policy

        await this.moodleService.callMoodleApi('core_user_update_users', updateParams);
        this.logger.log(`User ${user.username} successfully updated in Moodle.`);
      }

      await this.saveLmsId(user.username, moodleUser.id);
      return moodleUser.id;
    }

    // Create user in Moodle if not exists
    this.logger.log(`Creating user ${user.username} in Moodle...`);
    const moodlePassword = this.moodlePasswordSyncEnabled
      ? plainPassword
      : this.generateMoodlePassword();
    const createParams = new URLSearchParams();
    createParams.append('users[0][username]', user.username);
    createParams.append('users[0][password]', moodlePassword);
    createParams.append('users[0][firstname]', user.username);
    createParams.append('users[0][lastname]', user.role); // Use Role as Lastname for identification
    createParams.append('users[0][email]', user.email);
    createParams.append('users[0][auth]', 'manual');

    const createResult = (await this.moodleService.callMoodleApi(
      'core_user_create_users',
      createParams,
    )) as { id: number; username: string }[];
    this.logger.log(`User ${user.username} successfully created in Moodle.`);

    if (Array.isArray(createResult) && createResult[0]?.id) {
      await this.saveLmsId(user.username, createResult[0].id);
      return createResult[0].id;
    }
    return null;
  }

  private async saveLmsId(username: string, moodleUserId: number): Promise<void> {
    const lltumUser = await this.lltumUserRepository.findOne({ where: { username } });
    if (!lltumUser || lltumUser.lmsId) return;
    lltumUser.lmsId = moodleUserId;
    await this.lltumUserRepository.save(lltumUser);
    this.logger.log(`Linked LLTUMUSER.LMS_ID=${moodleUserId} for ${username}`);
  }

  /**
   * Backfill: ensure LLT users that have no Moodle mapping (LMS_ID null/0) get a
   * Moodle account and a linked LMS_ID. Idempotent — reuses {@see syncWithMoodle}
   * which links an existing Moodle account or creates one (with a policy-compliant
   * random password). Processes a bounded batch per call so it can be run
   * repeatedly until `remaining` reaches 0. Admin-only (see controller).
   */
  async backfillMoodleUsers(limit = 100): Promise<{
    totalUnmapped: number;
    processed: number;
    succeeded: number;
    skippedNoAuthUser: number;
    failed: number;
    remaining: number;
    failures: { username: string; error: string }[];
  }> {
    const unmappedWhere = [{ lmsId: IsNull() }, { lmsId: 0 }];
    const totalUnmapped = await this.lltumUserRepository.count({ where: unmappedWhere });

    const take = Math.max(1, Math.min(limit, 500));
    const batch = await this.lltumUserRepository.find({ where: unmappedWhere, take });

    let succeeded = 0;
    let skippedNoAuthUser = 0;
    let failed = 0;
    const failures: { username: string; error: string }[] = [];

    for (const um of batch) {
      const username = um.username;
      if (!username) {
        skippedNoAuthUser++;
        continue;
      }
      const authUser = await this.authUserRepository.findOne({ where: { username } });
      if (!authUser) {
        // No login account → no role/email to create a Moodle user from.
        skippedNoAuthUser++;
        continue;
      }
      try {
        const moodleId = await this.syncWithMoodle(authUser, '');
        if (moodleId) {
          succeeded++;
        } else {
          failed++;
          if (failures.length < 20) failures.push({ username, error: 'no Moodle id returned' });
        }
      } catch (e) {
        failed++;
        const msg = e instanceof Error ? e.message : String(e);
        if (failures.length < 20) failures.push({ username, error: msg });
        this.logger.warn(`Backfill failed for ${username}: ${msg}`);
      }
    }

    const remaining = await this.lltumUserRepository.count({ where: unmappedWhere });
    return {
      totalUnmapped,
      processed: batch.length,
      succeeded,
      skippedNoAuthUser,
      failed,
      remaining,
      failures,
    };
  }

  private buildAvatarUrl(avatarPath: string | null | undefined): string | null {
    if (!avatarPath) return null;
    if (/^https?:\/\//i.test(avatarPath)) return avatarPath;
    const normalizedPath = avatarPath.startsWith('/') ? avatarPath : `/${avatarPath}`;
    return `/api${normalizedPath}`.replace(/\/{2,}/g, '/');
  }
}
