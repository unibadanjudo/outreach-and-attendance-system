import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class DevAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Directly authenticate in Postman for development/testing',
  })
  @ApiResponse({
    status: 200,
    description: 'Direct session login for Postman testing',
  })
  devLogin(
    @Body('email') email: string,
    @Req() req: Request,
    @Res() res: Response,
  ): void {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new NotFoundException();
    }

    const targetEmail = (email || 'coach@uijudo.club').trim().toLowerCase();

    if (!this.authService.isEmailAuthorized(targetEmail)) {
      throw new BadRequestException(`Email ${targetEmail} is not authorized`);
    }

    const user = {
      email: targetEmail,
      name: 'UI Coach (Dev Session)',
      role: 'ADMIN',
    };

    req.login(user, (err) => {
      if (err) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: {
            code: 'LOGIN_FAILED',
            message: 'Failed to establish session',
          },
        });
      }

      return res.json({
        success: true,
        data: {
          message: 'Authenticated successfully in Postman session',
          user,
        },
      });
    });
  }
}
