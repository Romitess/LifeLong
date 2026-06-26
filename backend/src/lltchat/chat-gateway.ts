import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { ALLOWED_ORIGINS } from '../config/allowed-origins';
import type { JwtPayload } from '../modules/auth/jwt-auth.guard';
import { Role } from '../modules/auth/enums/role.enum';

const INSTRUCTOR_GLOBAL_ROOM = 'instructor-global';

interface ChatSocketData {
  user?: JwtPayload;
}

@WebSocketGateway({
  cors: { origin: ALLOWED_ORIGINS },
  namespace: 'chat',
})
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket): void {
    const raw =
      (client.handshake.auth?.token as string | undefined) ??
      client.handshake.headers?.authorization;

    if (!raw) {
      this.logger.warn(`WebSocket rejected: no token (id=${client.id})`);
      client.disconnect(true);
      return;
    }

    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      (client.data as ChatSocketData).user = payload;
    } catch {
      this.logger.warn(`WebSocket rejected: invalid token (id=${client.id})`);
      client.disconnect(true);
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { enrollId: number },
  ): void {
    const roomName = `room_${payload.enrollId}`;
    void client.join(roomName);
  }

  @SubscribeMessage('joinInstructorRoom')
  handleJoinInstructorRoom(@ConnectedSocket() client: Socket): void {
    const user = (client.data as ChatSocketData).user;
    if (!user || (user.role !== Role.Instructor && user.role !== Role.Admin)) {
      client.disconnect(true);
      return;
    }
    void client.join(INSTRUCTOR_GLOBAL_ROOM);
  }

  notifyNewEnrollment(payload: {
    learnerName: string;
    courseCode: string | null;
    courseId: number;
    createdAt: Date;
  }): void {
    this.server.to(INSTRUCTOR_GLOBAL_ROOM).emit('newEnrollment', payload);
  }

  notifyNewMessage(
    enrollId: number,
    message: {
      id: number;
      sender: 'learner' | 'instructor';
      body: string;
      sentAt: Date;
      status: 'sent' | 'read';
      courseId: number;
      learnerUserId: number;
    },
  ): void {
    const roomName = `room_${enrollId}`;
    this.server.to(roomName).emit('newMessage', {
      ...message,
      enrollId,
    });
  }

  notifyMessagesRead(enrollId: number, senderType: 'learner' | 'instructor'): void {
    const roomName = `room_${enrollId}`;
    this.server.to(roomName).emit('messagesRead', { enrollId, senderType });
  }
}
