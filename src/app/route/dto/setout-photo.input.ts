import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class SetoutPhotoInput {
  @Field(() => String, { nullable: true, description: 'Данные какие-то' })
  data?: string

  @Field(() => String, { description: 'Совпадает с TrackPhoto.id' })
  id: string
}
