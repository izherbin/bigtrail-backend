import { ObjectType, Field, Int, Float } from '@nestjs/graphql'
import { Document, Schema as MongooSchema } from 'mongoose'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

type timestamp = number
type JwtToken = string

@ObjectType({
  description: 'Статистика пользователя'
})
@Schema({ _id: false })
export class UserStatistics {
  @Field(() => Int, {
    nullable: true,
    description: 'Количество подписчиков у данного пользователя'
  })
  @Prop()
  subscribers?: number

  @Field(() => Int, {
    nullable: true,
    description: 'Количество подписок у данного пользователя'
  })
  @Prop()
  subscriptions?: number

  @Field(() => Int, {
    nullable: true,
    description: 'Количество интересных мест у данного пользователя'
  })
  @Prop()
  places?: number

  @Field(() => Int, {
    nullable: true,
    description: 'Количество маршрутов у данного пользователя'
  })
  @Prop()
  routes?: number

  @Field(() => Int, {
    nullable: true,
    description: 'Количество треков у данного пользователя'
  })
  @Prop()
  tracks?: number

  @Field(() => Float, {
    nullable: true,
    description: 'Сумма duration tracks у данного пользователя'
  })
  @Prop()
  duration?: number

  @Field(() => Float, {
    nullable: true,
    description: 'Сумма distance tracks у данного пользователя'
  })
  @Prop()
  distance?: number

  @Field(() => Int, {
    nullable: true,
    description: 'Количество очков пользователя'
  })
  @Prop()
  points?: number
}

@ObjectType({ description: 'Профайл пользователя' })
@Schema()
export class User {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  _id: MongooSchema.Types.ObjectId

  @Field(() => String, { nullable: true, description: 'Имя пользователя' })
  @Prop()
  name?: string

  @Prop()
  avatar: string

  @Prop()
  avatarFile: string

  @Field(() => String, {
    description: 'Номер телефона в формате string 7ХХХХХХХХХХ'
  })
  @Prop()
  phone: string

  @Field(() => String, { nullable: true, description: 'Статус пользователя' })
  @Prop()
  status?: string

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

  @Field(() => UserStatistics, {
    nullable: true,
    description: 'Статистика пользователя'
  })
  @Prop()
  statistics?: UserStatistics
}

export type UserDocument = User & Document
export const UserSchema = SchemaFactory.createForClass(User)
