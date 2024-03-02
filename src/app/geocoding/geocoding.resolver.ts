import { Args, Query, Resolver } from '@nestjs/graphql'
import { GeocodingInput } from './dto/geocoding.input'
import { GeocodingService } from './geocoding.service'
import { ReverseGeocodingInput } from './dto/reverse-geocoding.input'
import { Geocode } from './entity/geocode.entity'

@Resolver()
export class GeocodingResolver {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Query(() => [Geocode], { description: 'Геокодинг по поисковой строке' })
  geocoding(@Args('geocodingInput') geocodingInput: GeocodingInput) {
    return this.geocodingService.search(geocodingInput)
  }

  @Query(() => [Geocode], { description: 'Обратный геокодинг по координатам' })
  reverseGeocoding(
    @Args('reverseGeocodingInput') reverseGeocodingInput: ReverseGeocodingInput
  ) {
    return this.geocodingService.reverse(reverseGeocodingInput)
  }
}
