import { ObjectType, Field } from '@nestjs/graphql'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@ObjectType({ description: 'Ссылки на приложение' })
@Schema()
export class AppLinks {
  @Field(() => String, { description: 'Приложение в RuStore' })
  @Prop()
  ruStore: string

  @Field(() => String, { description: 'Приложение в AppStore' })
  @Prop()
  appStore: string

  @Field(() => String, { description: 'Приложение в GooglePlay' })
  @Prop()
  googlePlay: string

  @Field(() => String, { description: 'Ссылка на сайт' })
  @Prop()
  site: string

  @Field(() => String, { description: 'Ссылка на Telegram' })
  @Prop()
  telegram: string

  @Field(() => String, { description: 'Ссылка на сайт' })
  @Prop()
  vk: string

  @Field(() => String, { description: 'Ссылка на сайт' })
  @Prop()
  whatsapp: string

  @Field(() => String, { description: 'Ссылка на сайт' })
  @Prop()
  viber: string
}

export type AppLinksDocument = AppLinks & Document
export const AppLinksSchema = SchemaFactory.createForClass(AppLinks)
