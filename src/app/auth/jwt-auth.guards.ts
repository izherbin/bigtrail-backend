import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    console.log(
      'ctx.getContext().req:',
      JSON.stringify(ctx.getContext().req, null, '  ')
    )
    const res = ctx.getContext().req.extra
      ? ctx.getContext().req.extra.request
      : ctx.getContext().req
    return res
  }
}
