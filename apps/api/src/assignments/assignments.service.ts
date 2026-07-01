// apps/api/src/assignments/assignments.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GamificationService } from '../gamification/gamification.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeAssignmentDto } from './dto/grade-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private gamification: GamificationService,
  ) {}

  async create(dto: CreateAssignmentDto) {
    const assignment = await this.prisma.assignment.create({
      data: {
        classId: dto.classId,
        title: dto.title,
        description: dto.description,
        difficulty: dto.difficulty,
        dueDate: new Date(dto.dueDate),
        maxMarks: dto.maxMarks ?? 100,
        resources: dto.resources,
      },
    });

    // Pre-create PENDING submission rows for all enrolled students + notify
    const enrollments = await this.prisma.enrollment.findMany({
      where: { classId: dto.classId, isActive: true },
      include: { student: { include: { user: true } } },
    });

    await this.prisma.assignmentSubmission.createMany({
      data: enrollments.map((e) => ({ assignmentId: assignment.id, studentId: e.studentId })),
    });

    for (const e of enrollments) {
      await this.notifications.create(e.student.userId, {
        type: 'ASSIGNMENT',
        title: 'New Assignment',
        message: `New assignment "${dto.title}" has been posted. Due ${new Date(dto.dueDate).toLocaleDateString()}.`,
      });
    }

    return assignment;
  }

  async listForClass(classId: string) {
    return this.prisma.assignment.findMany({
      where: { classId },
      include: { submissions: true },
      orderBy: { dueDate: 'asc' },
    });
  }

  async listForStudent(studentId: string, classId?: string) {
    return this.prisma.assignmentSubmission.findMany({
      where: { studentId, ...(classId ? { assignment: { classId } } : {}) },
      include: { assignment: true },
      orderBy: { assignment: { dueDate: 'asc' } },
    });
  }

  async submit(assignmentId: string, studentId: string, dto: SubmitAssignmentDto) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');

    const isLate = new Date() > assignment.dueDate;

    const submission = await this.prisma.assignmentSubmission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      update: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        fileUrl: dto.fileUrl,
        notes: dto.notes,
      },
      create: {
        assignmentId,
        studentId,
        status: 'SUBMITTED',
        submittedAt: new Date(),
        fileUrl: dto.fileUrl,
        notes: dto.notes,
      },
    });

    await this.gamification.awardXP(studentId, 'ASSIGNMENT_SUBMITTED', isLate ? 0.5 : 1);
    return submission;
  }

  async grade(assignmentId: string, studentId: string, dto: GradeAssignmentDto) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      include: { student: { include: { user: true } } },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    const updated = await this.prisma.assignmentSubmission.update({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      data: {
        status: 'GRADED',
        marksObtained: dto.marksObtained,
        feedback: dto.feedback,
        gradedAt: new Date(),
      },
    });

    await this.notifications.create(submission.student.userId, {
      type: 'ASSIGNMENT',
      title: 'Assignment Graded',
      message: `You scored ${dto.marksObtained} marks. ${dto.feedback ? 'Feedback: ' + dto.feedback : ''}`,
    });

    return updated;
  }

  // Run daily — mark overdue ungraded/unsubmitted as MISSED
  async markOverdueAsMissed() {
    const overdue = await this.prisma.assignment.findMany({
      where: { dueDate: { lt: new Date() } },
      select: { id: true },
    });
    const ids = overdue.map((a) => a.id);
    if (ids.length === 0) return { updated: 0 };

    const result = await this.prisma.assignmentSubmission.updateMany({
      where: { assignmentId: { in: ids }, status: 'PENDING' },
      data: { status: 'MISSED' },
    });
    return { updated: result.count };
  }
}
