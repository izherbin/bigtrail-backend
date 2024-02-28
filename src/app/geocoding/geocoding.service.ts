import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { GeocodingInput } from './dto/geocoding.input'
import { ReverseGeocodingInput } from './dto/reverse-geocoding.input'
import { ConfigService } from '@nestjs/config'
import { catchError, lastValueFrom, map } from 'rxjs'
import { ClientException } from '../client.exception'

@Injectable()
export class GeocodingService {
  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService
  ) {}

  async search(geocodingInput: GeocodingInput) {
    const { query } = geocodingInput
    const url =
      this.configService.get('GEOCODING_HOST') +
      ':' +
      this.configService.get('GEOCODING_PORT')

    const request = this.http
      .get(url + '/api', {
        params: {
          q: query
        }
      })
      .pipe(map((res) => res.data.features))
      .pipe(
        catchError((err) => {
          console.log('err:', err)
          throw new ClientException(50301)
        })
      )
    const features = await lastValueFrom(request)
    console.log('data:', features)

    return features
  }

  async reverse(reverseGeocodingInput: ReverseGeocodingInput) {
    const { lat, lon } = reverseGeocodingInput
    return `This is the result of Reverse geocoding: lat: ${lat}, Lon: ${lon}`
  }
}
