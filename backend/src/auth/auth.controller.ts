import {
  Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthenticatedGuard } from '../common/guards/authenticated.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import type { UserSession } from './interfaces/user-session.interface';
import { renderAuthSuccessHtml } from './utils/auth-html.util';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Initiate Google OAuth login flow' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to Google consent screen',
  })
  googleAuth(): void {
    // Handled automatically by Passport GoogleAuthGuard
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback handler' })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend application',
  })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    const user = req.user as UserSession;

    if (!user || !(await this.authService.isEmailAuthorized(user.email))) {
      res.redirect(`${frontendUrl}/unauthorized`);
      return;
    }

    if (req.query.state === 'postman') {
      const rawCookie = res.getHeader('set-cookie');
      const cookieStr = Array.isArray(rawCookie) ? rawCookie[0] : (rawCookie as string) || '';
      res.type('html').send(renderAuthSuccessHtml(user, cookieStr.split(';')[0]));
      return;
    }

    if (req.session) {
      await new Promise<void>((resolve) => {
        req.session.save(() => resolve());
      });
    }

    res.redirect(`${frontendUrl}/auth/callback?status=success`);
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Get currently authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user session profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - session missing or invalid',
  })
  getMe(@CurrentUser() user: UserSession): UserSession {
    return user;
  }

  @Get('status')
  @ApiOperation({ summary: 'Check current authentication status' })
  @ApiResponse({
    status: 200,
    description: 'Returns authentication state and user details if logged in',
  })
  getStatus(@Req() req: Request) {
    const isAuthenticated = Boolean(
      req.isAuthenticated && req.isAuthenticated(),
    );
    return {
      isAuthenticated,
      authenticated: isAuthenticated,
      user: isAuthenticated ? (req.user as UserSession) : null,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log out and invalidate user session' })
  @ApiResponse({
    status: 200,
    description: 'Session invalidated and cookie cleared',
  })
  logout(@Req() req: Request, @Res() res: Response): void {
    this.handleLogout(req, res);
  }

  @Get('logout')
  @ApiOperation({ summary: 'Log out and invalidate user session via GET' })
  logoutGet(@Req() req: Request, @Res() res: Response): void {
    this.handleLogout(req, res);
  }

  private handleLogout(req: Request, res: Response): void {
    const finish = () => {
      const isProd =
        this.configService.get<string>('NODE_ENV') === 'production';
      const frontendUrl = this.configService.get<string>(
        'FRONTEND_URL',
        'http://localhost:5173',
      );
      const isLocalhost =
        frontendUrl.includes('localhost') || frontendUrl.includes('127.0.0.1');
      const isSecure = isProd && !isLocalhost;
      res.clearCookie('uijudo.sid', {
        path: '/',
        httpOnly: true,
        sameSite: isSecure ? 'none' : 'lax',
        secure: isSecure,
      });

      res.json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    };

    req.logout(() => {
      if (req.session) {
        req.session.destroy(() => finish());
      } else {
        finish();
      }
    });
  }
}
