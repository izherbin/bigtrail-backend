import { CreatePlaceInput } from './create-place.input'
import { InputType, Field, PartialType } from '@nestjs/graphql'

@InputType({ description: 'Объект ввода при редактировании интересного места' })
export class EditPlaceInput extends PartialType(CreatePlaceInput) {
  @Field(() => String, {
    description: 'Идентифкатор интересного места для редактирования'
  })
  id: string
}
