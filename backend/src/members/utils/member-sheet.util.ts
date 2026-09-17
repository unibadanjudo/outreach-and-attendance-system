import { NotFoundException } from '@nestjs/common';
import { GoogleSheetsService } from '../../google/google-sheets.service';
import {
  buildRowRange,
  columnIndexToLetter,
  parseSheetName,
} from '../../google/mappers/sheet-row.mapper';
import {
  mapHeadersToMemberKeys,
  rowToMember,
  sanitizePhoneNumber,
} from '../mappers/member-row.mapper';
import { Member } from '../models/member.model';

export interface FoundMemberRow {
  rowIndex: number; // 1-indexed sheet row
  rowValues: string[];
  member: Member;
}

export function findMemberRow(
  raw: string[][],
  headerKeys: (keyof Member | 'memberId' | null)[],
  id: string,
): FoundMemberRow | null {
  const cleanId = id.trim().toLowerCase();
  const cleanPhone = sanitizePhoneNumber(id);

  for (let i = 1; i < raw.length; i++) {
    const row = raw[i];
    const member = rowToMember(headerKeys, row, i + 1);

    const idMatch = member.id.toLowerCase() === cleanId;
    const phoneMatch =
      cleanPhone.length >= 7 &&
      sanitizePhoneNumber(member.phoneNumber) === cleanPhone;
    const matricMatch =
      Boolean(member.matricNumber) &&
      member.matricNumber.trim().toLowerCase() === cleanId;

    if (idMatch || phoneMatch || matricMatch) {
      return { rowIndex: i + 1, rowValues: [...row], member };
    }
  }

  return null;
}

const FIELD_TO_HEADER_TITLE: Partial<Record<keyof Member, string>> = {
  beltRank: 'Belt Rank',
  firstName: 'First Name',
  lastName: 'Last Name',
  otherNames: 'Other Names',
  nickname: 'Nick Name',
  phoneNumber: 'Phone Number',
  facultyDepartment: 'Faculty-Department',
  matricNumber: 'Matric',
  dateOfBirth: 'Date Of Birth',
  judoStartDate: 'Date You Started Judo',
  motivation: 'Primary Motivation for Training Judo',
  howDidYouHearAboutUs: 'How did you hear about Judo',
};

export async function ensureColumnForField(
  googleSheetsService: GoogleSheetsService,
  sheetName: string,
  headers: string[],
  field: keyof Member,
): Promise<number> {
  const headerKeys = mapHeadersToMemberKeys(headers);
  const existingIdx = headerKeys.indexOf(field);
  if (existingIdx !== -1) return existingIdx;

  const newColIdx = headers.length;
  const colLetter = columnIndexToLetter(newColIdx);
  const headerTitle = FIELD_TO_HEADER_TITLE[field] || String(field);

  await googleSheetsService.updateCells(`${sheetName}!${colLetter}1`, [
    [headerTitle],
  ]);
  headers.push(headerTitle);
  return newColIdx;
}

export async function updateMemberInSheet(
  googleSheetsService: GoogleSheetsService,
  membersRange: string,
  id: string,
  updates: Partial<Member>,
): Promise<Member> {
  const raw = await googleSheetsService.readRange(membersRange);
  if (!raw || raw.length <= 1) {
    throw new NotFoundException(`No members found in directory.`);
  }

  const sheet = parseSheetName(membersRange);
  const headers = [...raw[0]];
  let headerKeys = mapHeadersToMemberKeys(headers);

  const found = findMemberRow(raw, headerKeys, id);
  if (!found) {
    throw new NotFoundException(`Member with identifier "${id}" not found.`);
  }

  const rowValues = [...found.rowValues];

  for (const [key, val] of Object.entries(updates)) {
    if (val === undefined) continue;
    const field = key as keyof Member;
    let colIdx = headerKeys.indexOf(field);
    if (colIdx === -1) {
      colIdx = await ensureColumnForField(
        googleSheetsService,
        sheet,
        headers,
        field,
      );
      headerKeys = mapHeadersToMemberKeys(headers);
    }

    while (rowValues.length <= colIdx) {
      rowValues.push('');
    }
    rowValues[colIdx] = String(val);
  }

  const range = buildRowRange(sheet, found.rowIndex, headers.length);
  while (rowValues.length < headers.length) {
    rowValues.push('');
  }

  await googleSheetsService.updateCells(range, [rowValues]);
  return rowToMember(headerKeys, rowValues, found.rowIndex);
}
