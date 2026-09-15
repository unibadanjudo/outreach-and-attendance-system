import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { DevAuthController } from './dev-auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google/google.strategy';
import { SessionSerializer } from './session.serializer';
import { GoogleModule } from './google/google.module';

@Module({
  imports: [PassportModule.register({ session: true }), GoogleModule],
  controllers: [AuthController, DevAuthController],
  providers: [AuthService, GoogleStrategy, SessionSerializer],
  exports: [AuthService, PassportModule],
})
export class AuthModule {}
