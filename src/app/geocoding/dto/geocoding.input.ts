import { Field, InputType } from '@nestjs/graphql'

@InputType({
  description: 'Данные для geocoding-поиска'
})
export class GeocodingInput {
  @Field(() => String, {
    description: 'Строка поиска'
  })
  query: string
}
