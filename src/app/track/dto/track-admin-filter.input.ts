import { Field, InputType } from '@nestjs/graphql'
import { TrackFilterInput } from './track-filter.input'

@InputType({ description: 'Набор фильтров треков' })
export class TrackAdminFilterInput extends TrackFilterInput {
  @Field(() => String, {
    nullable: true,
    description: 'Фильтр по id создателя трека'
  })
  userId?: string
}
