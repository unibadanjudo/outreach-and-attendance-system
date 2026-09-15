import { AllowedUser } from '../models/allowed-user.model';

export const ALLOWED_USERS_REPOSITORY = 'ALLOWED_USERS_REPOSITORY';

export interface AllowedUsersRepository {
  findAll(): Promise<AllowedUser[]>;
  findByEmail(email: string): Promise<AllowedUser | null>;
}
