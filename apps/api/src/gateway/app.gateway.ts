// apps/api/src/gateway/app.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
  namespace: '/ws',
})
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(AppGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(private jwtService: JwtService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      this.connectedUsers.set(payload.sub, client.id);
      client.join(`user:${payload.sub}`);
      this.logger.log(`Client connected: ${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.connectedUsers.delete(client.data.userId);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ─── Class Room ───────────────────────────────────

  @SubscribeMessage('join-class')
  handleJoinClass(@ConnectedSocket() client: Socket, @MessageBody() classId: string) {
    client.join(`class:${classId}`);
    return { event: 'joined', data: classId };
  }

  @SubscribeMessage('leave-class')
  handleLeaveClass(@ConnectedSocket() client: Socket, @MessageBody() classId: string) {
    client.leave(`class:${classId}`);
  }

  // ─── Discussion ───────────────────────────────────

  @SubscribeMessage('send-message')
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: { channelId: string; content: string }) {
    this.server.to(`channel:${data.channelId}`).emit('new-message', {
      senderId: client.data.userId,
      content: data.content,
      timestamp: new Date(),
    });
  }

  @SubscribeMessage('join-channel')
  handleJoinChannel(@ConnectedSocket() client: Socket, @MessageBody() channelId: string) {
    client.join(`channel:${channelId}`);
  }

  // ─── Live Session ─────────────────────────────────

  @SubscribeMessage('join-session')
  handleJoinSession(@ConnectedSocket() client: Socket, @MessageBody() sessionId: string) {
    client.join(`session:${sessionId}`);
    client.to(`session:${sessionId}`).emit('user-joined', { userId: client.data.userId });
  }

  @SubscribeMessage('raise-hand')
  handleRaiseHand(@ConnectedSocket() client: Socket, @MessageBody() sessionId: string) {
    this.server.to(`session:${sessionId}`).emit('hand-raised', { userId: client.data.userId });
  }

  // ─── Emit helpers ─────────────────────────────────

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToClass(classId: string, event: string, data: any) {
    this.server.to(`class:${classId}`).emit(event, data);
  }

  emitToChannel(channelId: string, event: string, data: any) {
    this.server.to(`channel:${channelId}`).emit(event, data);
  }

  emitNotification(userId: string, notification: any) {
    this.emitToUser(userId, 'notification', notification);
  }
}
