import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { LoginPhoneInput } from './dto/login-phone.input'
import { User } from './entities/user.entity'
import { ConfigService } from '@nestjs/config'
import { HttpService } from '@nestjs/axios'
import { catchError, lastValueFrom, map } from 'rxjs'

@Injectable()
export class UserService {
  constructor(
    public user: User,
    private readonly configService: ConfigService,
    private http: HttpService
  ) {}

  async createUser(loginPhoneInput: LoginPhoneInput) {
    const tsCheck = Date.now()

    if (
      this.user.tsSMSSent &&
      tsCheck - this.user.tsSMSSent <
        Number(this.configService.get<string>('NEW_SMS_TIMEOUT'))
    ) {
      throw new HttpException('SMS too early', HttpStatus.CONFLICT)
    }

    if (!this.validatePhone(loginPhoneInput.phone)) {
      throw new HttpException('Incorrect phone number', HttpStatus.BAD_REQUEST)
    }
    this.user.phone = loginPhoneInput.phone

    this.user.code = Math.round(Math.random() * 899999 + 100000)

    const request = this.http
      .post(
        'http://api.sms-prosto.ru/',
        {},
        {
          params: {
            method: 'push_msg',
            format: 'json',
            key: this.configService.get<string>('SMS_API_KEY'),
            text: this.user.code,
            phone: Number(this.user.phone),
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

    this.user.tsSMSSent = Date.now()

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

  removeUser() {
    this.user.phone = null
    this.user.tsSMSSent = null
    this.user.code = null

    return true
  }
}
