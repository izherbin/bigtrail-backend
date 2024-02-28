import { Args, Query, Resolver } from '@nestjs/graphql'
import { GeocodingInput } from './dto/geocoding.input'
import { GeocodingService } from './geocoding.service'
import { ReverseGeocodingInput } from './dto/reverse-geocoding.input'
import { Feature } from 'graphql-geojson-scalar-types'

@Resolver()
export class GeocodingResolver {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Query(() => [Feature])
  geocoding(@Args('geocodingInput') geocodingInput: GeocodingInput) {
    return this.geocodingService.search(geocodingInput)
  }

  @Query(() => String)
  reverseGeocoding(
    @Args('reverseGeocodingInput') reverseGeocodingInput: ReverseGeocodingInput
  ) {
    return this.geocodingService.reverse(reverseGeocodingInput)
  }
}
