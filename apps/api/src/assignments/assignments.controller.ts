// apps/api/src/assignments/assignments.controller.ts
import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(
    private assignmentsService: AssignmentsService,
    private prisma: PrismaService,
  ) {}

  @Post()
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new assignment for a class' })
  create(@Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List assignments (for class or for current student)' })
  async list(@CurrentUser() user: any, @Query('classId') classId?: string) {
    if (user.role === 'TEACHER' || user.role === 'SUPER_ADMIN') {
      return this.assignmentsService.listForClass(classId!);
    }
    const student = await this.prisma.studentProfile.findUnique({ where: { userId: user.id } });
    return this.assignmentsService.listForStudent(student!.id, classId);
  }

  @Post(':id/submit')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Submit an assignment' })
  async submit(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: SubmitAssignmentDto) {
    const student = await this.prisma.studentProfile.findUnique({ where: { userId: user.id } });
    return this.assignmentsService.submit(id, student!.id, dto);
  }

  @Post(':id/grade/:studentId')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Grade a student submission' })
  grade(@Param('id') id: string, @Param('studentId') studentId: string, @Body() dto: GradeAssignmentDto) {
    return this.assignmentsService.grade(id, studentId, dto);
  }
}
