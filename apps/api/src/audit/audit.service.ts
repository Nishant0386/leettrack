// apps/api/src/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string, action: string, resource: string, metadata?: Record<string, any>, ipAddress?: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, resource, metadata, ipAddress },
    });
  }

  async getRecentLogs(limit = 100) {
    return this.prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getLogsForUser(userId: string, limit = 50) {
    return this.prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
