// apps/api/src/leetcode/leetcode.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';

@Injectable()
export class LeetcodeService {
  private readonly logger = new Logger(LeetcodeService.name);

  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
    @InjectQueue('leetcode-sync') private syncQueue: Queue,
  ) {}

  // ─── GraphQL Queries ──────────────────────────────

  private async graphqlQuery<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
    const res = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0].message);
    return json.data;
  }

  async fetchPublicProfile(username: string) {
    const cacheKey = `leetcode:profile:${username}`;
    const cached = await this.cache.get<any>(cacheKey);
    if (cached) return cached;

    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            realName
            userAvatar
            ranking
            reputation
            solutionCount
          }
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          userCalendar {
            streak
            totalActiveDays
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
        }
      }
    `;

    const data = await this.graphqlQuery<any>(query, { username });
    const result = this.normalizeProfile(data);

    await this.cache.set(cacheKey, result, 300); // 5 min cache
    return result;
  }

  private normalizeProfile(data: any) {
    const user = data.matchedUser;
    if (!user) return null;

    const stats = user.submitStats?.acSubmissionNum || [];
    const getCount = (diff: string) =>
      stats.find((s: any) => s.difficulty === diff)?.count || 0;

    const easy = getCount('Easy');
    const medium = getCount('Medium');
    const hard = getCount('Hard');
    const allCount = getCount('All');
    // LeetCode's GraphQL API includes an 'All' entry that sums easy+medium+hard;
    // fall back to manual sum if it's missing for any reason
    const totalSolved = allCount || easy + medium + hard;

    return {
      username: user.username,
      avatar: user.profile?.userAvatar,
      ranking: user.profile?.ranking,
      reputation: user.profile?.reputation,
      totalSolved,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
      streak: user.userCalendar?.streak || 0,
      totalActiveDays: user.userCalendar?.totalActiveDays || 0,
      contestRating: data.userContestRanking?.rating,
      contestsAttended: data.userContestRanking?.attendedContestsCount,
    };
  }

  // ─── Snapshot Engine ──────────────────────────────

  async takeSnapshot(studentId: string, username: string) {
    const profile = await this.fetchPublicProfile(username);
    if (!profile) return null;

    return this.prisma.leetcodeSnapshot.create({
      data: {
        studentId,
        totalSolved: profile.totalSolved,
        easySolved: profile.easySolved,
        mediumSolved: profile.mediumSolved,
        hardSolved: profile.hardSolved,
        ranking: profile.ranking,
        reputation: profile.reputation,
        contestRating: profile.contestRating,
        contestsAttended: profile.contestsAttended,
      },
    });
  }

  async getGrowthMetrics(studentId: string) {
    const snapshots = await this.prisma.leetcodeSnapshot.findMany({
      where: { studentId },
      orderBy: { snapshotDate: 'desc' },
      take: 90,
    });

    if (snapshots.length < 2) return { daily: 0, weekly: 0, monthly: 0 };

    const latest = snapshots[0];
    const dayAgo = snapshots.find((s) => this.daysAgo(s.snapshotDate) >= 1);
    const weekAgo = snapshots.find((s) => this.daysAgo(s.snapshotDate) >= 7);
    const monthAgo = snapshots.find((s) => this.daysAgo(s.snapshotDate) >= 30);

    return {
      daily: dayAgo ? latest.totalSolved - dayAgo.totalSolved : 0,
      weekly: weekAgo ? latest.totalSolved - weekAgo.totalSolved : 0,
      monthly: monthAgo ? latest.totalSolved - monthAgo.totalSolved : 0,
      snapshots: snapshots.map((s) => ({
        date: s.snapshotDate,
        totalSolved: s.totalSolved,
        easySolved: s.easySolved,
        mediumSolved: s.mediumSolved,
        hardSolved: s.hardSolved,
      })),
    };
  }

  private daysAgo(date: Date): number {
    return (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  }

  // ─── Scheduled Sync (every 6 hours) ───────────────

  @Cron(CronExpression.EVERY_6_HOURS)
  async scheduledSync() {
    this.logger.log('Starting scheduled LeetCode sync...');

    const students = await this.prisma.studentProfile.findMany({
      where: { leetcodeVerified: true, leetcodeUsername: { not: null } },
      select: { id: true, leetcodeUsername: true },
    });

    for (const student of students) {
      await this.syncQueue.add('sync-student', {
        studentId: student.id,
        username: student.leetcodeUsername,
      }, { attempts: 3, backoff: 5000 });
    }

    this.logger.log(`Queued ${students.length} students for sync`);
  }

  async getStudentLeetcodeData(studentId: string) {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      select: { leetcodeUsername: true, leetcodeVerified: true },
    });

    if (!profile?.leetcodeVerified || !profile.leetcodeUsername) {
      return null;
    }

    const [liveData, growthMetrics] = await Promise.all([
      this.fetchPublicProfile(profile.leetcodeUsername),
      this.getGrowthMetrics(studentId),
    ]);

    return { ...liveData, ...growthMetrics };
  }
}
