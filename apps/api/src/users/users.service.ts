// apps/api/src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async listAll(role?: 'STUDENT' | 'TEACHER' | 'SUPER_ADMIN') {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, avatarUrl: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async deactivate(id: string) {
    return this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }

  async activate(id: string) {
    return this.prisma.user.update({ where: { id }, data: { isActive: true } });
  }

  async updateRole(id: string, role: 'STUDENT' | 'TEACHER' | 'SUPER_ADMIN') {
    return this.prisma.user.update({ where: { id }, data: { role } });
  }

  async getPlatformStats() {
    const [totalUsers, totalStudents, totalTeachers, totalClasses, totalProblems] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.user.count({ where: { role: 'TEACHER' } }),
      this.prisma.class.count({ where: { isActive: true } }),
      this.prisma.leetcodeSnapshot.aggregate({ _sum: { totalSolved: true } }),
    ]);

    return {
      totalUsers,
      totalStudents,
      totalTeachers,
      totalClasses,
      totalProblemsTracked: totalProblems._sum.totalSolved || 0,
    };
  }
}
