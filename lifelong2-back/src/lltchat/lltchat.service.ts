import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLltchatDto } from './dto/create-lltchat.dto';
import { UpdateLltchatDto } from './dto/update-lltchat.dto';
import { Lltchat } from './entities/lltchat.entity';
import { ChatGateway } from './chat-gateway';
import { LltEnroll } from '../lltenroll/entities/llt-enroll.entity';

@Injectable()
export class LltchatService {
  constructor(
    @InjectRepository(Lltchat)
    private readonly lltchatRepository: Repository<Lltchat>,
    @InjectRepository(LltEnroll)
    private readonly enrollRepository: Repository<LltEnroll>,
    private readonly chatGateway: ChatGateway,
  ) {}

  async verifyChatAccess(chatId: number, userId: number | null): Promise<void> {
    const chat = await this.lltchatRepository.findOneBy({ id: chatId });
    if (!chat?.enrollId) return;
    await this.verifyEnrollmentOwnership(chat.enrollId, userId);
  }

  async verifyEnrollmentOwnership(enrollId: number, userId: number | null): Promise<void> {
    if (userId == null) throw new ForbiddenException();
    const rows = await this.enrollRepository.manager.query<Array<{ cnt: number | string }>>(
      'SELECT COUNT(*) AS cnt FROM LLTENROLL WHERE ENROLL_ID = ? AND USER_ID = ?',
      [enrollId, userId],
    );
    if (Number(rows[0]?.cnt ?? 0) === 0) throw new ForbiddenException();
  }

  async create(
    createLltchatDto: CreateLltchatDto,
    senderLltumId?: number | null,
    senderUsername?: string,
  ): Promise<Lltchat> {
    const chat = this.lltchatRepository.create({
      ...createLltchatDto,
      sender: senderLltumId ?? createLltchatDto.sender,
      userId: createLltchatDto.userId ?? senderUsername ?? null,
      chatTime: createLltchatDto.chatTime ? new Date(createLltchatDto.chatTime) : new Date(),
      createUser: createLltchatDto.createUser || senderUsername || 'SYSTEM',
      createDate: createLltchatDto.createDate ? new Date(createLltchatDto.createDate) : new Date(),
      updateUser: createLltchatDto.updateUser || senderUsername || 'SYSTEM',
      updateDate: createLltchatDto.updateDate ? new Date(createLltchatDto.updateDate) : new Date(),
      updateProgram: createLltchatDto.updateProgram || 'lltchat',
    });
    const saved = await this.lltchatRepository.save(chat);

    if (saved.enrollId) {
      // Fetch enrollment to get courseId and learnerUserId
      const enroll = await this.enrollRepository.findOne({
        where: { id: saved.enrollId },
      });

      if (enroll) {
        // Notify clients in real-time
        this.chatGateway.notifyNewMessage(saved.enrollId, {
          id: saved.id,
          sender: saved.typeSender === 'T' ? 'instructor' : 'learner',
          body: saved.message ?? '',
          sentAt: saved.chatTime ?? new Date(),
          status: saved.status as 'sent' | 'read',
          courseId: enroll.courseId,
          learnerUserId: enroll.userId,
        });
      }
    }

    return saved;
  }

  async findAll(): Promise<Lltchat[]> {
    return this.lltchatRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findByEnrollId(enrollId: number): Promise<Lltchat[]> {
    const chats = await this.lltchatRepository.find({
      where: { enrollId },
      order: {
        chatTime: 'ASC',
      },
    });

    const unreadInstructorChats = chats.filter((c) => c.typeSender === 'T' && c.status !== 'R');
    if (unreadInstructorChats.length > 0) {
      for (const chat of unreadInstructorChats) {
        chat.status = 'R';
        chat.updateDate = new Date();
      }
      await this.lltchatRepository.save(unreadInstructorChats);
      this.chatGateway.notifyMessagesRead(enrollId, 'instructor');
    }

    return chats;
  }

  async findOne(id: number): Promise<Lltchat> {
    const chat = await this.lltchatRepository.findOneBy({ id });
    if (!chat) {
      throw new NotFoundException(`Chat message with ID ${id} not found`);
    }
    return chat;
  }

  async update(id: number, updateLltchatDto: UpdateLltchatDto): Promise<Lltchat> {
    const chat = await this.findOne(id);

    // Update fields manually to avoid overwriting dates if not provided
    Object.assign(chat, {
      ...updateLltchatDto,
      chatTime: updateLltchatDto.chatTime ? new Date(updateLltchatDto.chatTime) : chat.chatTime,
      updateUser: updateLltchatDto.updateUser || 'SYSTEM',
      updateDate: new Date(),
      updateProgram: updateLltchatDto.updateProgram || 'lltchat',
    });

    return this.lltchatRepository.save(chat);
  }

  async remove(id: number): Promise<{ success: boolean; message: string }> {
    const chat = await this.findOne(id);
    await this.lltchatRepository.remove(chat);
    return {
      success: true,
      message: `Chat message with ID ${id} has been deleted successfully`,
    };
  }
}
