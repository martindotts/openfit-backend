import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException } from '@nestjs/common'
import { UserService } from './user.service'
import { Prisma, User } from '@prisma/client'
import { CreateLocalUserDto } from './dto/createLocalUser.dto'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  async create(@Body() data: CreateLocalUserDto): Promise<User> {
    return this.userService.createLocal(data)
  }

  @Get()
  async findMany(
    @Query('email') email?: string,
    @Query('name') name?: string,
  ): Promise<User[]> {
    return this.userService.findMany({
      email,
      name,
    })
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    const user = await this.userService.findOne({ id })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() data: Prisma.UserUpdateInput): Promise<User> {
    data.id = undefined
    const user = await this.userService.update({ id }, data)
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<User> {
    const user = await this.userService.remove({ id })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }
}