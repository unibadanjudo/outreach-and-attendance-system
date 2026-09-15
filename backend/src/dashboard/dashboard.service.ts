import { Inject, Injectable } from '@nestjs/common';
import {
  MEMBER_REPOSITORY,
  type MemberRepository,
} from '../members/repositories/member.repository.interface';
import {
  ATTENDANCE_REPOSITORY,
  type AttendanceRepository,
} from '../attendance/repositories/attendance.repository.interface';
import {
  OUTREACH_REPOSITORY,
  type OutreachRepository,
} from '../outreach/repositories/outreach.repository.interface';
import { AttendanceAnalyticsService } from '../attendance/services/attendance-analytics.service';
import { InactivityService } from '../attendance/services/inactivity.service';
import { OutreachQueueService } from '../outreach/services/outreach-queue.service';
import { QueryInactiveMembersDto } from './dto/query-inactive-members.dto';
import { PaginatedInactiveMembersDto } from './dto/inactive-members-response.dto';
import { DashboardSummaryDto } from './dto/dashboard-summary-response.dto';
import { DashboardAttendanceDto } from './dto/dashboard-attendance-response.dto';
import { DashboardOutreachDto } from './dto/dashboard-outreach-response.dto';
import { ConsolidatedDashboardDto } from './dto/consolidated-dashboard-response.dto';
import { calculateAttendanceDashboardMetrics } from './utils/dashboard-attendance.util';
import { calculateOutreachDashboardMetrics } from './utils/dashboard-outreach.util';
import {
  buildInactiveMemberItems,
  filterAndPaginateInactiveMembers,
} from './utils/dashboard-inactive.util';
import { calculateSummaryMetrics } from './utils/dashboard-summary.util';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
    @Inject(ATTENDANCE_REPOSITORY)
    private readonly attendanceRepository: AttendanceRepository,
    @Inject(OUTREACH_REPOSITORY)
    private readonly outreachRepository: OutreachRepository,
    private readonly attendanceAnalyticsService: AttendanceAnalyticsService,
    private readonly inactivityService: InactivityService,
    private readonly outreachQueueService: OutreachQueueService,
  ) {}

  async getDashboard(
    query: QueryInactiveMembersDto = new QueryInactiveMembersDto(),
  ): Promise<ConsolidatedDashboardDto> {
    const now = new Date();
    const [members, attendances, outreaches, analyticsMap, queue] =
      await Promise.all([
        this.memberRepository.findAll(),
        this.attendanceRepository.findAll(),
        this.outreachRepository.findAll(),
        this.attendanceAnalyticsService.getAllMembersAnalytics(now),
        this.outreachQueueService.getQueue({}),
      ]);

    const summary = calculateSummaryMetrics(
      members,
      attendances,
      outreaches,
      analyticsMap,
      queue,
      this.inactivityService,
      now,
    );

    const attendance = calculateAttendanceDashboardMetrics(attendances, now);
    const outreach = calculateOutreachDashboardMetrics(
      outreaches,
      attendances,
      now,
    );

    const limit = Math.max(1, Number(query.limit) || 15);
    const inactiveItems = buildInactiveMemberItems(
      members,
      analyticsMap,
      this.inactivityService,
    );
    const paginated = filterAndPaginateInactiveMembers(inactiveItems, {
      ...query,
      limit,
    });

    return {
      summary,
      attendance,
      inactiveMembers: paginated.items,
      outreach,
    };
  }

  async getSummary(): Promise<DashboardSummaryDto> {
    const now = new Date();
    const [members, attendances, outreaches, analyticsMap, queue] =
      await Promise.all([
        this.memberRepository.findAll(),
        this.attendanceRepository.findAll(),
        this.outreachRepository.findAll(),
        this.attendanceAnalyticsService.getAllMembersAnalytics(now),
        this.outreachQueueService.getQueue({}),
      ]);

    return calculateSummaryMetrics(
      members,
      attendances,
      outreaches,
      analyticsMap,
      queue,
      this.inactivityService,
      now,
    );
  }

  async getAttendanceMetrics(): Promise<DashboardAttendanceDto> {
    return calculateAttendanceDashboardMetrics(
      await this.attendanceRepository.findAll(),
      new Date(),
    );
  }

  async getOutreachMetrics(): Promise<DashboardOutreachDto> {
    const [outreaches, attendances] = await Promise.all([
      this.outreachRepository.findAll(),
      this.attendanceRepository.findAll(),
    ]);
    return calculateOutreachDashboardMetrics(
      outreaches,
      attendances,
      new Date(),
    );
  }

  async getInactiveMembers(
    query: QueryInactiveMembersDto = new QueryInactiveMembersDto(),
  ): Promise<PaginatedInactiveMembersDto> {
    const [members, analyticsMap] = await Promise.all([
      this.memberRepository.findAll(),
      this.attendanceAnalyticsService.getAllMembersAnalytics(),
    ]);

    const items = buildInactiveMemberItems(
      members,
      analyticsMap,
      this.inactivityService,
    );
    return filterAndPaginateInactiveMembers(items, query);
  }
}
