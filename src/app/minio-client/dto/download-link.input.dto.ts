import { Field, InputType, Int } from '@nestjs/graphql'

@InputType({
  description:
    'Входные данные для получения временной ссылки на скачивания файла'
})
export class DownloadLinkInput {
  @Field(() => String, { description: 'Имя бакета' })
  bucketName: string

  @Field(() => String, { description: 'Имя объекта' })
  objectName: string

  @Field(() => Int, {
    nullable: true,
    description: 'Время истечения ссылки в секундах'
  })
  expiry?: number

  // @Field(() => String, {
  //   nullable: true,
  //   description: 'Заголовки ответов для переопределения'
  // })
  // respHeaders?: string

  // @Field(() => Date, {
  //   nullable: true,
  //   description: 'Имя бакета'
  // })
  // requestDate?: Date
}
