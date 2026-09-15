import { forwardRef, Module } from '@nestjs/common';
import { GoogleModule } from '../google/google.module';
import { MembersModule } from '../members/members.module';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { GoogleSheetsAttendanceRepository } from './repositories/google-sheets-attendance.repository';
import { ATTENDANCE_REPOSITORY } from './repositories/attendance.repository.interface';
import { AttendanceAnalyticsService } from './services/attendance-analytics.service';
import { InactivityService } from './services/inactivity.service';

@Module({
  imports: [GoogleModule, forwardRef(() => MembersModule)],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceAnalyticsService,
    InactivityService,
    {
      provide: ATTENDANCE_REPOSITORY,
      useClass: GoogleSheetsAttendanceRepository,
    },
  ],
  exports: [
    AttendanceService,
    AttendanceAnalyticsService,
    InactivityService,
    ATTENDANCE_REPOSITORY,
  ],
})
export class AttendanceModule {}
