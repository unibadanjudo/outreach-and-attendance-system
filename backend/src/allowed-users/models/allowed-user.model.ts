export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface AllowedUser {
  email: string;
  name: string;
  role: string;
  rank?: string;
  status: UserStatus;
  addedAt: string;
  profileUrl?: string;
}
