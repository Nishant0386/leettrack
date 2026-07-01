// apps/api/src/classes/classes.service.ts
import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateClassDto } from './dto/create-class.dto';
import { JoinClassDto } from './dto/join-class.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class ClassesService {
  constructor(
    private prisma: PrismaService,
    private cache: CacheService,
  ) {}

  async createClass(userId: string, dto: CreateClassDto) {
    const teacher = await this.prisma.teacherProfile.findUnique({ where: { userId } });
    if (!teacher) {
      // Auto-create teacher profile if missing
      await this.prisma.teacherProfile.create({ data: { userId } });
    }
    const teacherProfile = teacher || await this.prisma.teacherProfile.findUnique({ where: { userId } });

    return this.prisma.class.create({
      data: {
        name: dto.name,
        description: dto.description,
        subject: dto.subject,
        batch: dto.batch,
        section: dto.section,
        teacherId: teacherProfile!.id,
        joinCode: this.generateCode(8),
        inviteLink: this.generateCode(16),
      },
    });
  }

  async getClassesForUser(userId: string, role: string) {
    if (role === 'TEACHER' || role === 'SUPER_ADMIN') {
      const teacher = await this.prisma.teacherProfile.findUnique({ where: { userId } });
      if (!teacher) return [];
      return this.prisma.class.findMany({
        where: { teacherId: teacher.id },
        include: {
          _count: { select: { enrollments: true, assignments: true, liveSessions: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) return [];
    return this.prisma.enrollment.findMany({
      where: { studentId: student.id, isActive: true },
      include: {
        class: {
          include: {
            teacher: { include: { user: { select: { name: true, avatarUrl: true } } } },
            _count: { select: { enrollments: true, assignments: true } },
          },
        },
      },
    });
  }

  async getClassById(id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      include: {
        teacher: { include: { user: { select: { name: true, email: true, avatarUrl: true } } } },
        _count: { select: { enrollments: true, assignments: true, liveSessions: true } },
      },
    });
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  async updateClass(id: string, dto: Partial<CreateClassDto>) {
    return this.prisma.class.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
    });
  }

  async deleteClass(id: string) {
    await this.prisma.class.update({ where: { id }, data: { isActive: false } });
    return { message: 'Class deleted' };
  }

  async joinClass(userId: string, dto: JoinClassDto) {
    const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student profile not found');
    if (!student.leetcodeVerified) {
      throw new ForbiddenException('Please connect your LeetCode account first');
    }

    let cls: any;
    if (dto.joinCode) {
      cls = await this.prisma.class.findUnique({ where: { joinCode: dto.joinCode } });
    } else if (dto.inviteLink) {
      cls = await this.prisma.class.findUnique({ where: { inviteLink: dto.inviteLink } });
    }

    if (!cls || !cls.isActive) throw new NotFoundException('Class not found or inactive');

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_classId: { studentId: student.id, classId: cls.id } },
    });
    if (existing) {
      if (existing.isActive) throw new ConflictException('Already enrolled');
      return this.prisma.enrollment.update({
        where: { id: existing.id },
        data: { isActive: true },
      });
    }

    await this.cache.invalidateClass(cls.id);
    return this.prisma.enrollment.create({
      data: { studentId: student.id, classId: cls.id },
      include: { class: true },
    });
  }

  async leaveClass(userId: string, classId: string) {
    const student = await this.prisma.studentProfile.findUnique({ where: { userId } });
    if (!student) throw new NotFoundException('Student profile not found');

    await this.prisma.enrollment.updateMany({
      where: { studentId: student.id, classId },
      data: { isActive: false },
    });
    await this.cache.invalidateClass(classId);
    return { message: 'Left class successfully' };
  }

  async regenerateJoinCode(id: string) {
    return this.prisma.class.update({
      where: { id },
      data: { joinCode: this.generateCode(8) },
      select: { joinCode: true },
    });
  }

  async getClassStudents(classId: string) {
    return this.prisma.enrollment.findMany({
      where: { classId, isActive: true },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, avatarUrl: true } },
            leetcodeSnapshots: { orderBy: { snapshotDate: 'desc' }, take: 1 },
            badges: true,
          },
        },
      },
    });
  }

  async removeStudent(classId: string, studentId: string) {
    await this.prisma.enrollment.updateMany({
      where: { classId, studentId },
      data: { isActive: false },
    });
    await this.cache.invalidateClass(classId);
    return { message: 'Student removed' };
  }

  private generateCode(length: number): string {
    return randomBytes(length).toString('hex').slice(0, length).toUpperCase();
  }
}
