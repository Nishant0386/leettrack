// apps/api/src/live-sessions/live-sessions.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GamificationService } from '../gamification/gamification.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class LiveSessionsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private email: EmailService,
    private notifications: NotificationsService,
    private gamification: GamificationService,
  ) {}

  private buildJitsiUrl(meetingId: string): string {
    const domain = this.config.get('JITSI_DOMAIN', 'meet.jit.si');
    return `https://${domain}/${meetingId}`;
  }

  async create(dto: CreateSessionDto) {
    const meetingId = `leettrack-${randomUUID().slice(0, 12)}`;
    const session = await this.prisma.liveSession.create({
      data: {
        classId: dto.classId,
        title: dto.title,
        description: dto.description,
        scheduledAt: new Date(dto.scheduledAt),
        duration: dto.duration,
        meetingId,
        meetingUrl: this.buildJitsiUrl(meetingId),
      },
    });

    // Notify all enrolled students
    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId: dto.classId, isActive: true },
      include: { student: { include: { user: true } } },
    });

    const klass = await this.prisma.class.findUnique({ where: { id: dto.classId } });

    for (const e of enrollments) {
      await this.notifications.create(e.student.userId, {
        type: 'LIVE_CLASS',
        title: 'New Live Class Scheduled',
        message: `"${dto.title}" scheduled for ${new Date(dto.scheduledAt).toLocaleString()}`,
      });
    }

    // Send email reminders (best-effort, doesn't block)
    if (klass) {
      this.email
        .sendLiveClassNotification(
          enrollments.map((e) => e.student.user.email),
          klass.name,
          new Date(dto.scheduledAt),
          session.meetingUrl!,
        )
        .catch(() => null);
    }

    return session;
  }

  async listForClass(classId: string) {
    return this.prisma.liveSession.findMany({
      where: { classId },
      orderBy: { scheduledAt: 'desc' },
      include: { _count: { select: { attendanceRecords: true } } },
    });
  }

  async start(id: string) {
    return this.prisma.liveSession.update({
      where: { id },
      data: { status: 'LIVE' },
    });
  }

  async end(id: string) {
    const session = await this.prisma.liveSession.update({
      where: { id },
      data: { status: 'COMPLETED' },
    });

    // Award XP + finalize attendance for everyone who joined
    const attendance = await this.prisma.attendanceRecord.findMany({
      where: { sessionId: id, isPresent: true },
    });
    for (const record of attendance) {
      await this.gamification.awardXP(record.studentId, 'ATTENDED_CLASS');
    }

    return session;
  }

  async joinSession(sessionId: string, studentId: string) {
    const session = await this.prisma.liveSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.status === 'COMPLETED' || session.status === 'CANCELLED') {
      throw new BadRequestException('This session has ended');
    }

    const record = await this.prisma.attendanceRecord.upsert({
      where: { sessionId_studentId: { sessionId, studentId } },
      update: { joinedAt: new Date(), isPresent: true },
      create: { sessionId, studentId, joinedAt: new Date(), isPresent: true },
    });

    return { ...record, meetingUrl: session.meetingUrl };
  }

  async leaveSession(sessionId: string, studentId: string) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { sessionId_studentId: { sessionId, studentId } },
    });
    if (!record?.joinedAt) return record;

    const duration = Math.floor((Date.now() - record.joinedAt.getTime()) / 1000);
    return this.prisma.attendanceRecord.update({
      where: { sessionId_studentId: { sessionId, studentId } },
      data: { leftAt: new Date(), duration },
    });
  }

  async cancel(id: string) {
    return this.prisma.liveSession.update({ where: { id }, data: { status: 'CANCELLED' } });
  }
}
