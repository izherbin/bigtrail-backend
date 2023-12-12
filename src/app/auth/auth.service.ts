import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from './user.service'
// import { User } from './entities/user.entity'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { LoginPhoneInput } from './dto/login-phone.input'
import { LoginCodeInput } from './dto/login-code.input'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  validateUser(loginUserInput: LoginCodeInput) {
    const { code } = loginUserInput

    const user = this.userService.user
    const isMatch = code === user.code
    console.log('user.code:', user.code)
    console.log('code:', code)

    if (user && isMatch) {
      return user
    }

    return null
  }

  login(loginUserInput: LoginCodeInput) {
    const user = this.validateUser(loginUserInput)

    if (!user) {
      throw new UnauthorizedException()
    }

    return {
      user,
      authToken: this.jwtService.sign(
        {
          phone: user.phone
        },
        {
          secret: this.configService.get<string>('JWT_SECRET')
        }
      )
    }
  }

  async signup(payload: LoginPhoneInput) {
    const phone = payload.phone

    return this.userService.createUser({ phone })
  }
}
