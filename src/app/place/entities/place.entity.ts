import { ObjectType, Field, Float } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { TrackPhoto } from 'src/app/track/entities/track.entity'
import { Document, Schema as MongooSchema } from 'mongoose'

export type PlaceCategory =
  | 'religious'
  | 'informationCenter'
  | 'observationTower'
  | 'waterfall'
  | 'spring'

@ObjectType({ description: '' })
@Schema()
export class Place {
  @Field(() => String, { description: '' })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, { description: '' })
  @Prop({ default: 'place' })
  type: 'place'

  @Field(() => Float, { description: '' })
  @Prop()
  timestamp: number

  @Field(() => String, { description: '' })
  @Prop()
  userId: MongooSchema.Types.ObjectId

  @Field(() => String, { description: '' })
  @Prop()
  name: string

  @Field(() => String, { description: '' })
  @Prop()
  address: string

  @Field(() => Float, { description: '' })
  @Prop()
  lat: number

  @Field(() => Float, { description: '' })
  @Prop()
  lon: number

  @Field(() => String, { description: '' })
  @Prop()
  description: string

  @Field(() => String, { description: '' })
  @Prop()
  category: PlaceCategory

  @Field(() => [TrackPhoto], { nullable: true, description: '' })
  @Prop()
  photos?: TrackPhoto[]
}

export type PlaceDocument = Place & Document
export const PlaceSchema = SchemaFactory.createForClass(Place)
