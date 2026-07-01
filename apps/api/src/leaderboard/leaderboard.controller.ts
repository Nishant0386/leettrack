// apps/api/src/leaderboard/leaderboard.controller.ts
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('leaderboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private leaderboardService: LeaderboardService) {}

  @Get(':classId')
  @ApiQuery({ name: 'period', enum: ['daily', 'weekly', 'monthly', 'semester'], required: false })
  @ApiOperation({ summary: 'Get class leaderboard for a given period' })
  get(@Param('classId') classId: string, @Query('period') period?: 'daily' | 'weekly' | 'monthly' | 'semester') {
    return this.leaderboardService.getLeaderboard(classId, period || 'semester');
  }
}
