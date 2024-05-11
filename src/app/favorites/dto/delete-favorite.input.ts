import { InputType, Field } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({
  description: 'Информация для удаления контента из списка избранного'
})
export class DeleteFavoriteInput {
  @Field(() => String, { description: 'Идентификатор избранного контента' })
  id: MongooSchema.Types.ObjectId
}
