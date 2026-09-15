import { plainToInstance, Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  PORT: number = 3000;

  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  @IsNotEmpty()
  FRONTEND_URL: string = 'http://localhost:5173';

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  CLUB_TIMEZONE: string = 'Africa/Lagos';

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_CALLBACK_URL: string;

  @IsString()
  @IsNotEmpty()
  GOOGLE_SHEETS_SPREADSHEET_ID: string;

  @IsString()
  @IsOptional()
  GOOGLE_SHEETS_MEMBERS_RANGE: string = 'Members!A:Z';

  @IsString()
  @IsOptional()
  GOOGLE_SHEETS_ATTENDANCE_RANGE: string = 'Attendance!A:Z';

  @IsString()
  @IsOptional()
  GOOGLE_SHEETS_OUTREACH_RANGE: string = 'Outreach!A:Z';

  @IsString()
  @IsOptional()
  GOOGLE_SERVICE_ACCOUNT_EMAIL?: string;

  @IsString()
  @IsOptional()
  GOOGLE_PRIVATE_KEY?: string;

  @IsString()
  @IsNotEmpty()
  AUTHORIZED_EMAILS: string;

  @IsString()
  @IsNotEmpty()
  SESSION_SECRET: string;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  ACTIVE_DAYS: number = 14;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  RECENTLY_INACTIVE_DAYS: number = 30;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  INACTIVE_DAYS: number = 60;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  LONG_TERM_INACTIVE_DAYS: number = 90;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const formattedErrors = errors
      .map((error) => {
        const constraints = error.constraints
          ? Object.values(error.constraints).join(', ')
          : 'Validation failed';
        return `  - ${error.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(
      `Environment configuration validation failed:\n${formattedErrors}`,
    );
  }

  return validatedConfig;
}
