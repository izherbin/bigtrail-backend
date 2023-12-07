import { Injectable } from '@nestjs/common'
import { CreateAuthorInput } from './dto/create-author.input'
import { UpdateAuthorInput } from './dto/update-author.input'
import { InjectModel } from '@nestjs/mongoose'
import { Author, AuthorDocument } from './entities/author.entity'
import { Model, Schema as MongooSchema } from 'mongoose'

@Injectable()
export class AuthorService {
  constructor(
    @InjectModel(Author.name)
    private authorModel: Model<AuthorDocument>
  ) {}

  create(createAuthorInput: CreateAuthorInput) {
    const createAuthor = new this.authorModel(createAuthorInput)
    return createAuthor.save()
  }

  async findAll(limit: number, skip: number) {
    const authorsCount = await this.authorModel.find().countDocuments()
    const authors = await this.authorModel.find().skip(skip).limit(limit)

    return {
      authors,
      authorsCount
    }
  }

  getAuthorById(id: MongooSchema.Types.ObjectId) {
    return this.authorModel.findById(id).populate('books')
  }

  updateAuthor(
    id: MongooSchema.Types.ObjectId,
    updateAuthorInput: UpdateAuthorInput
  ) {
    return this.authorModel.findByIdAndUpdate(id, updateAuthorInput, {
      new: true
    })
  }

  remove(id: MongooSchema.Types.ObjectId) {
    return this.authorModel.deleteOne({ _id: id })
  }
}
