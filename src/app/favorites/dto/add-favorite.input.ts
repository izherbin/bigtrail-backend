import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description: 'Информация для включения контента в список избранного'
})
export class AddFavoriteInput {
  @Field(() => String, { description: 'Идентификатор избранного контента' })
  id: string
}
