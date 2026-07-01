// apps/api/src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bull';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClassesModule } from './classes/classes.module';
import { LeetcodeModule } from './leetcode/leetcode.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { LiveSessionsModule } from './live-sessions/live-sessions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiInsightsModule } from './ai-insights/ai-insights.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MessagesModule } from './messages/messages.module';
import { EmailModule } from './email/email.module';
import { ReportsModule } from './reports/reports.module';
import { GamificationModule } from './gamification/gamification.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AuditModule } from './audit/audit.module';
import { CacheModule } from './cache/cache.module';
import { GatewayModule } from './gateway/gateway.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    ScheduleModule.forRoot(),

    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const host = config.get('REDIS_HOST', 'localhost');
        const port = config.get<number>('REDIS_PORT', 6379);
        const password = config.get<string>('REDIS_PASSWORD');
        // Upstash Redis uses TLS on port 6380
        const tls = password ? {} : undefined;
        return {
          redis: { host, port, password, tls },
        };
      },
    }),

    PrismaModule,
    CacheModule,
    GatewayModule,
    AuthModule,
    UsersModule,
    ClassesModule,
    LeetcodeModule,
    AssignmentsModule,
    LiveSessionsModule,
    AnalyticsModule,
    AiInsightsModule,
    NotificationsModule,
    MessagesModule,
    EmailModule,
    ReportsModule,
    GamificationModule,
    LeaderboardModule,
    AuditModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
