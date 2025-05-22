import { Provider } from '@prisma/client'
import { IsEmail, IsEnum, IsString } from 'class-validator'

export class CreateProviderUserDto {
  @IsEmail()
  email: string

  @IsString()
  name: string

  @IsEnum(Provider)
  provider: Provider

  @IsString()
  providerUserId: string
}