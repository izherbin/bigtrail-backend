import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description: 'Информация для удаления контента из списка избранного'
})
export class DeleteFavoriteInput {
  @Field(() => String, { description: 'Идентификатор избранного контента' })
  id: string
}
