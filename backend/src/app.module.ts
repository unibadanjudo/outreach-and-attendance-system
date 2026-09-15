import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnvironment } from './config/env.validation';
import { appConfig } from './config/app.config';
import { GoogleModule } from './google/google.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { AttendanceModule } from './attendance/attendance.module';
import { OutreachModule } from './outreach/outreach.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
      load: [appConfig],
      cache: true,
    }),
    GoogleModule,
    HealthModule,
    AuthModule,
    MembersModule,
    AttendanceModule,
    OutreachModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
