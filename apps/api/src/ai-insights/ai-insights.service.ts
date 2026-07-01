// apps/api/src/ai-insights/ai-insights.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RiskLevel } from '@prisma/client';

interface PerformanceData {
  totalSolved: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
  attendancePercent: number;
  assignmentCompletion: number;
  daysInactive: number;
  streak: number;
}

@Injectable()
export class AiInsightsService {
  private readonly logger = new Logger(AiInsightsService.name);

  constructor(private prisma: PrismaService) {}

  // ─── Performance Score (0-100) ────────────────────

  calculatePerformanceScore(data: PerformanceData): number {
    const problemScore = Math.min(data.totalSolved / 5, 40); // 40% weight, cap at 200 solved
    const growthScore = Math.min((data.weeklyGrowth / 10) * 20, 20); // 20% weight
    const attendanceScore = (data.attendancePercent / 100) * 15; // 15% weight
    const assignmentScore = (data.assignmentCompletion / 100) * 15; // 15% weight
    const consistencyScore = Math.min(data.streak * 2, 10); // 10% weight

    return Math.round(problemScore + growthScore + attendanceScore + assignmentScore + consistencyScore);
  }

  // ─── Risk Detection ───────────────────────────────

  detectRisk(data: PerformanceData): RiskLevel {
    let riskScore = 0;

    if (data.daysInactive >= 7) riskScore += 3;
    if (data.daysInactive >= 3) riskScore += 1;
    if (data.attendancePercent < 50) riskScore += 3;
    if (data.attendancePercent < 70) riskScore += 1;
    if (data.assignmentCompletion < 50) riskScore += 2;
    if (data.weeklyGrowth === 0) riskScore += 2;
    if (data.monthlyGrowth < 0) riskScore += 3;

    if (riskScore >= 6) return RiskLevel.AT_RISK;
    if (riskScore >= 3) return RiskLevel.NEEDS_ATTENTION;
    return RiskLevel.HEALTHY;
  }

  // ─── Generate Insights ────────────────────────────

  generateInsights(data: PerformanceData, studentName: string): string[] {
    const insights: string[] = [];

    if (data.daysInactive >= 7) {
      insights.push(`⚠️ ${studentName} has been inactive for ${data.daysInactive} days`);
    }
    if (data.weeklyGrowth >= 10) {
      insights.push(`🚀 ${studentName}'s growth increased by ${data.weeklyGrowth} problems this week`);
    }
    if (data.attendancePercent < 60) {
      insights.push(`📉 ${studentName}'s attendance is below threshold (${data.attendancePercent}%)`);
    }
    if (data.streak >= 7) {
      insights.push(`🔥 ${studentName} is on a ${data.streak}-day streak — keep it up!`);
    }
    if (data.assignmentCompletion < 50) {
      insights.push(`📋 ${studentName} has low assignment completion (${data.assignmentCompletion}%)`);
    }
    if (data.monthlyGrowth > 30) {
      insights.push(`⭐ ${studentName} is a top performer this month (+${data.monthlyGrowth} problems)`);
    }

    if (insights.length === 0) {
      insights.push(`✅ ${studentName} is performing well — maintain consistency`);
    }

    return insights;
  }

  // ─── AI Predictions ───────────────────────────────

  generatePredictions(data: PerformanceData, daysRemaining: number) {
    const dailyRate = data.weeklyGrowth / 7;
    const expectedAdditional = Math.round(dailyRate * daysRemaining);
    const expectedTotal = data.totalSolved + expectedAdditional;

    let expectedPerformance = 'Average';
    const score = this.calculatePerformanceScore(data);
    if (score >= 80) expectedPerformance = 'Excellent';
    else if (score >= 60) expectedPerformance = 'Good';
    else if (score < 40) expectedPerformance = 'Needs Improvement';

    return {
      expectedProblemsAtSemesterEnd: expectedTotal,
      expectedGrowthRate: dailyRate * 30,
      expectedPerformance,
      confidence: data.weeklyGrowth > 0 ? 'High' : 'Low',
    };
  }

  // ─── Generate & Store AI Insights for Student ────

  async generateAndStoreInsight(studentId: string, classId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        leetcodeSnapshots: { orderBy: { snapshotDate: 'desc' }, take: 30 },
        attendanceRecords: true,
        assignments: true,
      },
    });

    if (!student) return null;

    // Calculate attendance
    const totalSessions = student.attendanceRecords.length;
    const attended = student.attendanceRecords.filter((a) => a.isPresent).length;
    const attendancePercent = totalSessions > 0 ? (attended / totalSessions) * 100 : 0;

    // Calculate assignment completion
    const totalAssignments = student.assignments.length;
    const submitted = student.assignments.filter(
      (a) => a.status === 'SUBMITTED' || a.status === 'GRADED',
    ).length;
    const assignmentCompletion = totalAssignments > 0 ? (submitted / totalAssignments) * 100 : 0;

    // Latest snapshot
    const latest = student.leetcodeSnapshots[0];
    const weekAgo = student.leetcodeSnapshots.find(
      (s) => (Date.now() - s.snapshotDate.getTime()) / 86400000 >= 7,
    );
    const monthAgo = student.leetcodeSnapshots.find(
      (s) => (Date.now() - s.snapshotDate.getTime()) / 86400000 >= 30,
    );

    const lastSnapshot = student.leetcodeSnapshots[0];
    const daysInactive = lastSnapshot
      ? Math.floor((Date.now() - lastSnapshot.snapshotDate.getTime()) / 86400000)
      : 999;

    const perfData: PerformanceData = {
      totalSolved: latest?.totalSolved || 0,
      weeklyGrowth: weekAgo ? (latest?.totalSolved || 0) - weekAgo.totalSolved : 0,
      monthlyGrowth: monthAgo ? (latest?.totalSolved || 0) - monthAgo.totalSolved : 0,
      attendancePercent: Math.round(attendancePercent),
      assignmentCompletion: Math.round(assignmentCompletion),
      daysInactive,
      streak: 0,
    };

    const score = this.calculatePerformanceScore(perfData);
    const riskLevel = this.detectRisk(perfData);
    const insights = this.generateInsights(perfData, student.user.name);
    const predictions = this.generatePredictions(perfData, 90);

    return this.prisma.aiInsight.upsert({
      where: { studentId_classId: { studentId, classId } },
      update: { score, riskLevel, insights, predictions },
      create: {
        studentId,
        classId,
        score,
        riskLevel,
        insights,
        predictions,
      },
    });
  }

  // ─── Class-Level Summary ──────────────────────────

  async getClassInsightsSummary(classId: string) {
    const insights = await this.prisma.aiInsight.findMany({
      where: { classId },
    });

    const healthy = insights.filter((i) => i.riskLevel === 'HEALTHY').length;
    const needsAttention = insights.filter((i) => i.riskLevel === 'NEEDS_ATTENTION').length;
    const atRisk = insights.filter((i) => i.riskLevel === 'AT_RISK').length;
    const avgScore = insights.reduce((a, b) => a + b.score, 0) / (insights.length || 1);

    return {
      totalStudents: insights.length,
      healthy,
      needsAttention,
      atRisk,
      avgScore: Math.round(avgScore),
      allInsights: insights.flatMap((i) => i.insights as string[]),
    };
  }
}
