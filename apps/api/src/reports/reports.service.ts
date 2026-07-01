// apps/api/src/reports/reports.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ─── Student Progress Report (PDF) ────────────────

  async generateStudentReportPDF(studentId: string, classId: string): Promise<Buffer> {
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        leetcodeSnapshots: { orderBy: { snapshotDate: 'desc' }, take: 30 },
        attendanceRecords: true,
        assignments: { include: { assignment: true } },
      },
    });
    if (!student) throw new NotFoundException('Student not found');

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = 800;
    const drawText = (text: string, x: number, size = 11, bold = false, color = rgb(0.1, 0.1, 0.1)) => {
      page.drawText(text, { x, y, size, font: bold ? boldFont : font, color });
    };

    drawText('LeetTrack — Student Progress Report', 40, 22, true, rgb(0.05, 0.4, 0.85));
    y -= 35;
    drawText(`Student: ${student.user.name}`, 40, 13, true); y -= 18;
    drawText(`Email: ${student.user.email}`, 40); y -= 18;
    drawText(`LeetCode: ${student.leetcodeUsername || 'Not connected'}`, 40); y -= 18;
    drawText(`Generated: ${new Date().toLocaleDateString()}`, 40); y -= 30;

    const latest = student.leetcodeSnapshots[0];
    drawText('Coding Statistics', 40, 14, true, rgb(0.05, 0.4, 0.85)); y -= 20;
    drawText(`Total Solved: ${latest?.totalSolved || 0}`, 40); y -= 16;
    drawText(`Easy: ${latest?.easySolved || 0}  |  Medium: ${latest?.mediumSolved || 0}  |  Hard: ${latest?.hardSolved || 0}`, 40); y -= 16;
    drawText(`Contest Rating: ${latest?.contestRating ? Math.round(latest.contestRating) : 'N/A'}`, 40); y -= 30;

    const totalSessions = student.attendanceRecords.length;
    const attended = student.attendanceRecords.filter((a) => a.isPresent).length;
    drawText('Attendance Summary', 40, 14, true, rgb(0.05, 0.4, 0.85)); y -= 20;
    drawText(`Attended: ${attended} / ${totalSessions} sessions (${totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0}%)`, 40); y -= 30;

    drawText('Assignment Summary', 40, 14, true, rgb(0.05, 0.4, 0.85)); y -= 20;
    const submitted = student.assignments.filter((a) => a.status === 'SUBMITTED' || a.status === 'GRADED').length;
    const graded = student.assignments.filter((a) => a.status === 'GRADED');
    const avgMarks = graded.length > 0
      ? graded.reduce((a, b) => a + (b.marksObtained || 0), 0) / graded.length
      : 0;
    drawText(`Submitted: ${submitted} / ${student.assignments.length}`, 40); y -= 16;
    drawText(`Average Marks: ${avgMarks.toFixed(1)}`, 40); y -= 30;

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }

  // ─── Class Report (Excel) ─────────────────────────

  async generateClassReportExcel(classId: string): Promise<Buffer> {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');

    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId, isActive: true },
      include: {
        student: {
          include: {
            user: true,
            leetcodeSnapshots: { orderBy: { snapshotDate: 'desc' }, take: 1 },
            attendanceRecords: true,
            assignments: true,
          },
        },
      },
    });

    const rows = enrollments.map(({ student }) => {
      const latest = student.leetcodeSnapshots[0];
      const totalSessions = student.attendanceRecords.length;
      const attended = student.attendanceRecords.filter((a) => a.isPresent).length;
      const submitted = student.assignments.filter((a) => a.status === 'SUBMITTED' || a.status === 'GRADED').length;

      return {
        Name: student.user.name,
        Email: student.user.email,
        'LeetCode Username': student.leetcodeUsername || '—',
        'Total Solved': latest?.totalSolved || 0,
        Easy: latest?.easySolved || 0,
        Medium: latest?.mediumSolved || 0,
        Hard: latest?.hardSolved || 0,
        'Contest Rating': latest?.contestRating ? Math.round(latest.contestRating) : 'N/A',
        'Attendance %': totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0,
        'Assignments Submitted': submitted,
        'Total Assignments': student.assignments.length,
        'XP Points': student.xpPoints,
        Level: student.level,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Class Analytics');

    // Auto-width columns
    worksheet['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 18 }));

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  // ─── Attendance Report (CSV) ──────────────────────

  async generateAttendanceCSV(classId: string): Promise<string> {
    const sessions = await this.prisma.liveSession.findMany({
      where: { classId },
      include: { attendanceRecords: { include: { student: { include: { user: true } } } } },
      orderBy: { scheduledAt: 'asc' },
    });

    const rows: string[] = ['Session Title,Date,Student Name,Email,Present,Duration (min)'];
    for (const session of sessions) {
      for (const record of session.attendanceRecords) {
        rows.push(
          [
            session.title,
            session.scheduledAt.toISOString().split('T')[0],
            record.student.user.name,
            record.student.user.email,
            record.isPresent ? 'Yes' : 'No',
            record.duration ? Math.round(record.duration / 60).toString() : '0',
          ].join(','),
        );
      }
    }
    return rows.join('\n');
  }
}
