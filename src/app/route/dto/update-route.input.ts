import { CreateRouteInput } from './create-route.input'
import { InputType, Field, PartialType } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Информация для редактирования маршрута' })
export class UpdateRouteInput extends PartialType(CreateRouteInput) {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  _id: MongooSchema.Types.ObjectId
}
