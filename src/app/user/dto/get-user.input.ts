import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description: 'Объект запроса профайла по идентификатору пользователя'
})
export class GetUserInput {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: string
}
