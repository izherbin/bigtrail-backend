import { Field, Float, InputType } from '@nestjs/graphql'

@InputType({
  description: 'Данные для обратного Geocoding'
})
export class ReverseGeocodingInput {
  @Field(() => Float, {
    description: 'Широта'
  })
  lat: number

  @Field(() => Float, {
    description: 'Долгота'
  })
  lon: number
}
