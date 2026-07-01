// apps/api/src/leetcode/leetcode.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { LeetcodeController } from './leetcode.controller';
import { LeetcodeService } from './leetcode.service';
import { LeetcodeSyncProcessor } from './processor/leetcode-sync.processor';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'leetcode-sync' }),
    GamificationModule,
  ],
  controllers: [LeetcodeController],
  providers: [LeetcodeService, LeetcodeSyncProcessor],
  exports: [LeetcodeService],
})
export class LeetcodeModule {}
