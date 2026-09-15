import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  OUTREACH_REPOSITORY,
  type OutreachRepository,
} from '../repositories/outreach.repository.interface';
import {
  MEMBER_REPOSITORY,
  type MemberRepository,
} from '../../members/repositories/member.repository.interface';
import { OutreachQueueService } from './outreach-queue.service';
import { CreateOutreachDto } from '../dto/create-outreach.dto';
import { UpdateOutreachDto } from '../dto/update-outreach.dto';
import { QueryOutreachDto } from '../dto/query-outreach.dto';
import { QueryOutreachQueueDto } from '../dto/query-outreach-queue.dto';
import {
  MemberOutreachHistoryDto,
  PaginatedOutreachDto,
} from '../dto/outreach-response.dto';
import { PaginatedOutreachQueueDto } from '../dto/outreach-queue-response.dto';
import { Outreach } from '../models/outreach.model';

@Injectable()
export class OutreachService {
  constructor(
    @Inject(OUTREACH_REPOSITORY)
    private readonly outreachRepository: OutreachRepository,
    @Inject(MEMBER_REPOSITORY)
    private readonly memberRepository: MemberRepository,
    private readonly queueService: OutreachQueueService,
  ) {}

  async findAll(query: QueryOutreachDto): Promise<PaginatedOutreachDto> {
    let list = await this.outreachRepository.findAll();
    if (query.memberId) {
      const mid = query.memberId.trim().toLowerCase();
      list = list.filter((o) => o.memberId.toLowerCase() === mid);
    }
    if (query.status) list = list.filter((o) => o.status === query.status);
    if (query.contactMethod) {
      list = list.filter((o) => o.contactMethod === query.contactMethod);
    }
    if (query.startDate) {
      list = list.filter((o) => o.contactedAt >= query.startDate!);
    }
    if (query.endDate) {
      list = list.filter((o) => o.contactedAt <= query.endDate!);
    }

    list.sort((a, b) => b.contactedAt.localeCompare(a.contactedAt));
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
    const total = list.length;
    const items = list.slice((page - 1) * limit, page * limit);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async findById(id: string): Promise<Outreach> {
    const item = await this.outreachRepository.findById(id);
    if (!item) {
      throw new NotFoundException(`Outreach record with ID ${id} not found`);
    }
    return item;
  }

  async findByMemberId(memberId: string): Promise<MemberOutreachHistoryDto> {
    const member = await this.memberRepository.findById(memberId);
    if (!member) {
      throw new NotFoundException(`Member with ID ${memberId} not found`);
    }
    const items = await this.outreachRepository.findByMemberId(memberId);
    items.sort((a, b) => b.contactedAt.localeCompare(a.contactedAt));
    return {
      memberId,
      totalOutreach: items.length,
      lastContactedAt: items[0]?.contactedAt || null,
      items,
    };
  }

  async create(
    dto: CreateOutreachDto,
    defaultContactedBy = 'Staff',
  ): Promise<Outreach> {
    const member = await this.memberRepository.findById(dto.memberId);
    if (!member) {
      throw new NotFoundException(`Member with ID ${dto.memberId} not found`);
    }

    const now = new Date().toISOString();
    const newRecord: Outreach = {
      id: `outreach-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      memberId: dto.memberId.trim(),
      contactedBy: (dto.contactedBy || defaultContactedBy).trim(),
      contactedAt: dto.contactedAt || now,
      contactMethod: dto.contactMethod,
      status: dto.status,
      message: dto.message.trim(),
      response: dto.response?.trim(),
      nextFollowUpDate: dto.nextFollowUpDate || null,
      createdAt: now,
      updatedAt: now,
    };

    return this.outreachRepository.create(newRecord);
  }

  async update(id: string, dto: UpdateOutreachDto): Promise<Outreach> {
    return this.outreachRepository.update(id, dto);
  }

  async getQueue(
    query: QueryOutreachQueueDto,
  ): Promise<PaginatedOutreachQueueDto> {
    return this.queueService.getQueue(query);
  }
}
