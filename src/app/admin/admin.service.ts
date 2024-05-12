import { Injectable } from '@nestjs/common'
import { PlaceService } from '../place/place.service'
import { RouteService } from '../route/route.service'
import { TrackService } from '../track/track.service'
import { UserService } from '../user/user.service'
import { StatisticsResponse } from './dto/statistics.response'
import { ClientErrors, ClientException } from '../client.exception'
import { DeleteContentInput } from './dto/delete-content.input'

@Injectable()
export class AdminService {
  constructor(
    private readonly userService: UserService,
    private readonly trackService: TrackService,
    private readonly routeService: RouteService,
    private readonly placeService: PlaceService
  ) {}

  async getStatistics(): Promise<StatisticsResponse> {
    const statistics = {
      users: await this.userService.getAdminStatistics(),
      routes: await this.routeService.getAdminStatistics(),
      tracks: await this.trackService.getAdminStatistics(),
      places: await this.placeService.getAdminStatistics()
    }
    return statistics as StatisticsResponse
  }

  async deleteContent(deleteContentInput: DeleteContentInput): Promise<string> {
    const { type } = deleteContentInput

    switch (type) {
      case 'place':
        return await this.placeService.wipeout(deleteContentInput)
      case 'route':
        return await this.routeService.wipeout(deleteContentInput)
      default:
        throw new ClientException(ClientErrors['Illegal content type'])
    }
  }
}
