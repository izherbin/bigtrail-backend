import { ExecutionContext, Injectable } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class GqlAuthAdminGuard extends AuthGuard('password') {
  constructor() {
    super()
  }

  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context)
    const req = ctx.getContext()
    // req.body = ctx.getArgs().loginUserInput
    req.body = ctx.getArgs().loginPasswordInput
    return req
  }
}
