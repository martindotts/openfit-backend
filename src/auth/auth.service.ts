import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { LoginDto } from './dto/login.dto'
import { JwtPayload } from './interfaces/jwt-payload.interface'
import { PrismaService } from 'src/system/prisma/prisma.service'
import { UserService } from 'src/user/user.service'
import { User } from '@prisma/client'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async validateUserCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { authLocal: true },
    })

    if (!user || !user.authLocal) {
      return null
    }

    const isPasswordValid = await this.userService.validatePassword(password, user.authLocal.password)

    if (!isPasswordValid) {
      return null
    }

    return user
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUserCredentials(loginDto.email, loginDto.password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return this.generateAuthResponse(user)
  }

  async handleProviderAuth(profile: any) {
    // Aquí procesamos la información del usuario del proveedor
    // y generamos nuestro JWT
    return this.generateAuthResponse(profile)
  }

  public generateAuthResponse(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    }

    const access_token = this.jwtService.sign(payload, {
      expiresIn: '15m'
    })

    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '7d'
    })

    return {
      access_token,
      refresh_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    }
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.userService.findOne({ id: payload.sub })

    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }

  async refreshToken(refresh_token: string) {
    try {
      const payload = this.jwtService.verify(refresh_token)
      const user = await this.validateUser(payload)
      return this.generateAuthResponse(user)
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }
}
