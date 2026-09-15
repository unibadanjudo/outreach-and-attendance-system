import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { ContactMethod, OutreachStatus } from '../models/outreach.model';

export class UpdateOutreachDto {
  @IsOptional()
  @IsString()
  contactedBy?: string;

  @IsOptional()
  @IsString()
  contactedAt?: string;

  @IsOptional()
  @IsEnum(ContactMethod, {
    message:
      'contactMethod must be one of: PHONE_CALL, WHATSAPP, SMS, EMAIL, IN_PERSON, OTHER',
  })
  contactMethod?: ContactMethod;

  @IsOptional()
  @IsEnum(OutreachStatus, {
    message:
      'status must be one of: PENDING, CONTACTED, RESPONDED, NO_RESPONSE, WILL_RETURN, NOT_INTERESTED, TEMPORARILY_UNAVAILABLE, UNKNOWN',
  })
  status?: OutreachStatus;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  response?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'nextFollowUpDate must be in YYYY-MM-DD format',
  })
  nextFollowUpDate?: string | null;
}
