import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MembersService } from '../members/members.service';
import { BatchCreateAttendanceDto } from './dto/batch-create-attendance.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import { PaginatedAttendanceDto } from './dto/attendance-response.dto';
import {
  Attendance,
  AttendanceStatus,
  TrainingSession,
} from './models/attendance.model';
import {
  ATTENDANCE_REPOSITORY,
  type AttendanceRepository,
} from './repositories/attendance.repository.interface';
import { getLagosCurrentDate } from './utils/attendance-date.util';
import { filterAndPaginateAttendance } from './utils/attendance-query.util';

@Injectable()
export class AttendanceService {
  constructor(
    @Inject(ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: AttendanceRepository,
    @Inject(forwardRef(() => MembersService))
    private readonly membersService: MembersService,
  ) {}

  async create(
    dto: CreateAttendanceDto,
    recordedBy: string,
  ): Promise<Attendance> {
    const member = await this.membersService.findById(dto.memberId);
    const date = dto.attendanceDate || getLagosCurrentDate();
    const session = dto.trainingSession || TrainingSession.GENERAL;

    const existing = await this.attendanceRepository.findByMemberAndSession(
      member.id,
      date,
      session,
    );

    if (existing) {
      if (!dto.isCorrection) {
        throw new ConflictException(
          `Attendance already recorded for member "${member.id}" on ${date} (${session}). Set isCorrection=true or update record directly.`,
        );
      }
      return this.attendanceRepository.update(existing.id, {
        status: dto.status || AttendanceStatus.PRESENT,
        notes: dto.notes,
        recordedBy,
      });
    }

    const id = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: Attendance = {
      id,
      memberId: member.id,
      attendanceDate: date,
      trainingSession: session,
      status: dto.status || AttendanceStatus.PRESENT,
      recordedBy,
      notes: dto.notes || '',
      createdAt: new Date().toISOString(),
    };

    return this.attendanceRepository.create(newRecord);
  }

  async batchCreate(
    dto: BatchCreateAttendanceDto,
    recordedBy: string,
  ): Promise<Attendance[]> {
    if (!dto.records || !dto.records.length) return [];
    const now = new Date().toISOString();
    const recordsToUpsert: Attendance[] = dto.records.map((r, i) => ({
      id: `att_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
      memberId: r.memberId.trim(),
      attendanceDate: r.attendanceDate || getLagosCurrentDate(),
      trainingSession: r.trainingSession || TrainingSession.GENERAL,
      status: r.status || AttendanceStatus.PRESENT,
      recordedBy,
      notes: r.notes || '',
      createdAt: now,
    }));

    return this.attendanceRepository.batchUpsert(recordsToUpsert);
  }

  async findAll(query: QueryAttendanceDto): Promise<PaginatedAttendanceDto> {
    const records = await this.attendanceRepository.findAll();
    return filterAndPaginateAttendance(records, query);
  }

  async findById(id: string): Promise<Attendance> {
    const record = await this.attendanceRepository.findById(id);
    if (!record) {
      throw new NotFoundException(
        `Attendance record with ID "${id}" not found.`,
      );
    }
    return record;
  }

  async findByMemberId(memberId: string): Promise<Attendance[]> {
    const member = await this.membersService.findById(memberId);
    const records = await this.attendanceRepository.findByMemberId(member.id);
    return records.sort((a, b) =>
      b.attendanceDate.localeCompare(a.attendanceDate),
    );
  }

  async update(
    id: string,
    dto: UpdateAttendanceDto,
    user: string,
  ): Promise<Attendance> {
    await this.findById(id);
    if (dto.memberId) {
      await this.membersService.findById(dto.memberId);
    }
    return this.attendanceRepository.update(id, { ...dto, recordedBy: user });
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    await this.findById(id);
    await this.attendanceRepository.delete(id);
    return {
      success: true,
      message: `Attendance record ${id} deleted successfully.`,
    };
  }
}
