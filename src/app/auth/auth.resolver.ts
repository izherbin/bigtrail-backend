import { Args, /*Context,*/ Mutation, Resolver } from '@nestjs/graphql'
import { LoginUserResponce } from './dto/login-user.response'
// import { UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
// import { GqlAuthGuard } from './gql-auth.guards'
import { User } from './entities/user.entity'
import { LoginPhoneInput } from './dto/login-phone.input'
import { LoginCodeInput } from './dto/login-code.input'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginUserResponce)
  // @UseGuards(GqlAuthGuard)
  login(
    @Args('loginUserInput') loginUserInput: LoginCodeInput
    // @Context() context: any
  ) {
    return this.authService.login(loginUserInput)
  }

  @Mutation(() => User)
  signup(@Args('signupInput') signupInput: LoginPhoneInput) {
    return this.authService.signup(signupInput)
  }
}
