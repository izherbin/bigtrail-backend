import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({
  description: 'Объект ответа после запроса профайла'
})
export class GetUserResponce {
  @Field(() => String, {
    nullable: true,
    description: 'Номер телефона в формате string 7ХХХХХХХХХХ'
  })
  phone: string

  @Field(() => String, {
    nullable: true,
    description: 'Имя пользователя'
  })
  name: string

  @Field(() => String, {
    nullable: true,
    description: 'Аватар пользователя (название объекта в бакете avatars)'
  })
  avatar: string
}
