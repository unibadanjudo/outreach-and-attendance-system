import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { AllowedUsersService } from '../allowed-users/allowed-users.service';
import { UserStatus } from '../allowed-users/models/allowed-user.model';
import { UserSession } from './interfaces/user-session.interface';

export interface GoogleProfile {
  id?: string;
  displayName?: string;
  name?: {
    givenName?: string;
    familyName?: string;
  };
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly allowedUsersService: AllowedUsersService) {}

  /**
   * Checks if an email is authorized and active in the Google Sheets allowlist.
   */
  async isEmailAuthorized(email: string): Promise<boolean> {
    if (!email) return false;
    return this.allowedUsersService.isAllowed(email);
  }

  /**
   * Validates a Google OAuth profile against the AllowedUsers sheet.
   */
  async validateGoogleUser(profile: GoogleProfile): Promise<UserSession> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      this.logger.warn('Google OAuth login attempted without an email');
      throw new UnauthorizedException('No email provided by Google account');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const access = await this.allowedUsersService.getAccess(normalizedEmail);

    if (!access || access.status !== UserStatus.ACTIVE) {
      this.logger.warn(
        `Unauthorized login attempt from Google account: ${normalizedEmail}`,
      );
      throw new UnauthorizedException(
        'Email is not authorized to access this system',
      );
    }

    const name =
      access.name ||
      profile.displayName ||
      (profile.name
        ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim()
        : '') ||
      normalizedEmail;

    const picture = access.profileUrl || profile.photos?.[0]?.value;

    this.logger.log(`User authorized successfully: ${normalizedEmail}`);

    return {
      email: normalizedEmail,
      name,
      picture,
      role: access.role || 'MEMBER',
      rank: access.rank,
    };
  }
}
