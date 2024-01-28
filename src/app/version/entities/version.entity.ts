import { ObjectType, Field } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@ObjectType()
@Schema()
export class Version {
  @Field(() => String, { nullable: true, description: 'Версия IOS' })
  @Prop()
  ios?: string

  @Field(() => String, { nullable: true, description: 'Версия Android' })
  @Prop()
  android?: string

  @Field(() => String, { nullable: true, description: 'Версия Web' })
  @Prop()
  web?: string

  @Field(() => String, { nullable: true, description: 'Версия Backend' })
  backend: string
}

export type VersionDocument = Version & Document
export const VersionSchema = SchemaFactory.createForClass(Version)
