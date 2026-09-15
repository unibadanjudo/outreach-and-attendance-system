import {
  ContactMethod,
  Outreach,
  OutreachStatus,
} from '../models/outreach.model';

export const OUTREACH_SHEET_HEADERS = [
  'Outreach ID',
  'Member ID',
  'Contacted By',
  'Contacted At',
  'Contact Method',
  'Status',
  'Message',
  'Response',
  'Next Follow Up Date',
  'Created At',
  'Updated At',
] as const;

export type OutreachHeaderKey =
  | 'id'
  | 'memberId'
  | 'contactedBy'
  | 'contactedAt'
  | 'contactMethod'
  | 'status'
  | 'message'
  | 'response'
  | 'nextFollowUpDate'
  | 'createdAt'
  | 'updatedAt'
  | 'unknown';

export function normalizeOutreachHeader(header: string): OutreachHeaderKey {
  const clean = header
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
  switch (clean) {
    case 'outreachid':
    case 'id':
      return 'id';
    case 'memberid':
      return 'memberId';
    case 'contactedby':
      return 'contactedBy';
    case 'contactedat':
    case 'contactdate':
      return 'contactedAt';
    case 'contactmethod':
    case 'method':
      return 'contactMethod';
    case 'status':
      return 'status';
    case 'message':
    case 'notes':
      return 'message';
    case 'response':
    case 'memberresponse':
      return 'response';
    case 'nextfollowupdate':
    case 'followupdate':
      return 'nextFollowUpDate';
    case 'createdat':
      return 'createdAt';
    case 'updatedat':
      return 'updatedAt';
    default:
      return 'unknown';
  }
}

export function mapHeadersToOutreachKeys(
  headers: string[],
): OutreachHeaderKey[] {
  return headers.map(normalizeOutreachHeader);
}

export function rowToOutreach(
  headerKeys: OutreachHeaderKey[],
  row: string[],
  rowIndex: number,
): Outreach {
  const data: Partial<Record<OutreachHeaderKey, string>> = {};
  headerKeys.forEach((key, index) => {
    if (key !== 'unknown') {
      data[key] = row[index]?.trim() || '';
    }
  });

  const method = (data.contactMethod?.toUpperCase() ||
    ContactMethod.OTHER) as ContactMethod;
  const status = (data.status?.toUpperCase() ||
    OutreachStatus.PENDING) as OutreachStatus;

  return {
    id: data.id || `outreach-${rowIndex}`,
    memberId: data.memberId || '',
    contactedBy: data.contactedBy || '',
    contactedAt: data.contactedAt || '',
    contactMethod: Object.values(ContactMethod).includes(method)
      ? method
      : ContactMethod.OTHER,
    status: Object.values(OutreachStatus).includes(status)
      ? status
      : OutreachStatus.UNKNOWN,
    message: data.message || '',
    response: data.response || undefined,
    nextFollowUpDate: data.nextFollowUpDate || null,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}

export function outreachToRow(outreach: Outreach): (string | number)[] {
  return [
    outreach.id,
    outreach.memberId,
    outreach.contactedBy,
    outreach.contactedAt,
    outreach.contactMethod,
    outreach.status,
    outreach.message,
    outreach.response || '',
    outreach.nextFollowUpDate || '',
    outreach.createdAt,
    outreach.updatedAt,
  ];
}
