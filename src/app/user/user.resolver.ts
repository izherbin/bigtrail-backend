import { Args, Mutation, Resolver } from '@nestjs/graphql'
import { SetNameInput } from './dto/set-name.input'
import { UserService } from './user.service'

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => String, {
    //? name: 'sendCode',
    description: 'Установить имя пользователя'
  })
  setName(@Args('setnameInput') setNameInput: SetNameInput) {
    return this.userService.setName(setNameInput)
  }
}
