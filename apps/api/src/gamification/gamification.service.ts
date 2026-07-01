// apps/api/src/gamification/gamification.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppGateway } from '../gateway/app.gateway';
import { BadgeType } from '@prisma/client';

const XP_REWARDS = {
  PROBLEM_SOLVED: 10,
  ATTENDED_CLASS: 20,
  ASSIGNMENT_SUBMITTED: 15,
  STREAK_DAY: 5,
  HARD_PROBLEM: 25,
};

const LEVELS = [
  { name: 'Beginner', minXP: 0 },
  { name: 'Learner', minXP: 200 },
  { name: 'Explorer', minXP: 500 },
  { name: 'Problem Solver', minXP: 1000 },
  { name: 'DSA Master', minXP: 2500 },
  { name: 'Algorithm Expert', minXP: 5000 },
];

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    private prisma: PrismaService,
    private gateway: AppGateway,
  ) {}

  getLevelFromXP(xp: number): string {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].minXP) return LEVELS[i].name;
    }
    return 'Beginner';
  }

  async awardXP(studentId: string, type: keyof typeof XP_REWARDS, multiplier = 1) {
    const points = XP_REWARDS[type] * multiplier;
    const updated = await this.prisma.studentProfile.update({
      where: { id: studentId },
      data: { xpPoints: { increment: points } },
    });

    const newLevel = this.getLevelFromXP(updated.xpPoints);
    if (newLevel !== updated.level) {
      await this.prisma.studentProfile.update({
        where: { id: studentId },
        data: { level: newLevel },
      });
      // Notify level up
      this.gateway.emitToUser(updated.userId, 'level-up', { level: newLevel, xp: updated.xpPoints });
    }

    return { xpGained: points, totalXP: updated.xpPoints + points };
  }

  async checkAndAwardBadges(studentId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        leetcodeSnapshots: { orderBy: { snapshotDate: 'desc' }, take: 1 },
        badges: true,
      },
    });
    if (!student) return;

    const earned = new Set(student.badges.map((b) => b.badge));
    const latest = student.leetcodeSnapshots[0];
    const toAward: BadgeType[] = [];

    // Check badges
    if (!earned.has('FIRST_PROBLEM') && latest?.totalSolved >= 1) toAward.push('FIRST_PROBLEM');
    if (!earned.has('PROBLEMS_100') && latest?.totalSolved >= 100) toAward.push('PROBLEMS_100');
    if (!earned.has('PROBLEMS_500') && latest?.totalSolved >= 500) toAward.push('PROBLEMS_500');
    if (!earned.has('HARD_CHAMPION') && latest?.hardSolved >= 50) toAward.push('HARD_CHAMPION');

    if (toAward.length > 0) {
      await this.prisma.studentBadge.createMany({
        data: toAward.map((badge) => ({ studentId, badge })),
      });

      // Notify user
      this.gateway.emitToUser(student.userId, 'badges-earned', { badges: toAward });
      this.logger.log(`Awarded badges to ${studentId}: ${toAward.join(', ')}`);
    }
  }

  async updateLeaderboard(classId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId, isActive: true },
      include: {
        student: {
          include: {
            leetcodeSnapshots: { orderBy: { snapshotDate: 'desc' }, take: 1 },
          },
        },
      },
    });

    const sorted = [...enrollments].sort(
      (a, b) =>
        (b.student.leetcodeSnapshots[0]?.totalSolved || 0) -
        (a.student.leetcodeSnapshots[0]?.totalSolved || 0),
    );

    for (let i = 0; i < sorted.length; i++) {
      const s = sorted[i];
      await this.prisma.leaderboardEntry.upsert({
        where: { classId_studentId_period: { classId, studentId: s.studentId, period: 'semester' } },
        update: {
          rank: i + 1,
          score: s.student.leetcodeSnapshots[0]?.totalSolved || 0,
          xpPoints: s.student.xpPoints,
        },
        create: {
          classId,
          studentId: s.studentId,
          period: 'semester',
          rank: i + 1,
          score: s.student.leetcodeSnapshots[0]?.totalSolved || 0,
          xpPoints: s.student.xpPoints,
        },
      });
    }
  }
}
