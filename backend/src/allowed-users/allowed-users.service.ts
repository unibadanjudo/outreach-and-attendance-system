import { Inject, Injectable, Logger } from '@nestjs/common';
import { AllowedUser, UserStatus } from './models/allowed-user.model';
import {
  ALLOWED_USERS_REPOSITORY,
  type AllowedUsersRepository,
} from './repositories/allowed-users.repository.interface';

@Injectable()
export class AllowedUsersService {
  private readonly logger = new Logger(AllowedUsersService.name);

  constructor(
    @Inject(ALLOWED_USERS_REPOSITORY)
    private readonly repository: AllowedUsersRepository,
  ) {}

  /**
   * Retrieves access information for a given email address.
   * Fails closed (returns null) if the user is missing, inactive, or on error.
   */
  async getAccess(email: string): Promise<AllowedUser | null> {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    try {
      const user = await this.repository.findByEmail(cleanEmail);
      if (!user) {
        this.logger.warn(`Access check failed: Email ${cleanEmail} not found in AllowedUsers`);
        return null;
      }

      if (user.status !== UserStatus.ACTIVE) {
        this.logger.warn(`Access check failed: Email ${cleanEmail} is ${user.status}`);
        return null;
      }

      return user;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Access check error for ${cleanEmail}: ${message}`);
      return null;
    }
  }

  /**
   * Determines if an email is authorized and active in the system.
   */
  async isAllowed(email: string): Promise<boolean> {
    const access = await this.getAccess(email);
    return Boolean(access && access.status === UserStatus.ACTIVE);
  }

  /**
   * Lists all allowed users from the sheet.
   */
  async getAll(): Promise<AllowedUser[]> {
    try {
      return await this.repository.findAll();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Failed to list allowed users: ${message}`);
      return [];
    }
  }
}
