import { InputType, Field } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({
  description: 'Информация для включения контента в список избранного'
})
export class AddFavoriteInput {
  @Field(() => String, { description: 'Идентификатор избранного контента' })
  id: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Тип контента' })
  type: 'route' | 'place'
}
