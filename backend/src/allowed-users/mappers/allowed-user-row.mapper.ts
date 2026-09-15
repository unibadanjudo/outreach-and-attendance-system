import { AllowedUser, UserStatus } from '../models/allowed-user.model';
import { cellToString } from '../../google/mappers/sheet-row.mapper';

export const ALLOWED_USERS_HEADERS = [
  'Email',
  'Name',
  'Rank',
  'Status',
  'Added At',
  'Profile URL',
];

export type AllowedUserField = keyof AllowedUser;

export const HEADER_ALIASES: Record<string, AllowedUserField> = {
  email: 'email',
  emailaddress: 'email',
  useremail: 'email',
  name: 'name',
  fullname: 'name',
  displayname: 'name',
  rank: 'role',
  role: 'role',
  userrank: 'role',
  userrole: 'role',
  status: 'status',
  userstatus: 'status',
  addedat: 'addedAt',
  dateadded: 'addedAt',
  timestamp: 'addedAt',
  createdat: 'addedAt',
  profileurl: 'profileUrl',
  profilepicture: 'profileUrl',
  photo: 'profileUrl',
  picture: 'profileUrl',
  avatar: 'profileUrl',
};

export function cleanHeaderKey(rawHeader: string): string {
  return rawHeader.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function mapHeadersToAllowedUserKeys(
  headers: string[],
): (AllowedUserField | null)[] {
  return headers.map((header) => {
    const cleaned = cleanHeaderKey(header);
    return HEADER_ALIASES[cleaned] ?? null;
  });
}

export function rowToAllowedUser(
  headerKeys: (AllowedUserField | null)[],
  rowValues: unknown[],
): AllowedUser | null {
  const partial: Record<string, string> = {};

  headerKeys.forEach((key, idx) => {
    if (key && idx < rowValues.length) {
      partial[key] = cellToString(rowValues[idx]);
    }
  });

  const rawEmail = partial.email ? partial.email.trim().toLowerCase() : '';
  if (!rawEmail) return null;

  const rawStatus = (partial.status || '').trim().toLowerCase();
  const status =
    rawStatus === 'active' ? UserStatus.ACTIVE : UserStatus.INACTIVE;

  const role = (partial.role || 'MEMBER').trim().toUpperCase();

  return {
    email: rawEmail,
    name: (partial.name || '').trim() || rawEmail,
    role,
    rank: role,
    status,
    addedAt: (partial.addedAt || '').trim() || new Date().toISOString(),
    profileUrl: (partial.profileUrl || '').trim() || undefined,
  };
}

export function allowedUserToRow(user: AllowedUser): (string | number)[] {
  return [
    user.email,
    user.name,
    user.role,
    user.status,
    user.addedAt,
    user.profileUrl || '',
  ];
}
