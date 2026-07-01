// apps/api/src/messages/messages.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { SendMessageDto } from './dto/send-message.dto';
import { CreatePostDto } from './dto/create-post.dto';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private gateway: AppGateway,
    private notifications: NotificationsService,
  ) {}

  // ─── Direct Messages ──────────────────────────────

  async sendDirectMessage(senderId: string, dto: SendMessageDto) {
    const message = await this.prisma.message.create({
      data: { senderId, receiverId: dto.receiverId, content: dto.content },
    });

    this.gateway.emitToUser(dto.receiverId, 'new-direct-message', message);
    await this.notifications.create(dto.receiverId, {
      type: 'MESSAGE',
      title: 'New Message',
      message: dto.content.slice(0, 100),
    });

    return message;
  }

  async getConversation(userId: string, otherUserId: string) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getConversationsList(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
        receiver: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    const conversationMap = new Map<string, any>();
    for (const msg of messages) {
      const other = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationMap.has(other.id)) {
        conversationMap.set(other.id, { user: other, lastMessage: msg });
      }
    }
    return Array.from(conversationMap.values());
  }

  async markAsRead(messageId: string) {
    return this.prisma.message.update({ where: { id: messageId }, data: { isRead: true } });
  }

  // ─── Discussion Channels ──────────────────────────

  async createChannel(classId: string, name: string, topic?: string) {
    return this.prisma.discussionChannel.create({ data: { classId, name, topic } });
  }

  async listChannels(classId: string) {
    return this.prisma.discussionChannel.findMany({ where: { classId } });
  }

  async createPost(channelId: string, authorId: string, dto: CreatePostDto) {
    const post = await this.prisma.discussionPost.create({
      data: {
        channelId,
        authorId,
        content: dto.content,
        fileUrl: dto.fileUrl,
        codeSnippet: dto.codeSnippet,
      },
      include: { author: { select: { name: true, avatarUrl: true, role: true } } },
    });

    this.gateway.emitToChannel(channelId, 'new-discussion-post', post);
    return post;
  }

  async getPosts(channelId: string) {
    return this.prisma.discussionPost.findMany({
      where: { channelId },
      include: { author: { select: { name: true, avatarUrl: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  // ─── Announcements ─────────────────────────────────

  async createAnnouncement(classId: string, title: string, content: string) {
    const announcement = await this.prisma.announcement.create({
      data: { classId, title, content },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId, isActive: true },
      include: { student: true },
    });

    await this.notifications.createBulk(
      enrollments.map((e) => e.student.userId),
      { type: 'ANNOUNCEMENT', title, message: content.slice(0, 150) },
    );

    this.gateway.emitToClass(classId, 'new-announcement', announcement);
    return announcement;
  }

  async listAnnouncements(classId: string) {
    return this.prisma.announcement.findMany({
      where: { classId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
