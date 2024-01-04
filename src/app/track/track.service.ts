import { Injectable } from '@nestjs/common'
import { CreateTrackInput } from './dto/create-track.input'
import { UpdateTrackInput } from './dto/update-track.input'
import { InjectModel } from '@nestjs/mongoose'
import { Track, TrackDocument } from './entities/track.entity'
import { Model } from 'mongoose'

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>
  ) {}

  create(createTrackInput: CreateTrackInput) {
    const createTrack = new this.trackModel(createTrackInput)
    return createTrack.save()
  }

  findAll() {
    return `This action returns all track`
  }

  findOne(id: number) {
    return `This action returns a #${id} track`
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, _updateTrackInput: UpdateTrackInput) {
    return `This action updates a #${id} track`
  }

  remove(id: number) {
    return `This action removes a #${id} track`
  }
}
