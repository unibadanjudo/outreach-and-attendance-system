import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { UserSession } from './interfaces/user-session.interface';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(
    user: UserSession,
    done: (err: Error | null, user: UserSession) => void,
  ): void {
    done(null, user);
  }

  deserializeUser(
    payload: UserSession,
    done: (err: Error | null, payload: UserSession | null) => void,
  ): void {
    if (!payload || !payload.email) {
      return done(null, null);
    }
    done(null, payload);
  }
}
