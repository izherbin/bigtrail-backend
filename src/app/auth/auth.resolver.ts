import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { LoginUserResponce } from './dto/login-user.response'
import { UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service'
import { GqlAuthGuard } from './gql-auth.guards'
import { LoginPhoneInput } from './dto/login-phone.input'
import { LoginCodeInput } from './dto/login-code.input'
import { LoginCodeResponce } from './dto/login-code.response'
import { LoginPasswordInput } from './dto/login-password.input'
import { GqlAuthAdminGuard } from './gql-auth-admin.guards'
import { Login } from './login.decorator'
import { JwtAuthGuard } from './jwt-auth.guards'
import { RolesGuard } from './roles.guards'
import { Role } from '../user/entities/user.entity'
import { RequiredRoles } from './required-roles.decorator'

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginUserResponce, {
    name: 'verifyCode',
    description: 'Отправить код аутентификации, полученный по смс'
  })
  @UseGuards(GqlAuthGuard)
  login(
    @Args('loginUserInput') loginUserInput: LoginCodeInput,
    @Context() context: any
  ) {
    return this.authService.loginUser(context.user)
  }

  @Mutation(() => LoginUserResponce, {
    name: 'adminLogin',
    description: 'Вход администратора'
  })
  @UseGuards(GqlAuthAdminGuard)
  loginAdmin(
    @Args('loginPasswordInput') loginPasswordInput: LoginPasswordInput,
    @Context() context: any
  ) {
    return this.authService.loginAdmin(context.user)
  }

  @Mutation(() => LoginCodeResponce, {
    name: 'sendCode',
    description: 'Отправить номер телефона для аутентификации'
  })
  signup(
    @Context() context: any,
    @Args('signupInput') signupInput: LoginPhoneInput
  ) {
    const ip = context.req.headers['x-forwarded-for'] || ''
    console.log('X-Forwarded-For:', ip)
    return this.authService.signupUser(signupInput, ip)
  }

  @Mutation(() => String, {
    name: 'addAdmin',
    description: 'Отправить данные для регистрации администратора'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Superuser)
  signupAdmin(@Args('signupInput') signupInput: LoginPasswordInput) {
    return this.authService.signupAdmin(signupInput)
  }

  @Mutation(() => String, {
    description: 'Установить пароль администратора'
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequiredRoles(Role.Admin)
  setAdminPassword(@Login() login: string, @Args('password') password: string) {
    return this.authService.setAdminPassword(login, password)
  }

  @Mutation(() => String, {
    name: 'cancelAuth',
    description: 'Прекратить процесс аутентификации'
  })
  kill(@Args('signupInput') phoneInput: LoginPhoneInput) {
    return this.authService.kill(phoneInput)
  }
}
