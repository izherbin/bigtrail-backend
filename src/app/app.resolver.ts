import { UseGuards } from '@nestjs/common'
import { AppService } from './app.service'
import { Query, Resolver } from '@nestjs/graphql'
import { JwtAuthGuard } from './auth/jwt-auth.guards'
import { Phone } from './auth/phone.decorator'

@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => String, {
    description: 'Это для проверки авторизации'
  })
  @UseGuards(JwtAuthGuard)
  getHello(): string {
    return this.appService.getHello()
  }

  @Query(() => String, { description: 'Определение телефона пользователя' })
  @UseGuards(JwtAuthGuard)
  whoAmI(@Phone() phone: string): string {
    return this.appService.whoAmI(phone)
  }
}
