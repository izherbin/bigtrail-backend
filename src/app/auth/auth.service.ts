import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { LoginPhoneInput } from './dto/login-phone.input'
import { LoginCodeInput } from './dto/login-code.input'
import { catchError, lastValueFrom, map } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { UserService } from '../user/user.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private http: HttpService
  ) {}

  async validateUser(phone: string, code: number) {
    const user = await this.userService.getUser(phone)
    if (!user) {
      return null
    }
    const isMatch = code === user.code

    if (user && isMatch) {
      return user
    }

    return null
  }

  async login(loginUserInput: LoginCodeInput) {
    const { phone } = loginUserInput
    const user = await this.userService.getUser(phone)
    if (!user) {
      throw new HttpException('No such phone', HttpStatus.NOT_FOUND)
    }

    return {
      user,
      authToken: this.jwtService.sign(
        {
          phone
        },
        {
          secret: this.configService.get<string>('JWT_SECRET')
        }
      )
    }
  }

  async signup(payload: LoginPhoneInput) {
    const { phone } = payload
    let user = await this.userService.getUser(phone)

    if (!user) {
      user = await this.userService.createUser(phone)
    }

    if (user.isAdmin) {
      return {
        phone,
        sent: '1000000000000',
        canSendAgain: String(
          1000000000000 +
            Number(this.configService.get<string>('NEW_SMS_TIMEOUT'))
        )
      }
    }

    const tsCheck = Date.now()
    if (
      user.tsSMSSent &&
      tsCheck - user.tsSMSSent <
        Number(this.configService.get<string>('NEW_SMS_TIMEOUT'))
    ) {
      throw new HttpException('SMS too early', HttpStatus.CONFLICT)
    }

    if (!this.validatePhone(payload.phone)) {
      throw new HttpException('Incorrect phone number', HttpStatus.BAD_REQUEST)
    }

    user.code = this.genCode()
    console.log('code:', user.code)

    const request = this.http
      .post(
        'http://api.sms-prosto.ru/',
        {},
        {
          params: {
            method: 'push_msg',
            format: 'json',
            key: this.configService.get<string>('SMS_API_KEY'),
            text: user.code + ' - код для авторизации в BigTrail',
            phone: Number(user.phone),
            sender_name: this.configService.get<string>('SMS_SENDER_NAME'),
            priority: 1
          }
        }
      )
      .pipe(map((res) => res.data.response.msg))
      .pipe(
        catchError(() => {
          throw new HttpException(
            'API not available',
            HttpStatus.SERVICE_UNAVAILABLE
          )
        })
      )
    const msg = await lastValueFrom(request)

    console.log('msg.err_code:', msg.err_code)
    if (msg.err_code !== '0') {
      throw new HttpException(msg.text, HttpStatus.BAD_REQUEST)
    }

    user.tsSMSSent = Date.now()
    this.userService.updateUser(user)

    return {
      phone: user.phone,
      sent: String(user.tsSMSSent),
      canSendAgain: String(
        user.tsSMSSent +
          Number(this.configService.get<string>('NEW_SMS_TIMEOUT'))
      )
    }
  }

  validatePhone(phone: string): boolean {
    return /^7\d{10}/.test(phone)
  }

  genCode(): number {
    const uniqueDigits = []
    const pairedDigits = []
    let code = 0
    for (let i = 0; i < 6; i++) {
      while (true) {
        const newDigit = Math.round(Math.random() * 9)
        if (!i && !newDigit) continue
        const count = uniqueDigits.reduce((cnt, digit) => {
          if (digit === newDigit) return cnt + 1
          else return cnt
        }, 0)
        if (count >= 2) continue
        else if (count == 1) {
          const countPairs = pairedDigits.reduce((cnt, digit) => {
            if (digit === newDigit) return cnt + 1
            else return cnt
          }, 0)
          if (countPairs === 0) pairedDigits.push(newDigit)
          else continue
        } else {
          if (uniqueDigits.length < 4) uniqueDigits.push(newDigit)
          else continue
        }
        code = code * 10 + newDigit
        break
      }
    }
    return code
  }

  async kill(payload: LoginPhoneInput) {
    const { phone } = payload
    const user = await this.userService.getUser(phone)
    if (!user) {
      return 'Authentication process stoped'
    }

    if (user.isAdmin) {
      return 'Can not stop authentication process'
    }

    user.code = null
    user.tsSMSSent = null
    user.token = null
    await this.userService.updateUser(user)
    return 'Authentication process stoped'
  }
}
