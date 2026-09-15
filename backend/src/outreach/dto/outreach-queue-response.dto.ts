import { OutreachQueueItem } from '../models/outreach-queue.model';

export interface OutreachQueueSummaryDto {
  totalInQueue: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  followUpDueCount: number;
}

export interface PaginatedOutreachQueueDto {
  summary: OutreachQueueSummaryDto;
  items: OutreachQueueItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
