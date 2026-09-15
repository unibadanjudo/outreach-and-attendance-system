import { ApiProperty } from '@nestjs/swagger';
import { DashboardSummaryDto } from './dashboard-summary-response.dto';
import { DashboardAttendanceDto } from './dashboard-attendance-response.dto';
import { DashboardOutreachDto } from './dashboard-outreach-response.dto';
import { InactiveMemberItemDto } from './inactive-members-response.dto';

export class ConsolidatedDashboardDto {
  @ApiProperty({
    type: DashboardSummaryDto,
    description: 'Executive club overview and KPIs',
  })
  summary!: DashboardSummaryDto;

  @ApiProperty({
    type: DashboardAttendanceDto,
    description: 'Attendance statistics, breakdowns, and 14-day flow',
  })
  attendance!: DashboardAttendanceDto;

  @ApiProperty({
    type: [InactiveMemberItemDto],
    description: 'Top inactive judokas prioritized for outreach triage',
  })
  inactiveMembers!: InactiveMemberItemDto[];

  @ApiProperty({
    type: DashboardOutreachDto,
    description: 'Outreach recovery rate, channels, and member re-engagement',
  })
  outreach!: DashboardOutreachDto;
}
