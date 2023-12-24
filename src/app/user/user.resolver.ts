import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { SetNameInput } from './dto/set-name.input'
import { UserService } from './user.service'
import { Phone } from '../auth/phone.decorator'
import { UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/jwt-auth.guards'

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => String, {
    //? name: 'sendCode',
    description: 'Установить имя пользователя'
  })
  @UseGuards(JwtAuthGuard)
  setName(
    @Phone() phone: string,
    @Args('setnameInput') setNameInput: SetNameInput
  ) {
    return this.userService.setName(phone, setNameInput)
  }
}
