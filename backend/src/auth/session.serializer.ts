import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserSession } from './interfaces/user-session.interface';
import { AuthService } from './auth.service';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly authService: AuthService) {
    super();
  }

  serializeUser(
    user: UserSession,
    done: (err: Error | null, user: UserSession) => void,
  ): void {
    done(null, user);
  }

  async deserializeUser(
    payload: UserSession,
    done: (err: Error | null, payload: UserSession | null) => void,
  ): Promise<void> {
    try {
      const authorized = await this.authService.isEmailAuthorized(payload.email);
      if (!authorized) {
        return done(null, null);
      }
      done(null, payload);
    } catch (err) {
      done(err as Error, null);
    }
  }
}
