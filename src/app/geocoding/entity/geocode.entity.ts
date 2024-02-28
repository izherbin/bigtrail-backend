import { Field, Float, ObjectType } from '@nestjs/graphql'
import { Feature } from 'graphql-geojson-scalar-types'

@ObjectType()
export class GeocodeAddress {
  @Field(() => String, { nullable: true, description: 'Город' })
  city?: string

  @Field(() => String, { nullable: true, description: 'Государственный округ' })
  state_district?: string

  @Field(() => String, { nullable: true, description: 'Регион' })
  state?: string

  @Field(() => String, { nullable: true, description: 'Почтовый индекс' })
  postcode?: string

  @Field(() => String, { nullable: true, description: 'Страна' })
  country?: string

  @Field(() => String, { nullable: true, description: 'Код страны' })
  country_code?: string

  @Field(() => String, { nullable: true, description: 'Округ' })
  county?: string
}

@ObjectType()
export class GeocodeExtratags {
  @Field(() => String, { nullable: true, description: 'столица' })
  capital?: string

  @Field(() => String, { nullable: true, description: 'Веб-сайт' })
  website?: string

  @Field(() => String, { nullable: true, description: 'Викидата' })
  wikidata?: string

  @Field(() => String, { nullable: true, description: 'Википедия' })
  wikipedia?: string

  @Field(() => String, { nullable: true, description: 'Население' })
  population?: string
}

@ObjectType()
export class Geocode {
  @Field(() => String, { nullable: true, description: 'Идентификатор места' })
  place_id?: string

  @Field(() => String, { nullable: true, description: 'Лицензия' })
  licence?: string

  @Field(() => String, { description: 'Тип OSM' })
  osm_type: string

  @Field(() => String, { description: 'Идентификатор OSM' })
  osm_id: string

  @Field(() => Feature, { description: 'GeoJSON' })
  geojson: object

  @Field(() => [Float], {
    nullable: true,
    description: 'Ограничительная рамка'
  })
  boundingbox?: number[]

  @Field(() => Float, { nullable: true, description: 'Широта' })
  lat: number

  @Field(() => Float, { nullable: true, description: 'Долгота' })
  lon: number

  @Field(() => String, { nullable: true, description: 'Отображаемое имя' })
  display_name: string

  @Field(() => String, { nullable: true, description: 'Класс' })
  class?: string

  @Field(() => String, { nullable: true, description: 'Тип' })
  type: string

  @Field(() => String, { nullable: true, description: 'Значение' })
  importance?: number

  @Field(() => String, { nullable: true, description: 'Значок' })
  icon?: string

  @Field(() => GeocodeAddress, { nullable: true, description: 'Адрес' })
  address?: GeocodeAddress

  @Field(() => GeocodeExtratags, {
    nullable: true,
    description: 'Внешние теги'
  })
  extratags?: GeocodeExtratags
}
