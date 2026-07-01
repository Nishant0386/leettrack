// apps/api/src/reports/reports.controller.ts
import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('student/:studentId')
  @ApiQuery({ name: 'classId', required: true })
  @ApiOperation({ summary: 'Download student progress report as PDF' })
  async studentReport(
    @Param('studentId') studentId: string,
    @Query('classId') classId: string,
    @Res() res: Response,
  ) {
    const pdf = await this.reportsService.generateStudentReportPDF(studentId, classId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="student-report-${studentId}.pdf"`,
    });
    res.send(pdf);
  }

  @Get('class/:classId/excel')
  @ApiOperation({ summary: 'Download class analytics report as Excel' })
  async classReportExcel(@Param('classId') classId: string, @Res() res: Response) {
    const buffer = await this.reportsService.generateClassReportExcel(classId);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="class-report-${classId}.xlsx"`,
    });
    res.send(buffer);
  }

  @Get('class/:classId/attendance-csv')
  @ApiOperation({ summary: 'Download attendance report as CSV' })
  async attendanceCSV(@Param('classId') classId: string, @Res() res: Response) {
    const csv = await this.reportsService.generateAttendanceCSV(classId);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="attendance-${classId}.csv"`,
    });
    res.send(csv);
  }
}
