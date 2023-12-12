import { UseGuards } from '@nestjs/common'
import { AppService } from './app.service'
import { Query, Resolver } from '@nestjs/graphql'
import { JwtAuthGuard } from './auth/jwt-auth.guards'

@Resolver()
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => String)
  @UseGuards(JwtAuthGuard)
  getHello(): string {
    return this.appService.getHello()
  }
}
