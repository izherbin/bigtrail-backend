import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'
import { Role } from '../user/entities/user.entity'

@Injectable()
export class JwtFreeGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    return ctx.getContext().req
  }

  handleRequest(err: any, user: any) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err) {
      throw err || new UnauthorizedException()
    }
    if (!user) {
      return {
        _id: null,
        phone: 'N/A',
        login: 'N/A',
        roles: [Role.Guest]
      }
    }

    return user
  }
}
