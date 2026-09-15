import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateAttendanceDto } from './create-attendance.dto';

export class UpdateAttendanceDto extends PartialType(CreateAttendanceDto) {
  @ApiPropertyOptional({
    description: 'Optional update notes',
    example: 'Status updated after medical excuse confirmed',
  })
  notes?: string;
}
