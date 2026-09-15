import { forwardRef, Module } from '@nestjs/common';
import { GoogleModule } from '../google/google.module';
import { MembersModule } from '../members/members.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { OutreachController } from './outreach.controller';
import { OutreachService } from './services/outreach.service';
import { OutreachQueueService } from './services/outreach-queue.service';
import { OutreachPriorityService } from './services/outreach-priority.service';
import { OUTREACH_REPOSITORY } from './repositories/outreach.repository.interface';
import { GoogleSheetsOutreachRepository } from './repositories/google-sheets-outreach.repository';

@Module({
  imports: [
    GoogleModule,
    forwardRef(() => MembersModule),
    forwardRef(() => AttendanceModule),
  ],
  controllers: [OutreachController],
  providers: [
    {
      provide: OUTREACH_REPOSITORY,
      useClass: GoogleSheetsOutreachRepository,
    },
    OutreachPriorityService,
    OutreachQueueService,
    OutreachService,
  ],
  exports: [
    OUTREACH_REPOSITORY,
    OutreachPriorityService,
    OutreachQueueService,
    OutreachService,
  ],
})
export class OutreachModule {}
