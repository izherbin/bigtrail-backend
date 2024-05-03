import { UseGuards } from '@nestjs/common'
import { AppService } from './app.service'
import { Query, Resolver } from '@nestjs/graphql'
import { JwtAuthGuard } from './auth/jwt-auth.guards'
import { Phone } from './auth/phone.decorator'
import { Schema as MongooSchema } from 'mongoose'
import { UserId } from './auth/user-id.decorator'
import { RolesGuard } from './auth/roles.guards'
import { RequiredRoles } from './auth/required-roles.decorator'
import { Role } from './user/entities/user.entity'

@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => String, {
    description: 'Это для проверки авторизации, а заодно и автодеплоя'
  })
  @UseGuards(JwtAuthGuard)
  getHello(): string {
    return this.appService.getHello()
  }

  @Query(() => String, {
    description: 'Вывод версии программы'
  })
  @UseGuards(JwtAuthGuard)
  getCommitInfo(): string {
    return this.appService.getCommitInfo()
  }

  @Query(() => String, { description: 'Определение телефона пользователя' })
  @UseGuards(JwtAuthGuard)
  whoAmI(@Phone() phone: string): string {
    return this.appService.whoAmI(phone)
  }

  @Query(() => String, { description: 'Определение id пользователя' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Superuser, Role.Admin, Role.Moderator, Role.Verifier)
  myId(@UserId() _id: MongooSchema.Types.ObjectId): string {
    return this.appService.myId(_id)
  }
}
