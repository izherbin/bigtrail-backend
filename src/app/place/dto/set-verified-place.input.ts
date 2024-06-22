import { Field, InputType, OmitType } from '@nestjs/graphql'
import { EditPlaceInput } from './edit-place.input'

@InputType({ description: 'Информация для верификации интересного места' })
export class SetVerifiedPlaceInput extends OmitType(
  EditPlaceInput,
  ['id'],
  InputType
) {
  @Field(() => String, { description: 'Идентификатор в MongoDB' })
  id: string
}
