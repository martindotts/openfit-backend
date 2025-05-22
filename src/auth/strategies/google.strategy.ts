import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, VerifyCallback } from 'passport-google-oauth20'
import { ConfigService } from '@nestjs/config'
import { Profile } from 'passport'
import { UserService } from 'src/user/user.service'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService, private userService: UserService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['openid', 'email', 'profile'],
      passReqToCallback: false
    })
  }

  async validate(_accessToken: string, _refreshToken: string, profile: Profile, done: VerifyCallback) {
    const { id, name, emails } = profile

    if (!emails) {
      return done(new Error('No se pudo obtener el email del usuario'))
    }

    const email = emails[0].value

    const foundUser = await this.userService.findOne({ email })

    if (foundUser) {
      return done(null, foundUser)
    }

    const simpleName = name?.givenName ?? 'Gymrat'

    const newUser = await this.userService.createProvider({
      email,
      name: simpleName,
      provider: 'GOOGLE',
      providerUserId: id,
    })

    return done(null, newUser)
  }
}