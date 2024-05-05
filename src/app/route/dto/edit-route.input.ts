import { CreateRouteInput } from './create-route.input'
import { InputType, Field, OmitType, PartialType } from '@nestjs/graphql'

@InputType({ description: 'Информация для редактирования маршрута' })
export class EditRouteInput extends PartialType(
  OmitType(CreateRouteInput, ['timestamp', 'id', 'type'], InputType)
) {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: string
}
