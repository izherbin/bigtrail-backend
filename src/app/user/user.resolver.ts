import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { SetNameInput } from './dto/set-name.input'
import { UserService } from './user.service'
import { Phone } from '../auth/phone.decorator'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'
import { GetUserResponce } from './dto/get-user.response'

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => GetUserResponce, {
    description: 'Получить профайл пользователя'
  })
  @UseGuards(JwtAuthGuard)
  getProfile(@Phone() phone: string) {
    return this.userService.getProfile(phone)
  }

  @Mutation(() => String, {
    description: 'Установить имя пользователя'
  })
  @UseGuards(JwtAuthGuard)
  setName(
    @Phone() phone: string,
    @Args('setnameInput') setNameInput: SetNameInput
  ) {
    return this.userService.setName(phone, setNameInput)
  }

  @Mutation(() => String, {
    description: 'Удалить профайл пользователя'
  })
  @UseGuards(JwtAuthGuard)
  deleteProfile(@Phone() phone: string) {
    return this.userService.deleteUser(phone)
  }
}
