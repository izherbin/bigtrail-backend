import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtFreeGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    // console.log(
    //   'ctx.getContext().req:',
    //   JSON.stringify(ctx.getContext().req, null, '  ')
    // )
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
        phone: 'N/A'
      }
    }

    return user
  }
}
