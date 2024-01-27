import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class SetoutPhotoInput {
  @Field(() => String, { nullable: true, description: 'Сыылка на фото' })
  uri?: string

  @Field(() => String, { description: 'Совпадает с TrackPhoto.id' })
  id: string
}
