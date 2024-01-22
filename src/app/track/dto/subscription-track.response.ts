import { Field, ObjectType } from '@nestjs/graphql'
import { Track } from '../entities/track.entity'
import { Schema as MongooSchema } from 'mongoose'

export enum SubscriptionTrackMethod {
  Add,
  Delete,
  Update
}
@ObjectType()
export class SubscriptionTrackResponse {
  @Field(() => String, {
    description: 'Метод изменения трека'
  })
  function: SubscriptionTrackMethod

  @Field(() => String, {
    description: 'Идентификатор трека'
  })
  id: MongooSchema.Types.ObjectId

  @Field(() => Track, {
    description: 'Данные изменения трека',
    nullable: true
  })
  data: Track

  userId: MongooSchema.Types.ObjectId
}
