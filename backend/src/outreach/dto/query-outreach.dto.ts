import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { ContactMethod, OutreachStatus } from '../models/outreach.model';

export class QueryOutreachDto {
  @IsOptional()
  @IsString()
  memberId?: string;

  @IsOptional()
  @IsEnum(OutreachStatus)
  status?: OutreachStatus;

  @IsOptional()
  @IsEnum(ContactMethod)
  contactMethod?: ContactMethod;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate must be in YYYY-MM-DD format',
  })
  startDate?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'endDate must be in YYYY-MM-DD format',
  })
  endDate?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
