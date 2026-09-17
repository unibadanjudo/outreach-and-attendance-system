export enum Role {
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  CAPTAIN = 'CAPTAIN',
  REACHER = 'REACHER',
  MEMBER = 'MEMBER',
}

export type UserRole =
  | Role
  | 'ADMIN'
  | 'COACH'
  | 'CAPTAIN'
  | 'REACHER'
  | 'MEMBER'
  | 'OFFICIAL'
  | string;

export interface UserSession {
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  rank?: string;
}
