import { ApiProperty } from '@nestjs/swagger';

export class AttendanceTrendsDto {
  @ApiProperty({
    example: 5,
    description: 'Members with increasing attendance',
  })
  increasing!: number;

  @ApiProperty({ example: 12, description: 'Members with stable attendance' })
  stable!: number;

  @ApiProperty({ example: 4, description: 'Members with declining attendance' })
  declining!: number;

  @ApiProperty({ example: 3, description: 'Members with zero attendance' })
  noAttendance!: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ example: 35, description: 'Total registered members' })
  totalMembers!: number;

  @ApiProperty({ example: 18, description: 'Currently active members' })
  activeMembers!: number;

  @ApiProperty({
    example: 6,
    description: 'Recently inactive members (15-30 days absent)',
  })
  recentlyInactiveMembers!: number;

  @ApiProperty({
    example: 5,
    description: 'Inactive members (31-90 days absent)',
  })
  inactiveMembers!: number;

  @ApiProperty({
    example: 3,
    description: 'Long term inactive members (>90 days absent)',
  })
  longTermInactiveMembers!: number;

  @ApiProperty({
    example: 3,
    description: 'Registered members who have never attended',
  })
  neverAttendedMembers!: number;

  @ApiProperty({
    example: 9,
    description: 'Total members requiring outreach attention',
  })
  membersRequiringOutreach!: number;

  @ApiProperty({
    example: 15,
    description: 'Total completed outreach communications',
  })
  outreachCompleted!: number;

  @ApiProperty({ example: 2, description: 'Total pending outreach contacts' })
  outreachPending!: number;

  @ApiProperty({
    example: 4,
    description: 'Scheduled follow-ups that are currently due',
  })
  followUpsDue!: number;

  @ApiProperty({
    example: 42,
    description: 'Total attendance recorded in the last 30 days',
  })
  recentAttendance!: number;

  @ApiProperty({
    type: AttendanceTrendsDto,
    description: 'Breakdown of attendance trends across members',
  })
  attendanceTrends!: AttendanceTrendsDto;
}
