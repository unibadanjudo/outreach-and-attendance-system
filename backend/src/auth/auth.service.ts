import { Injectable, Logger, Optional, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(
    private readonly allowedUsersService: AllowedUsersService,
    @Optional() private readonly configService?: ConfigService,
  ) {}

  /**
   * Returns list of lowercase authorized emails configured in environment.
   */
  getAuthorizedEmails(): string[] {
    if (!this.configService) return [];
    const rawEmails = this.configService.get<string>('AUTHORIZED_EMAILS') || '';
    return rawEmails
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }

  /**
   * Checks if an email is authorized in Google Sheets allowlist or environment fallback.
   */
  async isEmailAuthorized(email: string): Promise<boolean> {
    if (!email) return false;
    const cleanEmail = email.trim().toLowerCase();

    try {
      const allowed = await this.allowedUsersService.isAllowed(cleanEmail);
      if (allowed) return true;
    } catch (err) {
      this.logger.warn(`Sheet access check failed for ${cleanEmail}: ${err}`);
    }

    return this.getAuthorizedEmails().includes(cleanEmail);
  }

  /**
   * Validates a Google OAuth profile against the AllowedUsers sheet with env fallback.
   */
  async validateGoogleUser(profile: GoogleProfile): Promise<UserSession> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      this.logger.warn('Google OAuth login attempted without an email');
      throw new UnauthorizedException('No email provided by Google account');
    }

    const normalizedEmail = email.trim().toLowerCase();
    let access = await this.allowedUsersService.getAccess(normalizedEmail);

    // If not found in Google Sheets, check environment AUTHORIZED_EMAILS fallback
    if (!access || access.status !== UserStatus.ACTIVE) {
      const envEmails = this.getAuthorizedEmails();
      if (envEmails.includes(normalizedEmail)) {
        this.logger.log(`User authorized via environment fallback: ${normalizedEmail}`);
        access = {
          email: normalizedEmail,
          name: profile.displayName || normalizedEmail,
          role: 'ADMIN',
          rank: 'ADMIN',
          status: UserStatus.ACTIVE,
          addedAt: new Date().toISOString(),
        };
      } else {
        this.logger.warn(
          `Unauthorized login attempt from Google account: ${normalizedEmail}`,
        );
        throw new UnauthorizedException(
          'Email is not authorized to access this system',
        );
      }
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
