import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description: 'Объект запроса имени пользователя'
})
export class SetNameInput {
  @Field(() => String, {
    description: 'Имя пользователя'
  })
  name: string
}
