import { Field, InputType, OmitType } from '@nestjs/graphql'
import { EditPlaceInput } from './edit-place.input'

@InputType({ description: 'Информация для модерации интересного места' })
export class SetModeratedPlaceInput extends OmitType(
  EditPlaceInput,
  ['id', 'photos'],
  InputType
) {
  @Field(() => String, { description: 'Идентификатор в MongoDB' })
  id: string
}
