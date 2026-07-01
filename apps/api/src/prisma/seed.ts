// apps/api/src/prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create a demo super admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@leettrack.dev' },
    update: {},
    create: {
      email: 'admin@leettrack.dev',
      name: 'Super Admin',
      role: Role.SUPER_ADMIN,
      googleId: 'demo-admin-google-id',
    },
  });

  // Create a demo teacher
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@leettrack.dev' },
    update: {},
    create: {
      email: 'teacher@leettrack.dev',
      name: 'Dr. Priya Sharma',
      role: Role.TEACHER,
      googleId: 'demo-teacher-google-id',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=teacher',
      teacherProfile: {
        create: {
          bio: 'DSA & Python instructor with 8 years experience',
          institution: 'Lovely Professional University',
        },
      },
    },
    include: { teacherProfile: true },
  });

  // Create a demo class
  const demoClass = await prisma.class.upsert({
    where: { joinCode: 'DEMO2024' },
    update: {},
    create: {
      name: 'DSA Batch 2024 — Python',
      description: 'Data Structures & Algorithms using Python for M.Tech students',
      subject: 'DSA & Python',
      batch: '2024',
      section: 'A',
      joinCode: 'DEMO2024',
      inviteLink: 'demo-invite-link-2024',
      teacherId: teacher.teacherProfile!.id,
    },
  });

  // Create demo students
  const studentNames = [
    { name: 'Rahul Kumar', lc: 'rahulkumar_codes' },
    { name: 'Priya Singh', lc: 'priya_dsa' },
    { name: 'Amit Sharma', lc: 'amit_leetcoder' },
    { name: 'Neha Gupta', lc: 'neha_solves' },
    { name: 'Vikram Patel', lc: 'vikram_coder' },
  ];

  for (let i = 0; i < studentNames.length; i++) {
    const s = studentNames[i];
    const student = await prisma.user.upsert({
      where: { email: `${s.lc}@demo.com` },
      update: {},
      create: {
        email: `${s.lc}@demo.com`,
        name: s.name,
        role: Role.STUDENT,
        googleId: `demo-student-${i}`,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.lc}`,
        studentProfile: {
          create: {
            leetcodeUsername: s.lc,
            leetcodeVerified: true,
            xpPoints: Math.floor(Math.random() * 2000) + 200,
            level: ['Learner', 'Explorer', 'Problem Solver'][Math.floor(Math.random() * 3)],
          },
        },
      },
      include: { studentProfile: true },
    });

    // Enroll in class
    await prisma.enrollment.upsert({
      where: {
        studentId_classId: {
          studentId: student.studentProfile!.id,
          classId: demoClass.id,
        },
      },
      update: {},
      create: {
        studentId: student.studentProfile!.id,
        classId: demoClass.id,
      },
    });

    // Add mock LeetCode snapshots (last 30 days)
    const baseSolved = 80 + i * 40 + Math.floor(Math.random() * 60);
    for (let d = 29; d >= 0; d--) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      await prisma.leetcodeSnapshot.create({
        data: {
          studentId: student.studentProfile!.id,
          snapshotDate: date,
          totalSolved: baseSolved + (29 - d) * (1 + Math.floor(Math.random() * 3)),
          easySolved: Math.floor((baseSolved + (29 - d) * 2) * 0.5),
          mediumSolved: Math.floor((baseSolved + (29 - d) * 2) * 0.35),
          hardSolved: Math.floor((baseSolved + (29 - d) * 2) * 0.15),
          ranking: 50000 - baseSolved * 100,
          contestRating: 1500 + baseSolved * 2,
        },
      });
    }
  }

  console.log('✅ Seed complete!');
  console.log(`  Admin: admin@leettrack.dev`);
  console.log(`  Teacher: teacher@leettrack.dev`);
  console.log(`  Class Join Code: DEMO2024`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
