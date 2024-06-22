import { Field, InputType, OmitType } from '@nestjs/graphql'
import { EditRouteInput } from 'src/app/route/dto/edit-route.input'

@InputType({ description: 'Информация для верификации маршрута' })
export class SetVerifiedRouteInput extends OmitType(
  EditRouteInput,
  ['id', 'points'],
  InputType
) {
  @Field(() => String, { description: 'Идентификатор в MongoDB' })
  id: string
}
