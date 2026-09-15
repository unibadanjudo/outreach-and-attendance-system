import type { Member } from './members.types';

export type ContactMethod =
  | 'PHONE_CALL'
  | 'WHATSAPP'
  | 'SMS'
  | 'EMAIL'
  | 'IN_PERSON'
  | 'OTHER';

export type OutreachStatus =
  | 'PENDING'
  | 'CONTACTED'
  | 'RESPONDED'
  | 'NO_RESPONSE'
  | 'WILL_RETURN'
  | 'NOT_INTERESTED'
  | 'TEMPORARILY_UNAVAILABLE'
  | 'UNKNOWN';

export type OutreachPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Outreach {
  id: string;
  memberId: string;
  contactedBy: string;
  contactedAt: string;
  contactMethod: ContactMethod;
  status: OutreachStatus;
  message?: string;
  response?: string;
  nextFollowUpDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OutreachQueueItem {
  member: Member;
  priority: OutreachPriority;
  priorityScore: number;
  activityStatus: string;
  daysInactive: number | null;
  totalAttendance: number;
  lastAttendanceDate: string | null;
  lastOutreach?: Outreach | null;
  isFollowUpDue: boolean;
  nextFollowUpDate?: string | null;
  recommendedAction: string;
}

export interface OutreachQueueSummary {
  totalInQueue: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
  followUpDueCount: number;
  recommendedTodayCount?: number;
}

export interface OutreachQueueResponse {
  summary: OutreachQueueSummary;
  items: OutreachQueueItem[];
}

export interface CreateOutreachDto {
  memberId: string;
  contactMethod: ContactMethod;
  status: OutreachStatus;
  message?: string;
  response?: string;
  nextFollowUpDate?: string;
}

export interface UpdateOutreachDto {
  status?: OutreachStatus;
  response?: string;
  nextFollowUpDate?: string;
  message?: string;
}
