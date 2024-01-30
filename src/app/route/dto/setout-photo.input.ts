import { Field, InputType } from '@nestjs/graphql'

@InputType({ description: 'Данные для загрузки фото витрины маршрута' })
export class SetoutPhotoInput {
  @Field(() => String, { nullable: true, description: 'Сыылка на фото' })
  uri?: string

  @Field(() => String, { description: 'Совпадает с TrackPhoto.id' })
  id: string
}
