import { ApiProperty } from '@nestjs/swagger';

export class DailyAttendanceItemDto {
  @ApiProperty({
    example: '2026-09-12',
    description: 'Date in YYYY-MM-DD format',
  })
  date!: string;

  @ApiProperty({ example: 8, description: 'Number of present attendees' })
  count!: number;
}

export class DashboardAttendanceDto {
  @ApiProperty({ example: 120, description: 'Total attendance records logged' })
  totalRecords!: number;

  @ApiProperty({ example: 105, description: 'Total PRESENT attendances' })
  totalPresent!: number;

  @ApiProperty({ example: 10, description: 'Total ABSENT records' })
  totalAbsent!: number;

  @ApiProperty({ example: 5, description: 'Total EXCUSED records' })
  totalExcused!: number;

  @ApiProperty({
    example: 14,
    description: 'Present attendees in the last 7 days',
  })
  attendanceLast7Days!: number;

  @ApiProperty({
    example: 52,
    description: 'Present attendees in the last 30 days',
  })
  attendanceLast30Days!: number;

  @ApiProperty({
    example: {
      MORNING: 40,
      EVENING: 50,
      WEEKEND: 15,
      COMPETITION: 0,
      GENERAL: 0,
    },
    description: 'Attendance distribution by session type',
  })
  sessionBreakdown!: Record<string, number>;

  @ApiProperty({
    type: [DailyAttendanceItemDto],
    description: 'Daily present attendance counts for the past 14 days',
  })
  dailyAttendanceLast14Days!: DailyAttendanceItemDto[];

  @ApiProperty({
    example: 7.5,
    description: 'Average attendees per training session',
  })
  averageAttendancePerSession!: number;
}
