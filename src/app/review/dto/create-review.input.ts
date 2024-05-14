import { InputType, Field, OmitType } from '@nestjs/graphql'
import { Review } from '../entities/review.entity'
import { SetoutPhotoInput } from 'src/app/route/dto/setout-photo.input'
import { Schema as MongooSchema } from 'mongoose'

@InputType({ description: 'Данные для создания ревью' })
export class CreateReviewInput extends OmitType(
  Review,
  ['userId', 'tsCreated', 'photos'],
  InputType
) {
  @Field(() => String, {
    description: 'Идентификатор контента'
  })
  contentId: MongooSchema.Types.ObjectId

  @Field(() => [SetoutPhotoInput], {
    nullable: true,
    description: 'Фотографии ревью'
  })
  photos?: SetoutPhotoInput[]
}
