import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CreateTrackInput } from './dto/create-track.input'
import { UpdateTrackInput } from './dto/update-track.input'
import { InjectModel } from '@nestjs/mongoose'
import { Track, TrackDocument } from './entities/track.entity'
import { Model, Schema as MongooSchema } from 'mongoose'
import { DeleteTrackInput } from './dto/delete-track.input'

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

  async remove(deleteTrackInput: DeleteTrackInput) {
    const { id } = deleteTrackInput
    const track = await this.trackModel.findById(id)
    if (!track) {
      throw new HttpException('No such user', HttpStatus.NOT_FOUND)
    }

    await this.trackModel.findByIdAndDelete(id)

    return `Успешно удален трек № ${id} `
  }
}
