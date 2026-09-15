import { ApiProperty } from '@nestjs/swagger';
import { ActivityStatus } from '../../attendance/models/activity-status.enum';
import type { Member } from '../../members/models/member.model';

export class InactiveMemberItemDto {
  @ApiProperty({ description: 'Member identity and profile' })
  member: Member;

  @ApiProperty({
    example: '2026-08-10',
    nullable: true,
    description: 'Date of last PRESENT attendance (null if never attended)',
  })
  lastAttendance: string | null;

  @ApiProperty({
    example: 34,
    nullable: true,
    description: 'Days since last attendance (null if never attended)',
  })
  daysInactive: number | null;

  @ApiProperty({
    example: 8,
    description: 'Total historical PRESENT sessions',
  })
  attendanceCount: number;

  @ApiProperty({
    enum: ActivityStatus,
    example: ActivityStatus.RECENTLY_INACTIVE,
    description: 'Inactivity classification',
  })
  activityStatus: ActivityStatus;

  @ApiProperty({
    example: 10126,
    description: 'Calculated outreach priority score',
  })
  priorityScore: number;
}

export class PaginatedInactiveMembersDto {
  @ApiProperty({
    type: [InactiveMemberItemDto],
    description: 'List of inactive members prioritized for outreach',
  })
  items: InactiveMemberItemDto[];

  @ApiProperty({ example: 42, description: 'Total matching inactive members' })
  total: number;

  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 50, description: 'Items per page' })
  limit: number;

  @ApiProperty({ example: 1, description: 'Total pages' })
  totalPages: number;
}
