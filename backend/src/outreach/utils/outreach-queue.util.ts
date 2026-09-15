import { OutreachPriority } from '../models/outreach.model';
import { OutreachQueueItem } from '../models/outreach-queue.model';
import { QueryOutreachQueueDto } from '../dto/query-outreach-queue.dto';
import { OutreachQueueSummaryDto } from '../dto/outreach-queue-response.dto';

const PRIORITY_ORDER: Record<OutreachPriority, number> = {
  [OutreachPriority.HIGH]: 3,
  [OutreachPriority.MEDIUM]: 2,
  [OutreachPriority.LOW]: 1,
};

export function filterAndSortQueueItems(
  items: OutreachQueueItem[],
  query: QueryOutreachQueueDto,
): OutreachQueueItem[] {
  let filtered = [...items];

  if (query.priority) {
    filtered = filtered.filter((it) => it.priority === query.priority);
  }

  if (query.activityStatus) {
    filtered = filtered.filter(
      (it) => it.activityStatus === query.activityStatus,
    );
  }

  if (query.onlyDue === 'true' || query.onlyDue === '1') {
    filtered = filtered.filter(
      (it) => it.followUp.isFollowUpDue || !it.lastOutreach,
    );
  }

  if (query.search) {
    const q = query.search.trim().toLowerCase();
    filtered = filtered.filter((it) => {
      const m = it.member;
      const full =
        `${m.firstName} ${m.lastName} ${m.nickname} ${m.phoneNumber} ${m.matricNumber}`.toLowerCase();
      return full.includes(q);
    });
  }

  filtered.sort((a, b) => {
    const diff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
    if (diff !== 0) return diff;
    if (a.followUp.isFollowUpDue !== b.followUp.isFollowUpDue) {
      return a.followUp.isFollowUpDue ? -1 : 1;
    }
    const daysA = a.attendance.daysSinceLastAttendance ?? -1;
    const daysB = b.attendance.daysSinceLastAttendance ?? -1;
    return daysB - daysA;
  });

  return filtered;
}

export function buildQueueSummary(
  items: OutreachQueueItem[],
): OutreachQueueSummaryDto {
  return {
    totalInQueue: items.length,
    highPriorityCount: items.filter((i) => i.priority === OutreachPriority.HIGH)
      .length,
    mediumPriorityCount: items.filter(
      (i) => i.priority === OutreachPriority.MEDIUM,
    ).length,
    lowPriorityCount: items.filter((i) => i.priority === OutreachPriority.LOW)
      .length,
    followUpDueCount: items.filter((i) => i.followUp.isFollowUpDue).length,
  };
}
