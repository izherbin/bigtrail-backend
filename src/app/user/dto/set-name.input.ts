import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description: 'Объект запроса именем пользователя'
})
export class SetNameInput {
  @Field(() => String, {
    description: 'Имя пользователя'
  })
  name: string
}
