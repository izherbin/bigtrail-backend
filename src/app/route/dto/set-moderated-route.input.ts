import { Field, InputType, OmitType } from '@nestjs/graphql'
import { EditRouteInput } from 'src/app/route/dto/edit-route.input'

@InputType({ description: 'Информация для модерации маршрута' })
export class SetModeratedRouteInput extends OmitType(
  EditRouteInput,
  ['id', 'points'],
  InputType
) {
  @Field(() => String, { description: 'Идентификатор в MongoDB' })
  id: string
}
