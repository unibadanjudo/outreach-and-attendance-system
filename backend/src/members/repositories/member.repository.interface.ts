import { Member } from '../models/member.model';

export const MEMBER_REPOSITORY = Symbol('MEMBER_REPOSITORY');

export interface MemberRepository {
  findAll(): Promise<Member[]>;
  findById(id: string): Promise<Member | null>;
  findByPhone(phone: string): Promise<Member | null>;
  findByMatric(matric: string): Promise<Member | null>;
  search(query: string): Promise<Member[]>;
  update(id: string, updates: Partial<Member>): Promise<Member>;
}

