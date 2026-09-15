import { ApiProperty } from '@nestjs/swagger';
import { ActivityStatus } from '../models/activity-status.enum';

export class MemberAttendanceAnalyticsDto {
  @ApiProperty({ example: 12, description: 'Total PRESENT sessions' })
  totalAttendance: number;

  @ApiProperty({ example: 2, description: 'PRESENT sessions in last 7 days' })
  attendanceInLast7Days: number;

  @ApiProperty({ example: 6, description: 'PRESENT sessions in last 30 days' })
  attendanceInLast30Days: number;

  @ApiProperty({ example: 10, description: 'PRESENT sessions in last 60 days' })
  attendanceInLast60Days: number;

  @ApiProperty({ example: 12, description: 'PRESENT sessions in last 90 days' })
  attendanceInLast90Days: number;

  @ApiProperty({
    example: '2026-09-10',
    nullable: true,
    description: 'Most recent PRESENT date',
  })
  lastAttendanceDate: string | null;

  @ApiProperty({
    example: '2026-09-08',
    nullable: true,
    description: 'Second most recent PRESENT date',
  })
  previousAttendanceDate: string | null;

  @ApiProperty({
    example: 3,
    nullable: true,
    description: 'Calendar days since last attendance',
  })
  daysSinceLastAttendance: number | null;

  @ApiProperty({
    example: 0.93,
    description: 'Average attendance sessions per week in last 90 days',
  })
  attendanceFrequency: number;

  @ApiProperty({
    example: 'INCREASING',
    enum: ['INCREASING', 'STABLE', 'DECLINING', 'NO_ATTENDANCE'],
  })
  recentAttendanceTrend: string;
}

export class MemberActivityResponseDto {
  @ApiProperty({ example: '08012345678' })
  memberId: string;

  @ApiProperty({ enum: ActivityStatus, example: ActivityStatus.ACTIVE })
  status: ActivityStatus;

  @ApiProperty({
    example: 3,
    nullable: true,
    description: 'Days since last attendance (null if never attended)',
  })
  daysInactive: number | null;

  @ApiProperty({ type: MemberAttendanceAnalyticsDto })
  analytics: MemberAttendanceAnalyticsDto;
}
