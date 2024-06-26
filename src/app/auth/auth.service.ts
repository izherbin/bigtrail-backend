import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { LoginPhoneInput } from './dto/login-phone.input'
import { LoginCodeInput } from './dto/login-code.input'
import { catchError, lastValueFrom, map } from 'rxjs'
import { HttpService } from '@nestjs/axios'
import { UserService } from '../user/user.service'
import { ClientErrors, ClientException } from '../client.exception'
import { LoginPasswordInput } from './dto/login-password.input'
import { Role } from '../user/entities/user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private http: HttpService
  ) {}

  async validateUser(phone: string, code: number) {
    const user = await this.userService.getUserByPhone(phone)
    if (!user) {
      return null
    }

    if (!code || !user.code) {
      return null
    }

    const isMatch = code === user.code

    const tsCheck = Date.now()
    const isValid =
      user.roles.includes(Role.Admin) ||
      user.roles.includes(Role.Superuser) ||
      user.roles.includes(Role.Supervisor) ||
      tsCheck - user.tsSMSSent <
        Number(this.configService.get<string>('CODE_EXPIRES_IN'))

    if (isValid && isMatch) {
      return user
    }

    return null
  }

  async validateAdmin(login: string, password: string) {
    const admin = await this.userService.getUserByLogin(login)
    if (!admin) {
      return null
    }

    if (!password || !admin.password) {
      return null
    }

    const isMatch = await bcrypt.compare(password, admin.password)

    if (isMatch) {
      return admin
    }

    return null
  }

  async loginUser(loginUserInput: LoginCodeInput) {
    const { phone } = loginUserInput
    const user = await this.userService.getUserByPhone(phone)
    if (!user) {
      throw new ClientException(ClientErrors['No such phone'])
    }

    const _id = user._id
    if (
      !user.roles.includes(Role.Admin) &&
      !user.roles.includes(Role.Supervisor)
    ) {
      user.code = null
      user.save()
    }

    return {
      user,
      authToken: this.jwtService.sign(
        {
          phone,
          _id,
          login: 'N/A',
          roles: user.roles ? user.roles : [Role.User]
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN')
        }
      )
    }
  }

  async loginAdmin(loginPasswordInput: LoginPasswordInput) {
    const { login } = loginPasswordInput
    const admin = await this.userService.getUserByLogin(login)
    if (!admin) {
      throw new ClientException(ClientErrors['No such admin'])
    }

    const _id = admin._id
    const user = {
      login,
      _id,
      phone: 'N/A',
      roles: admin.roles
    }
    return {
      user,
      authToken: this.jwtService.sign(user, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN')
      })
    }
  }

  async signupUser(payload: LoginPhoneInput, ip: string) {
    const { phone } = payload
    let user = await this.userService.getUserByPhone(phone)

    if (!user) {
      user = await this.userService.createUser(phone, ip)
    }

    if (
      user.roles.includes(Role.Admin) ||
      user.roles.includes(Role.Supervisor)
    ) {
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
      throw new ClientException(ClientErrors['SMS too early'])
    }

    if (!this.validatePhone(payload.phone)) {
      throw new ClientException(ClientErrors['Incorrect phone number'])
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
          throw new ClientException(ClientErrors['SMS API not available'])
        })
      )
    const msg = await lastValueFrom(request)

    console.log('msg.err_code:', msg.err_code)
    if (msg.err_code !== '0') {
      throw new ClientException(ClientErrors['SMS service error'], msg.text)
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

  async signupAdmin(payload: LoginPasswordInput): Promise<string> {
    const { login, password } = payload

    if (!this.userService.validateLogin(login)) {
      throw new ClientException(
        ClientErrors['Login does not meet requirements']
      )
    }

    if (!this.userService.validatePassword(password)) {
      throw new ClientException(
        ClientErrors['Password does not meet requirements']
      )
    }

    return await this.userService.createAdmin(login, password)
  }

  async signupModerator(payload: LoginPasswordInput): Promise<string> {
    const { login, password } = payload

    if (!this.userService.validateLogin(login)) {
      throw new ClientException(
        ClientErrors['Login does not meet requirements']
      )
    }

    if (!this.userService.validatePassword(password)) {
      throw new ClientException(
        ClientErrors['Password does not meet requirements']
      )
    }

    return await this.userService.createModerator(login, password)
  }

  async signupVerifier(payload: LoginPasswordInput): Promise<string> {
    const { login, password } = payload

    if (!this.userService.validateLogin(login)) {
      throw new ClientException(
        ClientErrors['Login does not meet requirements']
      )
    }

    if (!this.userService.validatePassword(password)) {
      throw new ClientException(
        ClientErrors['Password does not meet requirements']
      )
    }

    return await this.userService.createVerifier(login, password)
  }

  async setAdminPassword(login: string, password: string): Promise<string> {
    if (!this.userService.validatePassword(password)) {
      throw new ClientException(ClientErrors['Incorrect profile name'])
    }

    const hash = await bcrypt.hash(
      password,
      Number(this.configService.get<string>('SALT_ROUNDS'))
    )

    return await this.userService.setAdminPassword(login, hash)
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
    const user = await this.userService.getUserByPhone(phone)
    if (!user) {
      return 'Authentication process stoped'
    }

    if (user.roles.includes(Role.Admin)) {
      return 'Can not stop authentication process'
    }

    user.code = null
    user.tsSMSSent = null
    user.token = null
    await this.userService.updateUser(user)
    return 'Authentication process stoped'
  }
}
