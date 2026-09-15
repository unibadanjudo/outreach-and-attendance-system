import { Inject, Injectable } from '@nestjs/common';
import {
  ATTENDANCE_REPOSITORY,
  type AttendanceRepository,
} from '../repositories/attendance.repository.interface';
import { MemberAttendanceAnalytics } from '../models/attendance-analytics.model';
import { computeMemberAttendanceAnalytics } from '../utils/attendance-analytics.util';
import { Attendance } from '../models/attendance.model';

@Injectable()
export class AttendanceAnalyticsService {
  constructor(
    @Inject(ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: AttendanceRepository,
  ) {}

  async getMemberAnalytics(
    memberId: string,
    referenceDate: Date = new Date(),
    alternativeId?: string,
  ): Promise<MemberAttendanceAnalytics> {
    const records = await this.attendanceRepository.findByMemberId(memberId);
    if (alternativeId && alternativeId !== memberId) {
      const altRecords =
        await this.attendanceRepository.findByMemberId(alternativeId);
      const ids = new Set(records.map((r) => r.id));
      for (const r of altRecords) {
        if (!ids.has(r.id)) records.push(r);
      }
    }
    return computeMemberAttendanceAnalytics(records, referenceDate);
  }

  async getAllMembersAnalytics(
    referenceDate: Date = new Date(),
  ): Promise<Map<string, MemberAttendanceAnalytics>> {
    const allRecords = await this.attendanceRepository.findAll();
    const grouped = new Map<string, Attendance[]>();

    for (const record of allRecords) {
      const cleanId = record.memberId.trim().toLowerCase();
      const existing = grouped.get(cleanId) || [];
      existing.push(record);
      grouped.set(cleanId, existing);
    }

    const resultMap = new Map<string, MemberAttendanceAnalytics>();
    for (const [memberId, records] of grouped.entries()) {
      const analytics = computeMemberAttendanceAnalytics(
        records,
        referenceDate,
      );
      resultMap.set(memberId, analytics);

      const digits = memberId.replace(/[^0-9]/g, '');
      if (digits) {
        resultMap.set(digits, analytics);
        resultMap.set(`mem_${digits}`, analytics);
        if (digits.startsWith('0')) {
          resultMap.set(`mem_${digits.substring(1)}`, analytics);
          resultMap.set(digits.substring(1), analytics);
        } else {
          resultMap.set(`mem_0${digits}`, analytics);
          resultMap.set(`0${digits}`, analytics);
        }
      }
    }

    return resultMap;
  }

  calculateForRecords(
    records: Attendance[],
    referenceDate: Date = new Date(),
  ): MemberAttendanceAnalytics {
    return computeMemberAttendanceAnalytics(records, referenceDate);
  }
}
