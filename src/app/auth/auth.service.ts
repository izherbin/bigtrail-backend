import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { LoginPhoneInput } from './dto/login-phone.input'
import { LoginCodeInput } from './dto/login-code.input'
import { User } from './entities/user.entity'
import { catchError, lastValueFrom, map } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { UserService } from '../user/user.service'

@Injectable()
export class AuthService {
  constructor(
    private user: User,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private http: HttpService
  ) {}

  validateUser(loginUserInput: LoginCodeInput) {
    const { code } = loginUserInput

    const user = this.user
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
    const tsCheck = Date.now()

    if (
      this.user.tsSMSSent &&
      tsCheck - this.user.tsSMSSent <
        Number(this.configService.get<string>('NEW_SMS_TIMEOUT'))
    ) {
      throw new HttpException('SMS too early', HttpStatus.CONFLICT)
    }

    if (!this.validatePhone(payload.phone)) {
      throw new HttpException('Incorrect phone number', HttpStatus.BAD_REQUEST)
    }
    this.user.phone = payload.phone

    this.user.code = Math.round(Math.random() * 899999 + 100000)
    console.log('code:', this.user.code)

    // const request = this.http
    //   .post(
    //     'http://api.sms-prosto.ru/',
    //     {},
    //     {
    //       params: {
    //         method: 'push_msg',
    //         format: 'json',
    //         key: this.configService.get<string>('SMS_API_KEY'),
    //         text: this.user.code,
    //         phone: Number(this.user.phone),
    //         sender_name: this.configService.get<string>('SMS_SENDER_NAME'),
    //         priority: 1
    //       }
    //     }
    //   )
    //   .pipe(map((res) => res.data.response.msg))
    //   .pipe(
    //     catchError(() => {
    //       throw new HttpException(
    //         'API not available',
    //         HttpStatus.SERVICE_UNAVAILABLE
    //       )
    //     })
    //   )
    // const msg = await lastValueFrom(request)

    // console.log('msg.err_code:', msg.err_code)
    // if (msg.err_code !== '0') {
    //   throw new HttpException(msg.text, HttpStatus.BAD_REQUEST)
    // }

    this.user.tsSMSSent = Date.now()
    this.userService.createUser(this.user)

    return {
      phone: this.user.phone,
      sent: String(this.user.tsSMSSent),
      canSendAgain: String(
        this.user.tsSMSSent +
          Number(this.configService.get<string>('NEW_SMS_TIMEOUT'))
      )
    }
  }

  validatePhone(phone: string): boolean {
    return /^7\d{10}/.test(phone)
  }

  kill() {
    this.user = {
      ...this.user,
      phone: null,
      code: null,
      tsSMSSent: null,
      token: null
    }

    return 'Authentication process stoped'
  }
}
