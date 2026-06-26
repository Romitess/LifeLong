import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { Lltumforgotpass } from './entities/lltumforgotpass.entity';
import { CreateLltumforgotpassDto } from './dto/create-lltumforgotpass.dto';
import { UpdateLltumforgotpassDto } from './dto/update-lltumforgotpass.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LltAuthUser } from '../modules/auth/entities/llt-auth-user.entity';
import { LltumUser } from '../modules/auth/entities/lltum-user.entity';
import { EmailService } from '../modules/email/email.service';

const RESET_EXPIRY_HOURS = 24;
const BCRYPT_ROUNDS = 12;

@Injectable()
export class LltumforgotpassService {
  private readonly logger = new Logger(LltumforgotpassService.name);

  constructor(
    @InjectRepository(Lltumforgotpass)
    private readonly forgotpassRepo: Repository<Lltumforgotpass>,
    @InjectRepository(LltAuthUser)
    private readonly authUserRepo: Repository<LltAuthUser>,
    @InjectRepository(LltumUser)
    private readonly lltumUserRepo: Repository<LltumUser>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async requestReset(dto: CreateLltumforgotpassDto): Promise<{ message: string }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.authUserRepo.findOne({ where: { email } });

    if (user) {
      await this.forgotpassRepo
        .createQueryBuilder()
        .update()
        .set({
          status: 'X',
          updateUser: 'SYSTEM',
          updateDate: new Date(),
          updateProgram: 'LLTUMFORGOTPASS',
        })
        .where('FGP_EMAIL = :email', { email })
        .andWhere('FGP_STATUS != :done', { done: 'Y' })
        .execute();

      const key = randomBytes(24).toString('hex');
      const record = this.forgotpassRepo.create({
        email,
        startDate: new Date(),
        endDate: null,
        key,
        status: 'N',
        createUser: 'SYSTEM',
        createDate: new Date(),
      });
      const saved = await this.forgotpassRepo.save(record);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:9000';
      const resetLink = `${frontendUrl}/#/reset-password?key=${key}`;

      try {
        await this.emailService.sendForgotPasswordEmail({ to: email, resetLink });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Failed to send reset email to ${email}: ${msg}`);
      }

      this.logger.log(`Password reset requested for ${email} — record #${saved.id}`);
    }

    return { message: 'หากอีเมลนี้มีอยู่ในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่านทางอีเมล' };
  }

  async verifyKey(key: string): Promise<{ valid: boolean; email?: string }> {
    const record = await this.forgotpassRepo.findOne({ where: { key } });

    if (!record || record.status !== 'N') {
      return { valid: false };
    }

    const expiryMs = RESET_EXPIRY_HOURS * 60 * 60 * 1000;
    if (Date.now() - record.startDate.getTime() > expiryMs) {
      return { valid: false };
    }

    return { valid: true, email: record.email };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const record = await this.forgotpassRepo.findOne({ where: { key: dto.key } });

    if (!record) {
      throw new NotFoundException('ไม่พบข้อมูลการรีเซ็ตรหัสผ่าน');
    }

    if (record.status === 'Y') {
      throw new BadRequestException('ลิงก์นี้ถูกใช้งานแล้ว');
    }

    if (record.status !== 'N') {
      throw new BadRequestException('ลิงก์นี้ไม่สามารถใช้งานได้');
    }

    const expiryMs = RESET_EXPIRY_HOURS * 60 * 60 * 1000;
    if (Date.now() - record.startDate.getTime() > expiryMs) {
      throw new BadRequestException('ลิงก์หมดอายุแล้ว');
    }

    const authUser = await this.authUserRepo.findOne({ where: { email: record.email } });
    if (!authUser) {
      throw new NotFoundException('ไม่พบข้อมูลผู้ใช้');
    }

    const hashed = await bcrypt.hash(dto.newPassword, BCRYPT_ROUNDS);

    authUser.password = hashed;
    authUser.updateUser = record.email;
    authUser.updateDate = new Date();
    await this.authUserRepo.save(authUser);

    const lltumUser = await this.lltumUserRepo.findOne({ where: { email: record.email } });
    if (lltumUser) {
      lltumUser.password = hashed;
      await this.lltumUserRepo.save(lltumUser);
    }

    record.status = 'Y';
    record.endDate = new Date();
    record.updateUser = record.email;
    record.updateDate = new Date();
    record.updateProgram = 'LLTUMFORGOTPASS';
    await this.forgotpassRepo.save(record);

    this.logger.log(`Password reset completed for ${record.email}`);
    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }

  async completeReset(key: string): Promise<{ success: boolean }> {
    const record = await this.forgotpassRepo.findOne({ where: { key } });

    if (!record) {
      throw new NotFoundException('ไม่พบข้อมูลการรีเซ็ตรหัสผ่าน');
    }

    if (record.status === 'Y') {
      throw new BadRequestException('ลิงก์นี้ถูกใช้งานแล้ว');
    }

    if (record.status !== 'N') {
      throw new BadRequestException('ลิงก์นี้ไม่สามารถใช้งานได้');
    }

    const expiryMs = RESET_EXPIRY_HOURS * 60 * 60 * 1000;
    if (Date.now() - record.startDate.getTime() > expiryMs) {
      throw new BadRequestException('ลิงก์หมดอายุแล้ว');
    }

    record.status = 'Y';
    record.endDate = new Date();
    record.updateUser = record.email;
    record.updateDate = new Date();
    record.updateProgram = 'LLTUMFORGOTPASS';

    await this.forgotpassRepo.save(record);
    return { success: true };
  }

  async findAll(): Promise<Lltumforgotpass[]> {
    return this.forgotpassRepo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number): Promise<Lltumforgotpass> {
    const record = await this.forgotpassRepo.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`ไม่พบข้อมูล ID ${id}`);
    }
    return record;
  }

  async update(id: number, dto: UpdateLltumforgotpassDto): Promise<Lltumforgotpass> {
    const record = await this.findOne(id);
    record.status = dto.status;
    record.updateDate = new Date();
    record.updateProgram = 'LLTUMFORGOTPASS';
    return this.forgotpassRepo.save(record);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.forgotpassRepo.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }
}
