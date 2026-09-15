import { forwardRef, Module } from '@nestjs/common';
import { GoogleModule } from '../google/google.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { OutreachModule } from '../outreach/outreach.module';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { GoogleSheetsMemberRepository } from './repositories/google-sheets-member.repository';
import { MEMBER_REPOSITORY } from './repositories/member.repository.interface';

@Module({
  imports: [
    GoogleModule,
    forwardRef(() => AttendanceModule),
    forwardRef(() => OutreachModule),
  ],
  controllers: [MembersController],
  providers: [
    MembersService,
    {
      provide: MEMBER_REPOSITORY,
      useClass: GoogleSheetsMemberRepository,
    },
  ],
  exports: [MembersService, MEMBER_REPOSITORY],
})
export class MembersModule {}
