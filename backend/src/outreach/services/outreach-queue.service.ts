import { Inject, Injectable } from '@nestjs/common';
import {
  OUTREACH_REPOSITORY,
  type OutreachRepository,
} from '../repositories/outreach.repository.interface';
import {
  MEMBER_REPOSITORY,
  type MemberRepository,
} from '../../members/repositories/member.repository.interface';
import { AttendanceAnalyticsService } from '../../attendance/services/attendance-analytics.service';
import { InactivityService } from '../../attendance/services/inactivity.service';
import { OutreachPriorityService } from './outreach-priority.service';
import { QueryOutreachQueueDto } from '../dto/query-outreach-queue.dto';
import { PaginatedOutreachQueueDto } from '../dto/outreach-queue-response.dto';
import { Outreach } from '../models/outreach.model';
import { OutreachQueueItem } from '../models/outreach-queue.model';
import { ActivityStatus } from '../../attendance/models/activity-status.enum';
import {
  buildQueueSummary,
  filterAndSortQueueItems,
} from '../utils/outreach-queue.util';

@Injectable()
export class OutreachQueueService {
  constructor(
    @Inject(OUTREACH_REPOSITORY)
    private readonly outreachRepository: OutreachRepository,
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
    private readonly attendanceAnalyticsService: AttendanceAnalyticsService,
    private readonly inactivityService: InactivityService,
    private readonly priorityService: OutreachPriorityService,
  ) {}

  async getQueue(
    query: QueryOutreachQueueDto,
  ): Promise<PaginatedOutreachQueueDto> {
    const members = await this.memberRepository.findAll();
    const allOutreaches = await this.outreachRepository.findAll();
    const outreachByMember = this.groupOutreachesByMember(allOutreaches);

    const items: OutreachQueueItem[] = [];
    const now = new Date();

    for (const member of members) {
      const analytics =
        await this.attendanceAnalyticsService.getMemberAnalytics(
          member.id,
          now,
          member.phoneNumber,
        );
      const activityStatus = this.inactivityService.determineStatus(analytics);
      const memberOutreaches =
        outreachByMember.get(member.id.toLowerCase()) || [];
      memberOutreaches.sort((a, b) =>
        b.contactedAt.localeCompare(a.contactedAt),
      );
      const lastOutreach = memberOutreaches[0] || null;

      const followUp = this.priorityService.computeFollowUpInfo(
        lastOutreach,
        now,
      );
      const priority = this.priorityService.calculatePriority(
        activityStatus,
        analytics,
        lastOutreach,
        followUp,
      );
      const recommendedAction = this.priorityService.determineRecommendedAction(
        activityStatus,
        lastOutreach,
        followUp,
      );

      if (
        activityStatus !== ActivityStatus.ACTIVE ||
        followUp.isFollowUpDue ||
        query.activityStatus === ActivityStatus.ACTIVE
      ) {
        items.push({
          member,
          attendance: analytics,
          activityStatus,
          lastOutreach,
          followUp,
          priority,
          recommendedAction,
        });
      }
    }

    const filtered = filterAndSortQueueItems(items, query);
    const summary = buildQueueSummary(filtered);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const paginatedItems = filtered.slice((page - 1) * limit, page * limit);

    return {
      summary,
      items: paginatedItems,
      meta: {
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      },
    };
  }

  private groupOutreachesByMember(
    outreaches: Outreach[],
  ): Map<string, Outreach[]> {
    const map = new Map<string, Outreach[]>();
    for (const o of outreaches) {
      const clean = o.memberId.trim().toLowerCase();
      const existing = map.get(clean) || [];
      existing.push(o);
      map.set(clean, existing);
    }
    return map;
  }
}
