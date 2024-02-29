import { HttpService } from '@nestjs/axios'
import { Injectable } from '@nestjs/common'
import { GeocodingInput } from './dto/geocoding.input'
import { ReverseGeocodingInput } from './dto/reverse-geocoding.input'
import { ConfigService } from '@nestjs/config'
import { catchError, lastValueFrom, map } from 'rxjs'
import { ClientException } from '../client.exception'
import { Geocode } from './entity/geocode.entity'

interface Feature {
  geometry: { coordinates: number[] }
  properties: {
    osm_type: string
    osm_id: string
    name: string
    type: string
    extent: number[]
    city: string
    state: string
    county: string
    country: string
    countrycode: string
    postcode: string
  }
}

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
          throw new ClientException(50302)
        })
      )
    const features: Feature[] = await lastValueFrom(request)

    return features.map((feature) => this.feature2Geocode(feature))
  }

  async reverse(reverseGeocodingInput: ReverseGeocodingInput) {
    const { lat, lon } = reverseGeocodingInput
    const url =
      this.configService.get('GEOCODING_HOST') +
      ':' +
      this.configService.get('GEOCODING_PORT')

    const request = this.http
      .get(url + '/reverse', {
        params: {
          lat,
          lon
        }
      })
      .pipe(map((res) => res.data.features))
      .pipe(
        catchError((err) => {
          console.log('err:', err)
          throw new ClientException(50302)
        })
      )
    const features: Feature[] = await lastValueFrom(request)

    return features.map((feature) => this.feature2Geocode(feature))
  }

  feature2Geocode(feature: Feature): Geocode {
    const geocode = {
      osm_type: feature.properties.osm_type,
      osm_id: feature.properties.osm_id,
      geojson: feature,
      lat: feature.geometry.coordinates[0],
      lon: feature.geometry.coordinates[1],
      display_name: feature.properties.name,
      type: feature.properties.type,
      boundingbox: feature.properties.extent
        ? [
            Math.min(
              feature.properties.extent[0],
              feature.properties.extent[2]
            ),
            Math.min(
              feature.properties.extent[1],
              feature.properties.extent[3]
            ),
            Math.max(
              feature.properties.extent[0],
              feature.properties.extent[2]
            ),
            Math.max(feature.properties.extent[1], feature.properties.extent[3])
          ]
        : null,
      address: {
        city: feature.properties.city || null,
        state: feature.properties.state || null,
        county: feature.properties.county || null,
        country: feature.properties.country,
        country_code: feature.properties.countrycode,
        postcode: feature.properties.postcode || null
      }
    }

    return geocode
  }
}
