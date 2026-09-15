import { ApiProperty } from '@nestjs/swagger';
import type { Member } from '../models/member.model';
import type { Outreach } from '../../outreach/models/outreach.model';

export class PaginationMetaDto {
  @ApiProperty({ example: 120, description: 'Total matching members' })
  total!: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page!: number;

  @ApiProperty({ example: 50, description: 'Items per page' })
  limit!: number;

  @ApiProperty({ example: 3, description: 'Total pages' })
  totalPages!: number;
}

export class PaginatedMembersDto {
  @ApiProperty({ description: 'List of members on current page' })
  items!: Member[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta!: PaginationMetaDto;
}

export class MemberAttendanceStatsDto {
  @ApiProperty({ example: 10, description: 'Total attended sessions' })
  totalAttendance!: number;

  @ApiProperty({ example: 2, description: 'Sessions attended in last 7 days' })
  attendanceInLast7Days!: number;

  @ApiProperty({ example: 5, description: 'Sessions attended in last 30 days' })
  attendanceInLast30Days!: number;

  @ApiProperty({ example: 8, description: 'Sessions attended in last 60 days' })
  attendanceInLast60Days!: number;

  @ApiProperty({
    example: 10,
    description: 'Sessions attended in last 90 days',
  })
  attendanceInLast90Days!: number;

  @ApiProperty({
    example: 3,
    nullable: true,
    description: 'Days since last attendance',
  })
  daysSinceLastAttendance!: number | null;

  @ApiProperty({
    example: 0.78,
    description: 'Weekly attendance frequency in last 90 days',
  })
  attendanceFrequency!: number;
}

export class MemberSummaryDto {
  @ApiProperty({ description: 'Member profile details' })
  member!: Member;

  @ApiProperty({ example: 10, description: 'Total sessions attended' })
  attendanceCount!: number;

  @ApiProperty({
    example: '2026-09-10',
    nullable: true,
    description: 'Date of last attendance',
  })
  lastAttendedDate!: string | null;

  @ApiProperty({
    example: '2026-09-10',
    nullable: true,
    description: 'Last attendance date',
  })
  lastAttendance!: string | null;

  @ApiProperty({
    example: 'ACTIVE',
    description: 'Current member activity status',
  })
  activityStatus!: string;

  @ApiProperty({ example: 'STABLE', description: 'Recent attendance trend' })
  attendanceTrend!: string;

  @ApiProperty({
    type: MemberAttendanceStatsDto,
    description: 'Detailed attendance statistics',
  })
  attendanceStats!: MemberAttendanceStatsDto;

  @ApiProperty({ example: 2, description: 'Total outreach follow-ups' })
  outreachCount!: number;

  @ApiProperty({
    example: '2026-09-01',
    nullable: true,
    description: 'Date of last outreach contact',
  })
  lastOutreachDate!: string | null;

  @ApiProperty({ nullable: true, description: 'Latest outreach record' })
  lastOutreach!: Outreach | null;

  @ApiProperty({
    example: '2026-09-15',
    nullable: true,
    description: 'Next scheduled follow-up date',
  })
  nextFollowUp!: string | null;

  @ApiProperty({ description: 'Complete outreach history records' })
  outreachHistory!: Outreach[];

  @ApiProperty({
    example: 'No action required',
    description: 'Backend recommended action',
  })
  recommendedAction!: string;
}
