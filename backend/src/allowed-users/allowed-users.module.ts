import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GoogleModule } from '../google/google.module';
import { AllowedUsersService } from './allowed-users.service';
import { ALLOWED_USERS_REPOSITORY } from './repositories/allowed-users.repository.interface';
import { GoogleSheetsAllowedUsersRepository } from './repositories/google-sheets-allowed-users.repository';

@Module({
  imports: [ConfigModule, GoogleModule],
  providers: [
    AllowedUsersService,
    {
      provide: ALLOWED_USERS_REPOSITORY,
      useClass: GoogleSheetsAllowedUsersRepository,
    },
  ],
  exports: [AllowedUsersService],
})
export class AllowedUsersModule {}
