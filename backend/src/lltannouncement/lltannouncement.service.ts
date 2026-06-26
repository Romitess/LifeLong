import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Lltannouncement } from './entities/lltannouncement.entity';
import { CreateLltannouncementDto } from './dto/create-lltannouncement.dto';
import { LltannouncementResponseDto } from './dto/lltannouncement-response.dto';
import { EmailService } from '../modules/email/email.service';
import { LltnotificationService } from '../lltnotification/lltnotification.service';

interface EnrolledStudent {
  userId: number;
  email: string | null;
  firstNameTh: string | null;
  lastNameTh: string | null;
}

interface CourseRow {
  titleTh: string | null;
  titleEn: string | null;
}

@Injectable()
export class LltannouncementService {
  private readonly logger = new Logger(LltannouncementService.name);

  constructor(
    @InjectRepository(Lltannouncement)
    private readonly announcementRepo: Repository<Lltannouncement>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly notificationService: LltnotificationService,
  ) {}

  async create(
    dto: CreateLltannouncementDto,
    instructorEmail: string,
  ): Promise<LltannouncementResponseDto> {
    const courseRows = await this.dataSource.query<CourseRow[]>(
      `SELECT COSE_NAMETH AS titleTh, COSE_NAMEEN AS titleEn FROM LLTCOURSE WHERE COSE_ID = ?`,
      [dto.courseId],
    );

    if (!courseRows.length) {
      throw new NotFoundException(`ไม่พบรายวิชา ID ${dto.courseId}`);
    }

    const announcement = this.announcementRepo.create({
      courseId: dto.courseId,
      title: dto.title,
      content: dto.content,
      createUser: instructorEmail,
    });
    const saved = await this.announcementRepo.save(announcement);

    const courseName = courseRows[0].titleTh ?? courseRows[0].titleEn ?? `รายวิชา #${dto.courseId}`;

    const requestedRecipientIds = new Set(dto.recipientUserIds ?? []);
    const students = (await this.getEnrolledStudents(dto.courseId)).filter(
      (student) => requestedRecipientIds.size === 0 || requestedRecipientIds.has(student.userId),
    );
    const withEmail = students.filter((s) => s.email?.trim());
    const emailsSkipped = students.length - withEmail.length;

    const results = await Promise.allSettled(
      withEmail.map((student) =>
        this.emailService.sendAnnouncementEmail({
          to: student.email!.trim(),
          recipientName:
            [student.firstNameTh, student.lastNameTh].filter(Boolean).join(' ') ||
            student.email!.trim(),
          courseName,
          title: dto.title,
          content: dto.content,
          instructorName: instructorEmail,
        }),
      ),
    );

    const emailsSent = results.filter((r) => r.status === 'fulfilled').length;
    const emailsFailed = results.filter((r) => r.status === 'rejected').length;

    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        this.logger.warn(`Email failed [${withEmail[i].email}]: ${(r.reason as Error).message}`);
      }
    });

    const notifMessage = dto.content
      .replace(/<[^>]*>/g, '')
      .trim()
      .slice(0, 200);
    await this.notificationService.createBulk(
      students.map((s) => ({
        userId: s.userId,
        type: 'announcement',
        title: `[${courseName}] ${dto.title}`,
        message: notifMessage,
        refId: saved.id,
        refType: 'announcement',
      })),
    );

    this.logger.log(
      `Announcement #${saved.id} created — course ${dto.courseId}: ${emailsSent} sent, ${emailsFailed} failed, ${emailsSkipped} skipped (no email)`,
    );

    return {
      id: saved.id,
      courseId: saved.courseId,
      title: saved.title,
      content: saved.content,
      createUser: saved.createUser,
      createDate: saved.createDate,
      emailsSent,
      emailsFailed,
      emailsSkipped,
    };
  }

  async findByCourse(courseId: number): Promise<Lltannouncement[]> {
    return this.announcementRepo.find({
      where: { courseId },
      order: { createDate: 'DESC' },
    });
  }

  async update(
    id: number,
    dto: { title: string; content: string },
    instructorEmail: string,
  ): Promise<Lltannouncement> {
    const announcement = await this.announcementRepo.findOne({ where: { id } });
    if (!announcement) {
      throw new NotFoundException(`ไม่พบประกาศ ID ${id}`);
    }
    announcement.title = dto.title;
    announcement.content = dto.content;
    announcement.updateUser = instructorEmail;
    return this.announcementRepo.save(announcement);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.announcementRepo.delete(id);
    return { deleted: (result.affected ?? 0) > 0 };
  }

  private async getEnrolledStudents(courseId: number): Promise<EnrolledStudent[]> {
    return this.dataSource.query<EnrolledStudent[]>(
      `
        SELECT DISTINCT
          u.USER_ID      AS userId,
          u.USER_EMAIL   AS email,
          u.USER_FNAMETH AS firstNameTh,
          u.USER_LNAMETH AS lastNameTh
        FROM LLTENROLL e
        JOIN LLTUMUSER u ON u.USER_ID = e.USER_ID
        WHERE e.COSE_ID = ?
          AND COALESCE(u.USER_STATUS, '') = 'A'
      `,
      [courseId],
    );
  }
}
