import { Strategy } from 'passport-local'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from './auth.service'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // usernameField: '',
      // passwordField: 'code'
    })
  }

  async validate(code: number) {
    const user = await this.authService.validateUser({
      code
    })

    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }
}
