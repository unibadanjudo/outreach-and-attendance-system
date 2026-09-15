import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleSheetsService } from '../../google/google-sheets.service';
import {
  mapHeadersToMemberKeys,
  normalizePhoneNumber,
  rowToMember,
  sanitizePhoneNumber,
} from '../mappers/member-row.mapper';
import { Member } from '../models/member.model';
import { MemberRepository } from './member.repository.interface';
import { updateMemberInSheet } from '../utils/member-sheet.util';

@Injectable()
export class GoogleSheetsMemberRepository implements MemberRepository {
  private readonly logger = new Logger(GoogleSheetsMemberRepository.name);
  private readonly membersRange: string;

  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    configService: ConfigService,
  ) {
    this.membersRange =
      configService.get<string>('GOOGLE_SHEETS_MEMBERS_RANGE') || 'Members!A:Z';
  }

  async findAll(): Promise<Member[]> {
    const rawData = await this.googleSheetsService.readRange(this.membersRange);
    if (!rawData || rawData.length <= 1) {
      return [];
    }

    const headers = rawData[0];
    const headerKeys = mapHeadersToMemberKeys(headers);

    return rawData
      .slice(1)
      .filter((row) => row.some((cell) => cell.trim().length > 0))
      .map((row, index) => rowToMember(headerKeys, row, index + 2));
  }

  async findById(id: string): Promise<Member | null> {
    const members = await this.findAll();
    const cleanLookupId = id.trim().toLowerCase();
    const cleanPhone = normalizePhoneNumber(id);

    return (
      members.find((m) => {
        if (m.id.toLowerCase() === cleanLookupId) return true;
        if (
          cleanPhone.length >= 7 &&
          normalizePhoneNumber(m.phoneNumber) === cleanPhone
        ) {
          return true;
        }
        if (
          m.matricNumber &&
          m.matricNumber.trim().toLowerCase() === cleanLookupId
        ) {
          return true;
        }
        return false;
      }) ?? null
    );
  }

  async findByPhone(phone: string): Promise<Member | null> {
    const cleanPhone = normalizePhoneNumber(phone);
    if (!cleanPhone) return null;
    const members = await this.findAll();
    return (
      members.find((m) => normalizePhoneNumber(m.phoneNumber) === cleanPhone) ??
      null
    );
  }

  async findByMatric(matric: string): Promise<Member | null> {
    const cleanMatric = matric.trim().toLowerCase();
    if (!cleanMatric) return null;
    const members = await this.findAll();
    return (
      members.find(
        (m) => m.matricNumber.trim().toLowerCase() === cleanMatric,
      ) ?? null
    );
  }

  async search(query: string): Promise<Member[]> {
    const members = await this.findAll();
    const q = query.trim().toLowerCase();
    if (!q) return members;

    const digits = sanitizePhoneNumber(q);

    return members.filter((m) => {
      const textMatch =
        m.firstName.toLowerCase().includes(q) ||
        m.lastName.toLowerCase().includes(q) ||
        m.otherNames.toLowerCase().includes(q) ||
        m.nickname.toLowerCase().includes(q) ||
        m.matricNumber.toLowerCase().includes(q) ||
        m.facultyDepartment.toLowerCase().includes(q);

      const phoneMatch =
        digits.length >= 3 &&
        sanitizePhoneNumber(m.phoneNumber).includes(digits);

      return textMatch || phoneMatch;
    });
  }

  async update(id: string, updates: Partial<Member>): Promise<Member> {
    return updateMemberInSheet(
      this.googleSheetsService,
      this.membersRange,
      id,
      updates,
    );
  }
}

