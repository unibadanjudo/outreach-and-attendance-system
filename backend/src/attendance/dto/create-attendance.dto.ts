import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { AttendanceStatus, TrainingSession } from '../models/attendance.model';

export class CreateAttendanceDto {
  @ApiProperty({
    description:
      'Identifier of the member (e.g. mem_09028872023 or phone number)',
    example: 'mem_09028872023',
  })
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @ApiPropertyOptional({
    description:
      'Attendance date in YYYY-MM-DD format (Africa/Lagos). Defaults to today.',
    example: '2026-09-13',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'attendanceDate must be in YYYY-MM-DD format',
  })
  attendanceDate?: string;

  @ApiPropertyOptional({
    description: 'Training session type',
    enum: TrainingSession,
    default: TrainingSession.GENERAL,
  })
  @IsOptional()
  @IsEnum(TrainingSession)
  trainingSession?: TrainingSession = TrainingSession.GENERAL;

  @ApiPropertyOptional({
    description: 'Attendance status',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus = AttendanceStatus.PRESENT;

  @ApiPropertyOptional({
    description: 'Optional notes regarding attendance',
    example: 'Arrived on time, practiced uchikomi',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description:
      'Set to true if this record explicitly corrects an existing entry',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isCorrection?: boolean = false;
}
