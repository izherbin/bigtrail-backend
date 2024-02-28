import { Args, Query, Resolver } from '@nestjs/graphql'
import { GeocodingInput } from './dto/geocoding.input'
import { GeocodingService } from './geocoding.service'
import { ReverseGeocodingInput } from './dto/reverse-geocoding.input'
import { Geocode } from './entity/geocode.entity'

@Resolver()
export class GeocodingResolver {
  constructor(private readonly geocodingService: GeocodingService) {}

  @Query(() => [Geocode])
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
