import { InputType, Field, Float } from '@nestjs/graphql'

@InputType({
  description: 'Координаты для определения высоты'
})
export class GetElevationInput {
  @Field(() => Float, { description: 'Широта' })
  lat: number

  @Field(() => Float, { description: 'Долгота' })
  lon: number
}
