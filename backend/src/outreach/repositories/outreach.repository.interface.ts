import { Outreach } from '../models/outreach.model';

export const OUTREACH_REPOSITORY = 'OUTREACH_REPOSITORY';

export interface OutreachRepository {
  findAll(): Promise<Outreach[]>;
  findById(id: string): Promise<Outreach | null>;
  findByMemberId(memberId: string): Promise<Outreach[]>;
  create(outreach: Outreach): Promise<Outreach>;
  update(id: string, updates: Partial<Outreach>): Promise<Outreach>;
}
