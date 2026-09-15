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
