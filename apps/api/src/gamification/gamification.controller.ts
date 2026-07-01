// apps/api/src/gamification/gamification.controller.ts
import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GamificationService } from './gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('gamification')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('gamification')
export class GamificationController {
  constructor(private gamificationService: GamificationService) {}

  @Post('badges/check/:studentId')
  @ApiOperation({ summary: 'Manually trigger badge check for a student' })
  checkBadges(@Param('studentId') studentId: string) {
    return this.gamificationService.checkAndAwardBadges(studentId);
  }

  @Post('leaderboard/refresh/:classId')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Refresh leaderboard for a class' })
  refreshLeaderboard(@Param('classId') classId: string) {
    return this.gamificationService.updateLeaderboard(classId);
  }
}
