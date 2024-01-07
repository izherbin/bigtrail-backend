import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType({
  description: 'Объект ответа после запроса профайла'
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
