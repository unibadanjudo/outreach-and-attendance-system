import { Outreach } from '../models/outreach.model';

export interface PaginatedOutreachDto {
  items: Outreach[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MemberOutreachHistoryDto {
  memberId: string;
  totalOutreach: number;
  lastContactedAt: string | null;
  items: Outreach[];
}
