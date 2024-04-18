import { CreateRouteInput } from './create-route.input'
import { InputType, Field, PartialType } from '@nestjs/graphql'

@InputType({ description: 'Информация для редактирования маршрута' })
export class EditRouteInput extends PartialType(CreateRouteInput) {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: string
}
