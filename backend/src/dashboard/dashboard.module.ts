import { forwardRef, Module } from '@nestjs/common';
import { MembersModule } from '../members/members.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { OutreachModule } from '../outreach/outreach.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    forwardRef(() => MembersModule),
    forwardRef(() => AttendanceModule),
    forwardRef(() => OutreachModule),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
