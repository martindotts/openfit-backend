import { Controller, Post, UseGuards, Get, Req, Res, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthGuard } from '@nestjs/passport'
import { Response, Request } from 'express'
import { User } from '@prisma/client'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Req() req: Request, @Res() res: Response) {
    const { access_token } = this.authService.generateAuthResponse(req.user as User)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${access_token}`)
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // El guard de Passport maneja la redirección a Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    const { access_token } = this.authService.generateAuthResponse(req.user)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${access_token}`)
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refresh_token: string) {
    return this.authService.refreshToken(refresh_token)
  }
}
