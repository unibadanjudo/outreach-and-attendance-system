export type UserRole = 'ADMIN' | 'COACH';

export interface UserSession {
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
}
