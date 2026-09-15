import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ActivityStatus } from '../../attendance/models/activity-status.enum';

export class QueryInactiveMembersDto {
  @ApiPropertyOptional({
    enum: ActivityStatus,
    description: 'Filter by specific activity status',
    example: ActivityStatus.RECENTLY_INACTIVE,
  })
  @IsEnum(ActivityStatus)
  @IsOptional()
  status?: ActivityStatus;

  @ApiPropertyOptional({
    example: 15,
    description: 'Minimum days since last attendance',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minDays?: number;

  @ApiPropertyOptional({
    example: 60,
    description: 'Maximum days since last attendance',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  maxDays?: number;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Page number',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    example: 50,
    default: 50,
    description: 'Page size limit (max 100)',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit: number = 50;

  @ApiPropertyOptional({
    example: 'outreachRelevance',
    enum: ['outreachRelevance', 'daysInactive', 'attendanceCount'],
    description: 'Sorting criteria',
    default: 'outreachRelevance',
  })
  @IsString()
  @IsOptional()
  sortBy?: 'outreachRelevance' | 'daysInactive' | 'attendanceCount' =
    'outreachRelevance';
}
