// apps/api/src/ai-insights/ai-insights.controller.ts
import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AiInsightsService } from './ai-insights.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('ai-insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai-insights')
export class AiInsightsController {
  constructor(private aiInsightsService: AiInsightsService) {}

  @Post('generate/:studentId')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Generate AI insight for a student in a class' })
  generate(@Param('studentId') studentId: string, @Query('classId') classId: string) {
    return this.aiInsightsService.generateAndStoreInsight(studentId, classId);
  }

  @Get('class/:classId/summary')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get class-wide AI insights summary (risk levels, avg score)' })
  getClassSummary(@Param('classId') classId: string) {
    return this.aiInsightsService.getClassInsightsSummary(classId);
  }
}
