import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-apple'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppleStrategy extends PassportStrategy(Strategy, 'apple') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('APPLE_CLIENT_ID'),
      teamID: configService.getOrThrow<string>('APPLE_TEAM_ID'),
      keyID: configService.getOrThrow<string>('APPLE_KEY_ID'),
      privateKeyLocation: configService.getOrThrow<string>('APPLE_PRIVATE_KEY_PATH'),
      callbackURL: configService.getOrThrow<string>('APPLE_CALLBACK_URL'),
      scope: ['name', 'email'],
    })
  }
  
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { name, email } = profile
    const user = {
      email: email,
      name: name?.firstName + ' ' + name?.lastName,
      accessToken,
      provider: 'APPLE',
      providerUserId: profile.id,
    }
    done(null, user)
  }
} 