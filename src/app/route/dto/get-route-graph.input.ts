import { Field, InputType } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({
  description: 'Входящая информация для построения графика маршрута'
})
export class GetRouteGraphInput {
  @Field(() => String, { description: 'Идентифкатор трека в MongoDB' })
  id: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Тип графика' })
  type: 'TIME2DISTANCE' | 'TIME2SPEED' | 'DISTANCE2ALTITUDE'
}
