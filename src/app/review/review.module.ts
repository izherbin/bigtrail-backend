import { Module } from '@nestjs/common'
import { ReviewService } from './review.service'
import { ReviewResolver } from './review.resolver'
import { RouteModule } from '../route/route.module'
import { PlaceModule } from '../place/place.module'
import { UserModule } from '../user/user.module'

@Module({
  providers: [ReviewResolver, ReviewService],
  imports: [RouteModule, PlaceModule, UserModule]
})
export class ReviewModule {}
