import { Field, InputType, OmitType } from '@nestjs/graphql'
import { Place } from '../entities/place.entity'
import { Prop } from '@nestjs/mongoose'
import { TrackPhotoInput } from 'src/app/track/dto/create-track.input'

@InputType({ description: 'Объект ввода при создании интересного места' })
export class CreatePlaceInput extends OmitType(
  Place,
  ['_id', 'type', 'timestamp', 'userId', 'photos'],
  InputType
) {
  @Field(() => [TrackPhotoInput], { description: 'Фото интересного места' })
  @Prop()
  photos?: TrackPhotoInput[]
}
