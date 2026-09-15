import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { UserSession } from '../auth/interfaces/user-session.interface';
import { AttendanceService } from './attendance.service';
import { BatchCreateAttendanceDto } from './dto/batch-create-attendance.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { PaginatedAttendanceDto } from './dto/attendance-response.dto';
import { Attendance } from './models/attendance.model';

@ApiTags('Attendance')
@Controller()
@UseGuards(AuthenticatedGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get('attendance')
  @ApiOperation({
    summary: 'List attendance records with filters & pagination 🔒',
  })
  @ApiResponse({ status: 200, description: 'Paginated attendance list' })
  findAll(@Query() query: QueryAttendanceDto): Promise<PaginatedAttendanceDto> {
    return this.attendanceService.findAll(query);
  }

  @Get('attendance/:id')
  @ApiOperation({ summary: 'Get an attendance record by ID 🔒' })
  @ApiResponse({ status: 200, description: 'Attendance record' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  findById(@Param('id') id: string): Promise<Attendance> {
    return this.attendanceService.findById(id);
  }

  @Post('attendance')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record training attendance 🔒' })
  @ApiResponse({ status: 201, description: 'Attendance recorded' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 409, description: 'Duplicate record exists' })
  create(
    @Body() dto: CreateAttendanceDto,
    @CurrentUser() user: UserSession,
  ): Promise<Attendance> {
    return this.attendanceService.create(dto, user.email);
  }

  @Post('attendance/batch')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Batch record/update session attendance 🔒' })
  @ApiResponse({ status: 201, description: 'Batch attendance saved' })
  createBatch(
    @Body() dto: BatchCreateAttendanceDto,
    @CurrentUser() user: UserSession,
  ): Promise<Attendance[]> {
    return this.attendanceService.batchCreate(dto, user.email);
  }

  @Patch('attendance/:id')
  @ApiOperation({ summary: 'Update an attendance record 🔒' })
  @ApiResponse({ status: 200, description: 'Attendance updated' })
  @ApiResponse({ status: 404, description: 'Attendance or member not found' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAttendanceDto,
    @CurrentUser() user: UserSession,
  ): Promise<Attendance> {
    return this.attendanceService.update(id, dto, user.email);
  }

  @Delete('attendance/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an attendance record 🔒' })
  @ApiResponse({ status: 200, description: 'Record deleted' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  delete(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.attendanceService.delete(id);
  }

  @Get('members/:id/attendance')
  @ApiOperation({ summary: 'Get attendance history for a specific member 🔒' })
  @ApiResponse({ status: 200, description: 'Member attendance history' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  getMemberAttendance(@Param('id') id: string): Promise<Attendance[]> {
    return this.attendanceService.findByMemberId(id);
  }
}
