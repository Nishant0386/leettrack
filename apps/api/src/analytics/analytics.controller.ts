// apps/api/src/analytics/analytics.controller.ts
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('class/:classId')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get full class analytics dashboard data' })
  getClassDashboard(@Param('classId') classId: string) {
    return this.analyticsService.getClassDashboard(classId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get detailed analytics for one student' })
  getStudentDetail(@Param('studentId') studentId: string, @Query('classId') classId: string) {
    return this.analyticsService.getStudentDetailedAnalytics(studentId, classId);
  }
}
