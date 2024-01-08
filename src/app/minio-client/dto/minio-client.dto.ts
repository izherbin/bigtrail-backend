import { Field, Float, ObjectType } from '@nestjs/graphql'

@ObjectType({
  description: 'Список всех бакетов'
})
export class BucketItemFromList {
  @Field(() => String, {
    description: 'Имя бакета'
  })
  name: string

  @Field(() => Date, {
    description: 'Дата создания бакета'
  })
  creationDate: Date
}

@ObjectType({
  description: 'Список всех объектов в бакете'
})
export class BucketItem {
  @Field(() => String, {
    description: 'Имя объекта'
  })
  name: string

  @Field(() => Float, {
    description: 'Размер объекта'
  })
  size: number

  @Field(() => String, {
    description: 'Контрольная сумма MD5 объекта'
  })
  etag: string

  @Field(() => String, {
    nullable: true,
    description: 'Префикс объекта'
  })
  prefix?: never

  @Field(() => Date, {
    description: 'Дата последней модификации объекта'
  })
  lastModified: Date
}
