import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({
  description: 'Объект ответа после запроса профайла'
})
export class GetUserResponce {
  @Field(() => String, {
    description: 'Номер телефона в формате string 7ХХХХХХХХХХ'
  })
  phone: string

  @Field(() => String, {
    description: 'Имя пользователя'
  })
  name: string
}
