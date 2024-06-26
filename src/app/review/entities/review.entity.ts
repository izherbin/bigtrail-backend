import { ObjectType, Field, Int, Float } from '@nestjs/graphql'
import { Prop, Schema } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { SetoutPhoto } from 'src/app/route/entities/route.entity'

@ObjectType({ description: 'Ревью' })
@Schema()
export class Review {
  @Field(() => String, { description: 'Идентификатор автора ревью в MongoDB' })
  @Prop()
  userId: Types.ObjectId

  @Field(() => String, { description: 'Тип контента' })
  type: 'route' | 'place'

  @Field(() => Float, { description: 'Время создания ревью' })
  @Prop()
  tsCreated: number

  @Field(() => Int, {
    nullable: true,
    description: 'Рейтинг ревью - целое число от 0 до 5'
  })
  @Prop()
  rating?: 0 | 1 | 2 | 3 | 4 | 5

  @Field(() => String, { nullable: true, description: 'Комментарий ревью' })
  @Prop()
  comment?: string

  @Field(() => [SetoutPhoto], {
    nullable: true,
    description: 'Фотографии ревью'
  })
  @Prop()
  photos?: SetoutPhoto[]
}
