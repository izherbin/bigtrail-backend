import { Module } from '@nestjs/common'
import { GeocodingResolver } from './geocoding.resolver'
import { GeocodingService } from './geocoding.service'
import { HttpModule } from '@nestjs/axios'
import { ConfigModule } from '@nestjs/config'

@Module({
  providers: [GeocodingResolver, GeocodingService],
  imports: [HttpModule, ConfigModule]
})
export class GeocodingModule {}
