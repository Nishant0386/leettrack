// apps/api/src/analytics/analytics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async getClassDashboard(classId: string) {
    const cacheKey = `analytics:class:${classId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const [students, snapshots, sessions, assignments] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { classId, isActive: true },
        include: {
          student: {
            include: {
              user: true,
              leetcodeSnapshots: { orderBy: { snapshotDate: 'desc' }, take: 31 },
              attendanceRecords: true,
              assignments: true,
              badges: true,
            },
          },
        },
      }),
      this.prisma.leetcodeSnapshot.findMany({
        where: {
          student: { enrollments: { some: { classId } } },
          snapshotDate: { gte: new Date(Date.now() - 30 * 86400000) },
        },
        orderBy: { snapshotDate: 'asc' },
      }),
      this.prisma.liveSession.findMany({
        where: { classId },
        include: { attendanceRecords: true },
        orderBy: { scheduledAt: 'desc' },
        take: 10,
      }),
      this.prisma.assignment.findMany({
        where: { classId },
        include: { submissions: true },
      }),
    ]);

    const studentData = students.map(({ student }) => {
      const latestSnap = student.leetcodeSnapshots[0];
      const weekAgoSnap = student.leetcodeSnapshots.find(
        (s) => (Date.now() - s.snapshotDate.getTime()) / 86400000 >= 7,
      );
      const monthAgoSnap = student.leetcodeSnapshots.find(
        (s) => (Date.now() - s.snapshotDate.getTime()) / 86400000 >= 30,
      );

      const totalSessions = student.attendanceRecords.length;
      const attended = student.attendanceRecords.filter((a) => a.isPresent).length;
      const attendancePercent = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;

      const totalAssignments = student.assignments.length;
      const submitted = student.assignments.filter(
        (a) => a.status === 'SUBMITTED' || a.status === 'GRADED',
      ).length;
      const assignmentCompletion = totalAssignments > 0 ? Math.round((submitted / totalAssignments) * 100) : 0;

      return {
        id: student.id,
        name: student.user.name,
        email: student.user.email,
        avatar: student.user.avatarUrl,
        leetcodeUsername: student.leetcodeUsername,
        totalSolved: latestSnap?.totalSolved || 0,
        easySolved: latestSnap?.easySolved || 0,
        mediumSolved: latestSnap?.mediumSolved || 0,
        hardSolved: latestSnap?.hardSolved || 0,
        dailyGrowth: 0,
        weeklyGrowth: weekAgoSnap ? (latestSnap?.totalSolved || 0) - weekAgoSnap.totalSolved : 0,
        monthlyGrowth: monthAgoSnap ? (latestSnap?.totalSolved || 0) - monthAgoSnap.totalSolved : 0,
        attendancePercent,
        assignmentCompletion,
        lastActive: latestSnap?.snapshotDate || null,
        badgeCount: student.badges.length,
        xpPoints: student.xpPoints,
      };
    });

    const totalSolved = studentData.reduce((a, b) => a + b.totalSolved, 0);
    const avgSolved = studentData.length > 0 ? Math.round(totalSolved / studentData.length) : 0;
    const avgGrowth = studentData.length > 0
      ? Math.round(studentData.reduce((a, b) => a + b.weeklyGrowth, 0) / studentData.length) : 0;
    const avgAttendance = studentData.length > 0
      ? Math.round(studentData.reduce((a, b) => a + b.attendancePercent, 0) / studentData.length) : 0;

    // Active = solved at least 1 problem in last 7 days
    const activeStudents = studentData.filter((s) => s.weeklyGrowth > 0).length;
    const inactiveStudents = studentData.length - activeStudents;

    // Difficulty distribution (class-wide)
    const easyTotal = studentData.reduce((a, b) => a + b.easySolved, 0);
    const mediumTotal = studentData.reduce((a, b) => a + b.mediumSolved, 0);
    const hardTotal = studentData.reduce((a, b) => a + b.hardSolved, 0);

    // Leaderboard
    const leaderboard = [...studentData]
      .sort((a, b) => b.totalSolved - a.totalSolved)
      .map((s, i) => ({ rank: i + 1, ...s }));

    // Daily activity (last 30 days)
    const dailyActivity = this.buildDailyActivity(snapshots);

    // Upcoming sessions
    const upcomingSessions = await this.prisma.liveSession.count({
      where: { classId, status: 'SCHEDULED', scheduledAt: { gte: new Date() } },
    });

    const result = {
      kpi: {
        totalStudents: studentData.length,
        activeStudents,
        inactiveStudents,
        totalSolved,
        avgSolved,
        avgGrowthRate: avgGrowth,
        avgAttendance,
        upcomingClasses: upcomingSessions,
      },
      difficultyDistribution: { easy: easyTotal, medium: mediumTotal, hard: hardTotal },
      dailyActivity,
      leaderboard,
      studentTable: studentData,
    };

    await this.cache.set(cacheKey, result, 600); // 10 min cache
    return result;
  }

  private buildDailyActivity(snapshots: any[]) {
    const map = new Map<string, number>();
    for (const snap of snapshots) {
      const date = snap.snapshotDate.toISOString().split('T')[0];
      map.set(date, (map.get(date) || 0) + 1);
    }
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  }

  async getStudentDetailedAnalytics(studentId: string, classId: string) {
    const [student, snapshots, attendance, assignments, aiInsight] = await Promise.all([
      this.prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: { user: true, badges: true },
      }),
      this.prisma.leetcodeSnapshot.findMany({
        where: { studentId },
        orderBy: { snapshotDate: 'asc' },
        take: 90,
      }),
      this.prisma.attendanceRecord.findMany({
        where: { studentId },
        include: { session: true },
      }),
      this.prisma.assignmentSubmission.findMany({
        where: { studentId },
        include: { assignment: true },
      }),
      this.prisma.aiInsight.findFirst({
        where: { studentId, classId },
      }),
    ]);

    return {
      student,
      snapshots,
      attendance,
      assignments,
      aiInsight,
    };
  }
}
