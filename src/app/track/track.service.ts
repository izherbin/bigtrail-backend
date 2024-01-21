import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateTrackInput } from './dto/create-track.input'
import { UpdateTrackInput } from './dto/update-track.input'
import { InjectModel } from '@nestjs/mongoose'
import { Track, TrackDocument } from './entities/track.entity'
import { Model, Schema as MongooSchema } from 'mongoose'
import { DeleteTrackInput } from './dto/delete-track.input'
import { PubSub } from 'graphql-subscriptions'

const pubSub = new PubSub()

@Injectable()
export class TrackService {
  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>
  ) {}

  async create(
    userId: MongooSchema.Types.ObjectId,
    createTrackInput: CreateTrackInput
  ) {
    const createTrack = new this.trackModel(createTrackInput)
    createTrack.userId = userId

    const track = await createTrack.save()

    const tracks = await this.trackModel.find({ userId })
    pubSub.publish('trackChanged', { getAllTracks: tracks })

    return track
  }

  async findAll() {
    const tracks = await this.trackModel.find()
    return tracks
  }

  async findByUserId(userId: MongooSchema.Types.ObjectId) {
    const tracks = await this.trackModel.find({ userId })
    return tracks
  }

  getAllTracks() {
    const res = pubSub.asyncIterator('trackChanged')
    return res
  }

  findOne(id: number) {
    return `This action returns a #${id} track`
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(id: number, _updateTrackInput: UpdateTrackInput) {
    return `This action updates a #${id} track`
  }

  async remove(
    userId: MongooSchema.Types.ObjectId,
    deleteTrackInput: DeleteTrackInput
  ) {
    const { id } = deleteTrackInput
    const track = await this.trackModel.findById(id)
    if (!track) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    await this.trackModel.findByIdAndDelete(id)

    const tracks = await this.trackModel.find({ userId })
    pubSub.publish('trackChanged', { getAllTracks: tracks })

    return `Успешно удален трек № ${id} `
  }
}
