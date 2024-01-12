import { ObjectType, Field, Int, Float } from '@nestjs/graphql'
import { Document, Schema as MongooSchema } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

type timestamp = number
type JwtToken = string

@ObjectType()
@Schema()
export class User {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Имя пользователя' })
  @Prop()
  name: string

  @Prop()
  avatar: string

  @Field(() => String, {
    description: 'Номер телефона в формате string 7ХХХХХХХХХХ'
  })
  @Prop()
  phone: string

  @Field(() => Int, {
    nullable: true,
    description: 'Код аутентификации по смс в формате number NNNNNN'
  })
  @Prop()
  code: number

  @Field(() => Float, {
    description: 'Время отправки смс пользователю в формате timestamp'
  })
  @Prop()
  tsSMSSent: timestamp

  @Prop({ default: false })
  isAdmin: boolean

  @Field(() => String, {
    nullable: true,
    description: 'JWT-токен для аутентификации запросов с фронтенда'
  })
  token: JwtToken
}

export type UserDocument = User & Document
export const UserSchema = SchemaFactory.createForClass(User)
