// apps/api/src/auth/auth.service.ts
import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

interface GoogleProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async validateGoogleUser(profile: GoogleProfile) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: profile.id },
      include: { studentProfile: true, teacherProfile: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          googleId: profile.id,
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.picture,
          role: Role.STUDENT,
          studentProfile: { create: {} },
        },
        include: { studentProfile: true, teacherProfile: true },
      });
    }

    return user;
  }

  generateTokens(userId: string, role: Role) {
    const payload = { sub: userId, role };
    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, { expiresIn: '30d' }),
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            enrollments: { include: { class: true } },
            badges: true,
          },
        },
        teacherProfile: {
          include: { classes: true },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async connectLeetcode(userId: string, username: string) {
    // Verify the LeetCode profile exists via public API
    const exists = await this.verifyLeetcodeProfile(username);
    if (!exists) throw new UnauthorizedException('LeetCode profile not found');

    const studentProfile = await this.prisma.studentProfile.update({
      where: { userId },
      data: { leetcodeUsername: username, leetcodeVerified: true },
    });

    return studentProfile;
  }

  private async verifyLeetcodeProfile(username: string): Promise<boolean> {
    try {
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `query { matchedUser(username: "${username}") { username } }`,
        }),
      });
      const data = await response.json();
      return !!data?.data?.matchedUser;
    } catch {
      return false;
    }
  }
}
