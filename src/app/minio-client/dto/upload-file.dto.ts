import { Field, InputType, ObjectType } from '@nestjs/graphql'

@InputType({
  description: 'Входные данные для загрузки файла'
})
export class UploadFileInput {
  @Field(() => String, { description: 'Имя бакета' })
  bucketName: string

  @Field(() => String, { description: 'Имя объекта' })
  objectName: string
}

@ObjectType({
  description: 'Информация о загруженном объекте'
})
export class UploadedObjectInfo {
  @Field(() => String, {
    description: 'Контрольная сумма MD5 объекта'
  })
  etag: string

  @Field(() => String, {
    nullable: true,
    description: 'Версия объекта'
  })
  versionId: string | null
}
