import { InputType, Field } from '@nestjs/graphql'

@InputType({
  description: 'Объект запроса интересного места по его идентификатору'
})
export class GetPlaceInput {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: string
}
