// apps/api/src/leetcode/processor/leetcode-sync.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { LeetcodeService } from '../leetcode.service';
import { GamificationService } from '../../gamification/gamification.service';

@Processor('leetcode-sync')
export class LeetcodeSyncProcessor {
  private readonly logger = new Logger(LeetcodeSyncProcessor.name);

  constructor(
    private leetcodeService: LeetcodeService,
    private gamificationService: GamificationService,
  ) {}

  @Process('sync-student')
  async handleSync(job: Job<{ studentId: string; username: string }>) {
    const { studentId, username } = job.data;
    try {
      await this.leetcodeService.takeSnapshot(studentId, username);
      await this.gamificationService.checkAndAwardBadges(studentId);
      this.logger.log(`Synced LeetCode data for student ${studentId} (${username})`);
    } catch (err) {
      this.logger.error(`Sync failed for ${username}: ${err.message}`);
      throw err; // triggers retry via Bull's attempts config
    }
  }
}
