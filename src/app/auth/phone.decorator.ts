import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { GqlExecutionContext } from '@nestjs/graphql'

export const Phone = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context)
    return (
      ctx.getContext().req.extra
        ? ctx.getContext().req.extra.request
        : ctx.getContext().req
    ).user.phone
  }
)
