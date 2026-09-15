import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(private readonly configService: ConfigService) {}

  /**
   * Returns list of lowercase authorized emails configured in environment.
   */
  getAuthorizedEmails(): string[] {
    const rawEmails = this.configService.get<string>('AUTHORIZED_EMAILS') || '';

    return rawEmails
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
  }

  /**
   * Checks if an email is authorized to access the system.
   */
  isEmailAuthorized(email: string): boolean {
    if (!email) return false;
    const authorizedEmails = this.getAuthorizedEmails();
    return authorizedEmails.includes(email.trim().toLowerCase());
  }

  /**
   * Validates a Google OAuth profile against authorized club accounts.
   */
  validateGoogleUser(profile: GoogleProfile): UserSession {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      this.logger.warn('Google OAuth login attempted without an email');
      throw new UnauthorizedException('No email provided by Google account');
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!this.isEmailAuthorized(normalizedEmail)) {
      this.logger.warn(
        `Unauthorized login attempt from Google account: ${normalizedEmail}`,
      );
      throw new UnauthorizedException(
        'Email is not authorized to access this system',
      );
    }

    const name =
      profile.displayName ||
      (profile.name
        ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim()
        : '') ||
      normalizedEmail;

    const picture = profile.photos?.[0]?.value;

    this.logger.log(`User authorized successfully: ${normalizedEmail}`);

    return {
      email: normalizedEmail,
      name,
      picture,
      role: 'ADMIN',
    };
  }
}
