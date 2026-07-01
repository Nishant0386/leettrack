// apps/api/src/leetcode/leetcode.controller.ts
import { Controller, Get, Post, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LeetcodeService } from './leetcode.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('leetcode')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leetcode')
export class LeetcodeController {
  constructor(
    private leetcodeService: LeetcodeService,
    private prisma: PrismaService,
  ) {}

  @Get('my-data')
  @ApiOperation({ summary: "Get current student's LeetCode data with growth metrics" })
  async getMyData(@CurrentUser() user: any) {
    const student = await this.prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!student) throw new NotFoundException('Student profile not found');
    return this.leetcodeService.getStudentLeetcodeData(student.id);
  }

  @Get('profile/:username')
  @ApiOperation({ summary: 'Get any public LeetCode profile by username' })
  getProfile(@Param('username') username: string) {
    return this.leetcodeService.fetchPublicProfile(username);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Force a manual LeetCode sync for current student' })
  async forceSync(@CurrentUser() user: any) {
    const student = await this.prisma.studentProfile.findUnique({ where: { userId: user.id } });
    if (!student?.leetcodeUsername) throw new NotFoundException('LeetCode not connected');
    return this.leetcodeService.takeSnapshot(student.id, student.leetcodeUsername);
  }

  @Get('growth/:studentId')
  @ApiOperation({ summary: 'Get growth metrics for a specific student' })
  getGrowth(@Param('studentId') studentId: string) {
    return this.leetcodeService.getGrowthMetrics(studentId);
  }
}
