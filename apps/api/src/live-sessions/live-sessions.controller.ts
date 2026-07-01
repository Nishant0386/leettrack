// apps/api/src/live-sessions/live-sessions.controller.ts
import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LiveSessionsService } from './live-sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateSessionDto } from './dto/create-session.dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('live-sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('live-sessions')
export class LiveSessionsController {
  constructor(
    private liveSessionsService: LiveSessionsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Schedule a new live class session' })
  create(@Body() dto: CreateSessionDto) {
    return this.liveSessionsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List live sessions for a class' })
  list(@Query('classId') classId: string) {
    return this.liveSessionsService.listForClass(classId);
  }

  @Post(':id/start')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Start a live session' })
  start(@Param('id') id: string) {
    return this.liveSessionsService.start(id);
  }

  @Post(':id/end')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'End a live session and finalize attendance' })
  end(@Param('id') id: string) {
    return this.liveSessionsService.end(id);
  }

  @Post(':id/join')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Join a live session (records attendance)' })
  async join(@CurrentUser() user: any, @Param('id') id: string) {
    const student = await this.prisma.studentProfile.findUnique({ where: { userId: user.id } });
    return this.liveSessionsService.joinSession(id, student!.id);
  }

  @Post(':id/leave')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Leave a live session' })
  async leave(@CurrentUser() user: any, @Param('id') id: string) {
    const student = await this.prisma.studentProfile.findUnique({ where: { userId: user.id } });
    return this.liveSessionsService.leaveSession(id, student!.id);
  }

  @Post(':id/cancel')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Cancel a scheduled session' })
  cancel(@Param('id') id: string) {
    return this.liveSessionsService.cancel(id);
  }
}
