export enum Role {
  ADMIN = 'ADMIN',
  COACH = 'COACH',
  CAPTAIN = 'CAPTAIN',
  REACHER = 'REACHER',
  MEMBER = 'MEMBER',
}

export interface UserSession {
  id?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  picture?: string;
  role?: string;
}

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  authenticated?: boolean;
  user?: UserSession;
}

export const canMarkAttendance = (role?: string): boolean => {
  if (!role) return false;
  const upper = role.toUpperCase();
  return upper === Role.ADMIN || upper === Role.COACH || upper === Role.CAPTAIN;
};

export const canManageMembers = (role?: string): boolean => {
  if (!role) return false;
  const upper = role.toUpperCase();
  return upper === Role.ADMIN || upper === Role.COACH || upper === Role.CAPTAIN;
};

export const isReacher = (role?: string): boolean => {
  return role?.toUpperCase() === Role.REACHER;
};

export const isFullAccessRole = (role?: string): boolean => {
  return canMarkAttendance(role);
};
