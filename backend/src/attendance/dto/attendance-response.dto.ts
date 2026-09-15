import { ApiProperty } from '@nestjs/swagger';
import { Attendance } from '../models/attendance.model';

export class PaginationMetaDto {
  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}

export class PaginatedAttendanceDto {
  @ApiProperty({ description: 'List of attendance records' })
  items: Attendance[];

  @ApiProperty({ type: PaginationMetaDto })
  meta: PaginationMetaDto;
}
