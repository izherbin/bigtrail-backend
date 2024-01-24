import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UploadPhoto {
  @Field(() => String, { description: 'Ссылка на загрузку в Minio' })
  url: string

  @Field(() => String, { description: 'Совпадает с TrackPhoto.id' })
  id: string
}
