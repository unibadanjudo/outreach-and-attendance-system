import { Module } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';
import { GoogleSheetsService } from './google-sheets.service';

@Module({
  providers: [GoogleAuthService, GoogleSheetsService],
  exports: [GoogleAuthService, GoogleSheetsService],
})
export class GoogleModule {}
