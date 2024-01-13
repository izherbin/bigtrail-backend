import { Injectable } from '@nestjs/common'
import { CreateTrackInput } from './dto/create-track.input'
import { UpdateTrackInput } from './dto/update-track.input'
import { InjectModel } from '@nestjs/mongoose'
import { Track, TrackDocument } from './entities/track.entity'
import { Model, Schema as MongooSchema } from 'mongoose'

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>
  ) {}

  async create(
    UserId: MongooSchema.Types.ObjectId,
    createTrackInput: CreateTrackInput
  ) {
    const createTrack = new this.trackModel(createTrackInput)
    createTrack.userId = UserId
    return await createTrack.save()
  }

  async findAll() {
    const tracks = await this.trackModel.find()
    return tracks
  }

  async findByUserId(userId: MongooSchema.Types.ObjectId) {
    const tracks = await this.trackModel.find({ userId: userId })
    return tracks
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
