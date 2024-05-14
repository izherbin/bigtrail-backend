import { Field, InputType } from '@nestjs/graphql'
import { Schema as MongooSchema } from 'mongoose'

@InputType({
  description: 'Информация для отметки уведомления как прочитанного'
})
export class SetNotificationViewedInput {
  @Field(() => String, { description: 'Id уведомления' })
  id: MongooSchema.Types.ObjectId
}
