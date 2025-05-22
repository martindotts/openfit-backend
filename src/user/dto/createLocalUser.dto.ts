import { IsEmail, IsString, MinLength } from 'class-validator'

export class CreateLocalUserDto {
  @IsEmail()
  email: string

  @IsString()
  name: string

  @IsString()
  @MinLength(6)
  password: string
}