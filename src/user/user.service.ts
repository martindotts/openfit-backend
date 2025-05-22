import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../system/prisma/prisma.service'
import { Prisma, User } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { CreateLocalUserDto } from './dto/createLocalUser.dto'
import { CreateProviderUserDto } from './dto/createProviderUser.dto'

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createLocal(createLocalUserDto: CreateLocalUserDto): Promise<User> {
    const hashedPassword = await this.hashPassword(createLocalUserDto.password)
    
    return await this.prisma.user.create({
      data: {
        email: createLocalUserDto.email,
        name: createLocalUserDto.name,
        authLocal: {
          create: {
            password: hashedPassword
          }
        }
      },
      include: {
        authLocal: true
      }
    })
  }

  async createProvider(createProviderUserDto: CreateProviderUserDto): Promise<User> {
    return await this.prisma.user.create({
      data: {
        email: createProviderUserDto.email,
        name: createProviderUserDto.name,
        authProvider: {
          create: {
            provider: createProviderUserDto.provider,
            providerUserId: createProviderUserDto.providerUserId
          }
        }
      },
      include: {
        authProvider: true
      }
    })
  }

  async findMany(filter: Prisma.UserWhereInput): Promise<User[]> {
    return await this.prisma.user.findMany({ 
      where: filter
    })
  }

  async findOne(filter: Prisma.UserWhereUniqueInput): Promise<User | null> {
    const result = await this.prisma.user.findUnique({ 
      where: filter
    })
    return result
  }

  async update(filter: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput): Promise<User | null> {
    const user = await this.findOne(filter)
    if (!user) {
      return null
    }

    const { authLocal, ...userData } = data
    const updateData: Prisma.UserUpdateInput = { ...userData }

    const password = authLocal?.update?.password
    if (typeof password === 'string') {
      updateData.authLocal = {
        update: {
          password: await this.hashPassword(password)
        }
      }
    }

    return await this.prisma.user.update({ 
      where: filter, 
      data: updateData,
      include: authLocal ? { authLocal: true } : undefined
    })
  }

  async remove(filter: Prisma.UserWhereUniqueInput): Promise<User | null> {
    const user = await this.findOne(filter)
    if (!user) {
      return null
    }
    return await this.prisma.user.delete({ 
      where: filter
    })
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10
    return bcrypt.hash(password, saltRounds)
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword)
  }
}
