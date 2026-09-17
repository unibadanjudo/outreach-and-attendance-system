import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  MEMBER_REPOSITORY,
  type MemberRepository,
} from './repositories/member.repository.interface';
import {
  OUTREACH_REPOSITORY,
  type OutreachRepository,
} from '../outreach/repositories/outreach.repository.interface';
import { OutreachPriorityService } from '../outreach/services/outreach-priority.service';
import { QueryMembersDto } from './dto/query-members.dto';
import {
  MemberSummaryDto,
  PaginatedMembersDto,
} from './dto/member-response.dto';
import { Member } from './models/member.model';
import { UpdateMemberDto } from './dto/update-member.dto';
import { AttendanceAnalyticsService } from '../attendance/services/attendance-analytics.service';
import { InactivityService } from '../attendance/services/inactivity.service';
import { ActivityStatus } from '../attendance/models/activity-status.enum';
import { MemberActivityDetails } from '../attendance/models/attendance-analytics.model';
import { buildMemberSummaryDto } from './utils/member-summary.util';

@Injectable()
export class MembersService {
  constructor(
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
    @Inject(forwardRef(() => AttendanceAnalyticsService))
    private readonly attendanceAnalyticsService: AttendanceAnalyticsService,
    @Inject(forwardRef(() => InactivityService))
    private readonly inactivityService: InactivityService,
    @Optional()
    @Inject(OUTREACH_REPOSITORY)
    private readonly outreachRepository?: OutreachRepository,
    @Optional()
    @Inject(forwardRef(() => OutreachPriorityService))
    private readonly outreachPriorityService?: OutreachPriorityService,
  ) {}

  async findAll(query: QueryMembersDto): Promise<PaginatedMembersDto> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(500, Math.max(1, Number(query.limit) || 50));

    let members = query.search
      ? await this.memberRepository.search(query.search)
      : await this.memberRepository.findAll();

    if (query.facultyDepartment) {
      const dept = query.facultyDepartment.trim().toLowerCase();
      members = members.filter((m) =>
        m.facultyDepartment.toLowerCase().includes(dept),
      );
    }

    if (query.status && query.status !== 'ALL') {
      const target = query.status.trim().toUpperCase();
      const analyticsMap =
        await this.attendanceAnalyticsService.getAllMembersAnalytics();
      members = members.filter((m) => {
        const analytics = analyticsMap.get(m.id);
        const status = analytics
          ? this.inactivityService.determineStatus(analytics)
          : ActivityStatus.NEVER_ATTENDED;
        return status === target;
      });
    }

    const total = members.length;
    const totalPages = Math.ceil(total / limit) || 1;
    return {
      items: members.slice((page - 1) * limit, page * limit),
      meta: { total, page, limit, totalPages },
      total,
      page,
      limit,
      totalPages,
    } as any;
  }

  async findById(id: string): Promise<Member> {
    const member = await this.memberRepository.findById(id);
    if (!member) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: `Member with identifier "${id}" not found.`,
      });
    }
    return member;
  }

  async update(id: string, dto: UpdateMemberDto): Promise<Member> {
    const existing = await this.findById(id);
    return this.memberRepository.update(existing.id, dto);
  }

  async updateBeltRank(id: string, beltRank: string): Promise<Member> {
    const existing = await this.findById(id);
    return this.memberRepository.update(existing.id, { beltRank });
  }

  async getMemberSummary(id: string): Promise<MemberSummaryDto> {
    const member = await this.findById(id);
    const now = new Date();
    const analytics = await this.attendanceAnalyticsService.getMemberAnalytics(
      member.id,
      now,
      member.phoneNumber,
    );
    const activityStatus = this.inactivityService.determineStatus(analytics);

    const outreaches = this.outreachRepository
      ? await this.outreachRepository.findByMemberId(member.id)
      : [];

    return buildMemberSummaryDto(
      member,
      analytics,
      activityStatus,
      outreaches,
      this.outreachPriorityService,
      now,
    );
  }

  async getMemberActivity(id: string): Promise<MemberActivityDetails> {
    const member = await this.findById(id);
    return this.inactivityService.getMemberActivityDetails(
      member.id,
      new Date(),
      member.phoneNumber,
    );
  }
}

