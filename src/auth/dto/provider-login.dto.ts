import { Provider } from '@prisma/client'
import { IsEnum, IsString } from 'class-validator'

export class ProviderLoginDto {
  @IsEnum(Provider)
  provider: Provider

  @IsString()
  accessToken: string
} 