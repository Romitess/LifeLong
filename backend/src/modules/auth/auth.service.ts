import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
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
import { ProfileResponseDto } from './dto/profile-response.dto';
import { MoodleService } from '../moodle/moodle.service';
import { PlatformGatewayService } from '../platform-gateway/platform-gateway.service';
import { Role } from './enums/role.enum';
import type { JwtPayload } from './jwt-auth.guard';
import { ProfileImageResponseDto } from './dto/profile-image-response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const BCRYPT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;
const MAX_AVATAR_OPTIONS = 12;

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
      firstNameTh?: string | null;
      lastNameTh?: string | null;
      firstNameEn?: string | null;
      lastNameEn?: string | null;
      phone?: string | null;
      studentCode?: string | null;
      userCode?: string | null;
      imageUrl?: string | null;
      avatarSeed?: string;
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

    let lltumUser = await this.ensureLltumUserProfile(user);

    // 3. Sync with Moodle (Ensure user exists and has correct info)
    try {
      await this.syncWithMoodle(user, password);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Moodle sync failed for ${user.username}: ${errorMsg}`);
    }

    lltumUser =
      (await this.lltumUserRepository.findOne({ where: { id: lltumUser.id } })) ?? lltumUser;

    const profile = lltumUser ? this.toProfileResponse(lltumUser) : null;

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
        firstNameTh: profile?.firstNameTh ?? null,
        lastNameTh: profile?.lastNameTh ?? null,
        firstNameEn: profile?.firstNameEn ?? null,
        lastNameEn: profile?.lastNameEn ?? null,
        phone: profile?.phone ?? null,
        studentCode: profile?.studentCode ?? null,
        userCode: profile?.userCode ?? null,
        imageUrl: profile?.imageUrl ?? null,
        avatarSeed: profile?.avatarSeed ?? `lll-user-${user.id}`,
      },
    };
  }

  async getProfile(user: JwtPayload): Promise<ProfileResponseDto> {
    const lltumUser = await this.getLltumUserForProfile(user);
    return this.toProfileResponse(lltumUser);
  }

  async updateProfile(user: JwtPayload, dto: UpdateProfileDto): Promise<ProfileResponseDto> {
    const lltumUser = await this.getLltumUserForProfile(user);
    const updates: Partial<LltumUser> = {};

    const firstNameTh = this.normalizeRequiredProfileName(dto.firstNameTh, 'firstNameTh');
    if (firstNameTh !== undefined) updates.firstNameTh = firstNameTh;

    const lastNameTh = this.normalizeRequiredProfileName(dto.lastNameTh, 'lastNameTh');
    if (lastNameTh !== undefined) updates.lastNameTh = lastNameTh;

    const firstNameEn = this.normalizeOptionalProfileText(dto.firstNameEn);
    if (firstNameEn !== undefined) updates.firstNameEn = firstNameEn;

    const lastNameEn = this.normalizeOptionalProfileText(dto.lastNameEn);
    if (lastNameEn !== undefined) updates.lastNameEn = lastNameEn;

    const phone = this.normalizeOptionalProfileText(dto.phone);
    if (phone !== undefined) updates.tel = phone;

    if (Object.keys(updates).length > 0) {
      await this.lltumUserRepository.update(lltumUser.id, updates);
    }

    const updated = await this.getLltumUserForProfile(user);
    await this.syncProfileToMoodle(updated, user).catch((error: unknown) => {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Profile saved locally but Moodle profile sync failed: ${msg}`);
    });

    return this.toProfileResponse(updated);
  }

  async updateProfileImage(
    user: JwtPayload,
    file: Express.Multer.File,
  ): Promise<ProfileImageResponseDto> {
    const lltumUser = await this.getLltumUserForProfile(user);
    const previousImageUrl = lltumUser.imageUrl;
    const uploaded = await this.platformGatewayService.uploadByCategory(
      'profile',
      file,
      user.lltumSub,
    );

    try {
      await this.lltumUserRepository.update(lltumUser.id, { imageUrl: uploaded.url });
    } catch (error) {
      await this.platformGatewayService.deleteFile(uploaded.path).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Failed to delete newly uploaded profile image after DB error: ${msg}`);
      });
      throw error;
    }

    await this.deleteGatewayFileFromUrl(previousImageUrl);
    return { imageUrl: uploaded.url };
  }

  async deleteProfileImage(user: JwtPayload): Promise<ProfileImageResponseDto> {
    const lltumUser = await this.getLltumUserForProfile(user);
    const previousImageUrl = lltumUser.imageUrl;
    if (!previousImageUrl) return { imageUrl: null };

    await this.lltumUserRepository.update(lltumUser.id, { imageUrl: null });
    await this.deleteGatewayFileFromUrl(previousImageUrl);
    return { imageUrl: null };
  }

  async saveProfileImageUrl(
    user: JwtPayload,
    imageUrl: string,
  ): Promise<ProfileImageResponseDto> {
    const lltumUser = await this.getLltumUserForProfile(user);
    const normalizedImageUrl = this.normalizeProfileImageUrl(imageUrl);
    await this.lltumUserRepository.update(lltumUser.id, { imageUrl: normalizedImageUrl });
    return { imageUrl: normalizedImageUrl };
  }

  async uploadAvatarOption(
    user: JwtPayload,
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    const lltumUser = await this.getLltumUserForProfile(user);
    const uploaded = await this.platformGatewayService.uploadByCategory(
      'profile',
      file,
      lltumUser.id,
    );

    return { imageUrl: uploaded.url };
  }

  async getAvatarOptions(user: JwtPayload): Promise<{ avatarOptions: string[] }> {
    const lltumUser = await this.getLltumUserForProfile(user);

    return { avatarOptions: this.parseAvatarOptions(lltumUser.avatarOptionsJson) };
  }

  async saveAvatarOptions(
    user: JwtPayload,
    avatarOptions: string[],
  ): Promise<{ avatarOptions: string[] }> {
    const lltumUser = await this.getLltumUserForProfile(user);

    const nextAvatarOptions = this.normalizeAvatarOptions(avatarOptions);
    await this.lltumUserRepository.update(lltumUser.id, {
      avatarOptionsJson: JSON.stringify(nextAvatarOptions),
    });

    return { avatarOptions: nextAvatarOptions };
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
    const lltumUser = await this.lltumUserRepository.findOne({
      where: [{ username: user.username }, { email: user.email }],
    });
    const moodleProfile = this.buildMoodleProfileNames(lltumUser, user);

    // Check if user exists in Moodle using core_user_get_users with criteria
    const searchParams = new URLSearchParams();
    searchParams.append('criteria[0][key]', 'username');
    searchParams.append('criteria[0][value]', user.username);

    const searchResult = (await this.moodleService.callMoodleApi(
      'core_user_get_users',
      searchParams,
    )) as { users: { id: number; firstname?: string; lastname?: string; email?: string }[] };

    if (searchResult.users && searchResult.users.length > 0) {
      const moodleUser = searchResult.users[0];
      this.logger.log(`User ${user.username} already exists in Moodle (ID: ${moodleUser.id}).`);

      // Sync display name/email if changed in LLL; password only when explicitly enabled.
      if (
        moodleUser.firstname !== moodleProfile.firstname ||
        moodleUser.lastname !== moodleProfile.lastname ||
        moodleUser.email !== user.email
      ) {
        this.logger.log(`Syncing user ${user.username} profile/email in Moodle...`);
        const updateParams = new URLSearchParams();
        updateParams.append('users[0][id]', moodleUser.id.toString());
        updateParams.append('users[0][firstname]', moodleProfile.firstname);
        updateParams.append('users[0][lastname]', moodleProfile.lastname);
        updateParams.append('users[0][email]', user.email);
        if (this.moodlePasswordSyncEnabled) {
          updateParams.append('users[0][password]', plainPassword);
        }
        // else: ไม่ sync password — Moodle login ใช้ SSO; รหัส LLL ที่ weak จะ fail password policy

        await this.moodleService.callMoodleApi('core_user_update_users', updateParams);
        this.logger.log(`User ${user.username} successfully updated in Moodle.`);
      }

      await this.saveLmsId(user.username, user.email, moodleUser.id);
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
    createParams.append('users[0][firstname]', moodleProfile.firstname);
    createParams.append('users[0][lastname]', moodleProfile.lastname);
    createParams.append('users[0][email]', user.email);
    createParams.append('users[0][auth]', 'manual');

    const createResult = (await this.moodleService.callMoodleApi(
      'core_user_create_users',
      createParams,
    )) as { id: number; username: string }[];
    this.logger.log(`User ${user.username} successfully created in Moodle.`);

    if (Array.isArray(createResult) && createResult[0]?.id) {
      await this.saveLmsId(user.username, user.email, createResult[0].id);
      return createResult[0].id;
    }
    return null;
  }

  private async saveLmsId(username: string, email: string, moodleUserId: number): Promise<void> {
    const lltumUser = await this.lltumUserRepository.findOne({
      where: [{ username }, { email }],
    });
    if (!lltumUser || lltumUser.lmsId) return;
    lltumUser.lmsId = moodleUserId;
    await this.lltumUserRepository.save(lltumUser);
    this.logger.log(`Linked LLTUMUSER.LMS_ID=${moodleUserId} for ${username}`);
  }

  private async ensureLltumUserProfile(user: LltAuthUser): Promise<LltumUser> {
    const existing = await this.lltumUserRepository.findOne({
      where: [{ username: user.username }, { email: user.email }],
    });
    if (existing) return existing;

    const names = await this.resolveInitialProfileNames(user);
    const profile = this.lltumUserRepository.create({
      ...names,
      username: user.username,
      email: user.email,
      password: user.password,
      status: 'A',
      createUser: 'AUTH_PROFILE_LINK',
      userCitizenId: null,
    });
    const saved = await this.lltumUserRepository.save(profile);
    this.logger.log(`Created LLTUMUSER profile link for ${user.username} (${user.role})`);
    return saved;
  }

  private async resolveInitialProfileNames(user: LltAuthUser): Promise<{
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
  }> {
    const defaults = getRoleProfileDefaults(user.role);
    try {
      const rows = await this.lltumUserRepository.manager.query<
        Array<{ firstNameTh: string | null; lastNameTh: string | null }>
      >(
        `SELECT PSN_FNAMETH AS firstNameTh, PSN_LNAMETH AS lastNameTh
         FROM PSNTPERSON
         WHERE LOWER(PSN_EMAIL) = LOWER(?)
         LIMIT 1`,
        [user.email],
      );
      const person = rows[0];
      return {
        firstNameTh: person?.firstNameTh?.trim() || defaults.firstNameTh,
        lastNameTh: person?.lastNameTh?.trim() || defaults.lastNameTh,
        firstNameEn: defaults.firstNameEn,
        lastNameEn: defaults.lastNameEn,
      };
    } catch {
      return defaults;
    }
  }

  private async getLltumUserForProfile(user: JwtPayload): Promise<LltumUser> {
    if (!user.lltumSub) {
      throw new BadRequestException('User profile is not linked');
    }
    const lltumUser = await this.lltumUserRepository.findOne({ where: { id: user.lltumSub } });
    if (!lltumUser) {
      throw new NotFoundException('User profile not found');
    }
    return lltumUser;
  }

  private toProfileResponse(lltumUser: LltumUser): ProfileResponseDto {
    return {
      id: lltumUser.id,
      studentCode: lltumUser.studentCode ?? null,
      userCode: lltumUser.userCode ?? null,
      firstNameTh: lltumUser.firstNameTh ?? null,
      lastNameTh: lltumUser.lastNameTh ?? null,
      firstNameEn: lltumUser.firstNameEn ?? null,
      lastNameEn: lltumUser.lastNameEn ?? null,
      phone: lltumUser.tel ?? null,
      imageUrl: lltumUser.imageUrl ?? null,
      avatarSeed: `lll-user-${lltumUser.id}`,
    };
  }

  private normalizeRequiredProfileName(
    value: string | undefined,
    field: string,
  ): string | undefined {
    if (value === undefined) return undefined;
    const trimmed = value.trim();
    if (!trimmed) {
      throw new BadRequestException(`${field} is required`);
    }
    return trimmed;
  }

  private normalizeOptionalProfileText(
    value: string | null | undefined,
  ): string | null | undefined {
    if (value === undefined) return undefined;
    const trimmed = value?.trim() ?? '';
    return trimmed || null;
  }

  private buildMoodleProfileNames(
    lltumUser: LltumUser | null,
    authUser: Pick<LltAuthUser, 'username' | 'role'>,
  ): { firstname: string; lastname: string } {
    const firstname =
      lltumUser?.firstNameTh?.trim() || lltumUser?.firstNameEn?.trim() || authUser.username;
    const lastname =
      lltumUser?.lastNameTh?.trim() || lltumUser?.lastNameEn?.trim() || authUser.role;

    return {
      firstname,
      lastname,
    };
  }

  private async syncProfileToMoodle(lltumUser: LltumUser, user: JwtPayload): Promise<void> {
    if (!lltumUser.lmsId) {
      this.logger.warn(
        `Skipping Moodle profile sync for ${user.username}: LLTUMUSER.LMS_ID is empty`,
      );
      return;
    }

    const moodleProfile = this.buildMoodleProfileNames(lltumUser, {
      username: user.username,
      role: user.role,
    });
    const params = new URLSearchParams();
    params.append('users[0][id]', lltumUser.lmsId.toString());
    params.append('users[0][firstname]', moodleProfile.firstname);
    params.append('users[0][lastname]', moodleProfile.lastname);
    params.append('users[0][email]', lltumUser.email || user.email);

    await this.moodleService.callMoodleApi('core_user_update_users', params);
  }

  private async deleteGatewayFileFromUrl(fileUrl: string | null): Promise<void> {
    if (!fileUrl) return;
    const gatewayPath = toGatewayFilePath(fileUrl);
    if (!gatewayPath) return;
    await this.platformGatewayService.deleteFile(gatewayPath).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to delete old profile image from gateway: ${msg}`);
    });
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

  private normalizeProfileImageUrl(imageUrl: string): string {
    const normalizedUrl = imageUrl.trim();
    if (!normalizedUrl) {
      throw new UnauthorizedException('Profile image URL is required');
    }
    return normalizedUrl;
  }

  private parseAvatarOptions(rawOptions: string | null | undefined): string[] {
    if (!rawOptions) return [];
    try {
      const parsed = JSON.parse(rawOptions) as unknown;
      if (!Array.isArray(parsed)) return [];
      return this.normalizeAvatarOptions(parsed);
    } catch {
      return [];
    }
  }

  private normalizeAvatarOptions(avatarOptions: unknown[]): string[] {
    return Array.from(
      new Set(
        avatarOptions.filter(
          (avatarOption): avatarOption is string =>
            typeof avatarOption === 'string' && avatarOption.trim().length > 0,
        ),
      ),
    ).slice(0, MAX_AVATAR_OPTIONS);
  }
}

function toGatewayFilePath(filePath: string): string | null {
  const withoutQuery = filePath.split('?')[0] ?? filePath;
  const match = withoutQuery.match(/\/uploads\/.+$/);
  if (match) return match[0].replace(/^\/+/, '');
  return null;
}

function getRoleProfileDefaults(role: string): {
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
} {
  const normalizedRole = role
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  if (normalizedRole === 'admin') {
    return {
      firstNameTh: 'ผู้ดูแล',
      lastNameTh: 'ระบบ',
      firstNameEn: 'SYSTEM',
      lastNameEn: 'ADMINISTRATOR',
    };
  }
  if (normalizedRole === 'finance') {
    return {
      firstNameTh: 'เจ้าหน้าที่การเงิน',
      lastNameTh: 'ระบบ',
      firstNameEn: 'FINANCE',
      lastNameEn: 'OFFICER',
    };
  }
  if (normalizedRole === 'central_finance') {
    return {
      firstNameTh: 'เจ้าหน้าที่การเงินส่วนกลาง',
      lastNameTh: 'ระบบ',
      firstNameEn: 'CENTRAL FINANCE',
      lastNameEn: 'OFFICER',
    };
  }
  if (normalizedRole === 'instructor' || normalizedRole === 'teach') {
    return {
      firstNameTh: 'อาจารย์',
      lastNameTh: 'ผู้สอน',
      firstNameEn: 'INSTRUCTOR',
      lastNameEn: 'USER',
    };
  }
  return {
    firstNameTh: 'ผู้เรียน',
    lastNameTh: 'ระบบ',
    firstNameEn: 'STUDENT',
    lastNameEn: 'USER',
  };
}
