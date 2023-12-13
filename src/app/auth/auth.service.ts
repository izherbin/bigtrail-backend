import { Injectable } from '@nestjs/common'
import { UserService } from './user.service'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { LoginPhoneInput } from './dto/login-phone.input'
import { LoginCodeInput } from './dto/login-code.input'
import { User } from './entities/user.entity'

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

    if (user && isMatch) {
      return user
    }

    return null
  }

  login(user: User) {
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

  kill() {
    this.userService.user = {
      phone: null,
      code: null,
      tsSMSSent: null,
      token: null
    }

    return 'Authentication process stoped'
  }
}
