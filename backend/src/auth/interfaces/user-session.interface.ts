export type UserRole = 'ADMIN' | 'COACH' | 'MEMBER' | 'OFFICIAL' | string;

export interface UserSession {
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  rank?: string;
}
