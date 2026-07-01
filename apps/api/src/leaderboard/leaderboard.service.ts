// apps/api/src/leaderboard/leaderboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

type Period = 'daily' | 'weekly' | 'monthly' | 'semester';

@Injectable()
export class LeaderboardService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getLeaderboard(classId: string, period: Period = 'semester') {
    const cacheKey = `leaderboard:${classId}:${period}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const entries = await this.prisma.leaderboardEntry.findMany({
      where: { classId, period },
      include: {
        student: { include: { user: { select: { name: true, avatarUrl: true } } } },
      },
      orderBy: { rank: 'asc' },
      take: 50,
    });

    const result = entries.map((e) => ({
      rank: e.rank,
      studentId: e.studentId,
      name: e.student.user.name,
      avatar: e.student.user.avatarUrl,
      score: e.score,
      xpPoints: e.xpPoints,
    }));

    await this.cache.set(cacheKey, result, 300);
    return result;
  }

  async getStudentRank(classId: string, studentId: string, period: Period = 'semester') {
    const entry = await this.prisma.leaderboardEntry.findUnique({
      where: { classId_studentId_period: { classId, studentId, period } },
    });
    return entry ? { rank: entry.rank, score: entry.score } : null;
  }
}
