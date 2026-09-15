import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OutreachPriority } from '../models/outreach.model';
import { ActivityStatus } from '../../attendance/models/activity-status.enum';

export class QueryOutreachQueueDto {
  @IsOptional()
  @IsEnum(OutreachPriority)
  priority?: OutreachPriority;

  @IsOptional()
  @IsEnum(ActivityStatus)
  activityStatus?: ActivityStatus;

  @IsOptional()
  @IsString()
  onlyDue?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
