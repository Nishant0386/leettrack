// apps/api/src/classes/classes.controller.ts
import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateClassDto } from './dto/create-class.dto';
import { JoinClassDto } from './dto/join-class.dto';

@ApiTags('classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  @Post()
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Create a new class' })
  createClass(@CurrentUser() user: any, @Body() dto: CreateClassDto) {
    return this.classesService.createClass(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get classes for current user' })
  getMyClasses(@CurrentUser() user: any) {
    return this.classesService.getClassesForUser(user.id, user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get class details' })
  getClass(@Param('id') id: string) {
    return this.classesService.getClassById(id);
  }

  @Put(':id')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Update class' })
  updateClass(@Param('id') id: string, @Body() dto: Partial<CreateClassDto>) {
    return this.classesService.updateClass(id, dto);
  }

  @Delete(':id')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete class' })
  deleteClass(@Param('id') id: string) {
    return this.classesService.deleteClass(id);
  }

  @Post('join')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Join a class via join code or invite link' })
  joinClass(@CurrentUser() user: any, @Body() dto: JoinClassDto) {
    return this.classesService.joinClass(user.id, dto);
  }

  @Delete(':id/leave')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Leave a class' })
  leaveClass(@CurrentUser() user: any, @Param('id') classId: string) {
    return this.classesService.leaveClass(user.id, classId);
  }

  @Post(':id/regenerate-code')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Regenerate join code' })
  regenerateCode(@Param('id') id: string) {
    return this.classesService.regenerateJoinCode(id);
  }

  @Get(':id/students')
  @ApiOperation({ summary: 'Get all students in a class' })
  getStudents(@Param('id') classId: string) {
    return this.classesService.getClassStudents(classId);
  }

  @Delete(':classId/students/:studentId')
  @Roles('TEACHER', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Remove student from class' })
  removeStudent(@Param('classId') classId: string, @Param('studentId') studentId: string) {
    return this.classesService.removeStudent(classId, studentId);
  }
}
