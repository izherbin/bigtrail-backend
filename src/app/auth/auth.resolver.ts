import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { LoginUserResponce } from './dto/login-user.response'
import { UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { GqlAuthGuard } from './gql-auth.guards'
import { LoginPhoneInput } from './dto/login-phone.input'
import { LoginCodeInput } from './dto/login-code.input'
import { LoginCodeResponce } from './dto/login-code.response'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginUserResponce, {
    //? name: 'verifyCode',
    description: 'Отправить код аутентификации, полученный по смс'
  })
  @UseGuards(GqlAuthGuard)
  login(
    @Args('loginUserInput') loginUserInput: LoginCodeInput,
    @Context() context: any
  ) {
    return this.authService.login(context.user)
  }

  @Mutation(() => LoginCodeResponce, {
    //? name: 'sendCode',
    description: 'Отправить номер телефона для аутентификации'
  })
  signup(@Args('signupInput') signupInput: LoginPhoneInput) {
    return this.authService.signup(signupInput)
  }

  @Mutation(() => String, {
    //? name: 'cancelAuth',
    description: 'Прекратить процесс аутентификации'
  })
  kill() {
    return this.authService.kill()
  }
}
