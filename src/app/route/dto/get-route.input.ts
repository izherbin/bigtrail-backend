import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description: 'Объект запроса маршрута по идентификатору пользователя'
})
export class GetRouteInput {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: string
}
