import { Member } from '../models/member.model';
import { cellToString } from '../../google/mappers/sheet-row.mapper';

export const HEADER_ALIASES: Record<string, keyof Member | 'memberId'> = {
  timestamp: 'createdAt',
  createdat: 'createdAt',
  firstname: 'firstName',
  lastname: 'lastName',
  othernames: 'otherNames',
  nickname: 'nickname',
  phonenumber: 'phoneNumber',
  phone: 'phoneNumber',
  whatsappnumber: 'phoneNumber',
  whatsapp: 'phoneNumber',
  facultydepartment: 'facultyDepartment',
  facultyanddepartment: 'facultyDepartment',
  department: 'facultyDepartment',
  matric: 'matricNumber',
  matricnumber: 'matricNumber',
  matricno: 'matricNumber',
  dateofbirth: 'dateOfBirth',
  dob: 'dateOfBirth',
  dateyoustartedjudo: 'judoStartDate',
  datestartedjudo: 'judoStartDate',
  startdate: 'judoStartDate',
  primarymotivationfortrainingjudo: 'motivation',
  motivation: 'motivation',
  howdidyouhearaboutjudo: 'howDidYouHearAboutUs',
  howdidyouhearaboutus: 'howDidYouHearAboutUs',
  beltrank: 'beltRank',
  belt: 'beltRank',
  rank: 'beltRank',
  grade: 'beltRank',
  judobelt: 'beltRank',
  currentbeltrank: 'beltRank',
  currentrank: 'beltRank',
  currentbelt: 'beltRank',
  memberid: 'memberId',
  id: 'memberId',
};

export function cleanHeaderKey(rawHeader: string): string {
  const firstLine = rawHeader.split(/\r?\n/)[0];
  return firstLine.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10 && ['7', '8', '9'].includes(digits[0])) {
    return `0${digits}`;
  }
  if (digits.length === 13 && digits.startsWith('234')) {
    return `0${digits.substring(3)}`;
  }
  if (digits.length === 14 && digits.startsWith('0234')) {
    return `0${digits.substring(4)}`;
  }
  return digits;
}

export function generateMemberId(
  phone: string,
  matric: string,
  explicitId?: string,
  fallbackIndex = 0,
): string {
  const cleanPhone = normalizePhoneNumber(phone);
  if (cleanPhone.length >= 7) {
    return `mem_${cleanPhone}`;
  }
  const cleanMatric = matric.trim().replace(/[^a-zA-Z0-9]/g, '');
  if (cleanMatric.length >= 3) {
    return `mem_${cleanMatric.toLowerCase()}`;
  }
  if (explicitId && explicitId.trim()) {
    return explicitId.trim();
  }
  return `mem_gen_${fallbackIndex}_${Date.now()}`;
}

export function resolveHeaderKey(rawHeader: string): keyof Member | 'memberId' | null {
  const cleaned = cleanHeaderKey(rawHeader);
  if (HEADER_ALIASES[cleaned]) return HEADER_ALIASES[cleaned];

  const fullCleaned = rawHeader.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (HEADER_ALIASES[fullCleaned]) return HEADER_ALIASES[fullCleaned];

  if (cleaned.startsWith('faculty') || cleaned.includes('department')) return 'facultyDepartment';
  if (fullCleaned.includes('startedjudo') || fullCleaned.includes('datejoined') || fullCleaned.includes('startdate')) return 'judoStartDate';
  if (cleaned.includes('dateofbirth') || cleaned === 'dob' || cleaned.includes('birthdate')) return 'dateOfBirth';
  if (fullCleaned.includes('motivation')) return 'motivation';
  if (fullCleaned.includes('howdidyouhear') || fullCleaned.includes('hearabout')) return 'howDidYouHearAboutUs';
  if (cleaned.includes('nickname') || cleaned === 'nick') return 'nickname';
  if (cleaned.includes('othernames') || cleaned.includes('middlename')) return 'otherNames';
  if (cleaned.includes('firstname')) return 'firstName';
  if (cleaned.includes('lastname') || cleaned.includes('surname')) return 'lastName';
  if (cleaned.includes('matric')) return 'matricNumber';
  if (cleaned.includes('phone') || cleaned.includes('whatsapp')) return 'phoneNumber';
  if (cleaned.includes('belt') || cleaned.includes('rank')) return 'beltRank';
  return null;
}

export function mapHeadersToMemberKeys(
  headers: string[],
): (keyof Member | 'memberId' | null)[] {
  return headers.map((header) => resolveHeaderKey(header));
}

export function rowToMember(
  headerKeys: (keyof Member | 'memberId' | null)[],
  rowValues: unknown[],
  rowIndex = 1,
): Member {
  const partial: Record<string, string> = {};

  headerKeys.forEach((key, idx) => {
    if (key && idx < rowValues.length) {
      partial[key] = cellToString(rowValues[idx]);
    }
  });

  const phone = partial.phoneNumber || '';
  const normalizedPhone = normalizePhoneNumber(phone);
  const matric = partial.matricNumber || '';
  const explicitId = partial.memberId;
  const id = generateMemberId(normalizedPhone, matric, explicitId, rowIndex);

  return {
    id,
    firstName: partial.firstName || '',
    lastName: partial.lastName || '',
    otherNames: partial.otherNames || '',
    nickname: partial.nickname || '',
    phoneNumber: normalizedPhone || phone,
    facultyDepartment: partial.facultyDepartment || '',
    matricNumber: matric,
    dateOfBirth: partial.dateOfBirth || '',
    judoStartDate: partial.judoStartDate || '',
    motivation: partial.motivation || '',
    howDidYouHearAboutUs: partial.howDidYouHearAboutUs || '',
    beltRank: partial.beltRank || 'Unranked',
    createdAt: partial.createdAt || new Date().toISOString(),
    updatedAt: partial.createdAt || new Date().toISOString(),
  };
}
