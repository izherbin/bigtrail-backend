
@ObjectType()
@Schema({ _id: false })
export class TrackPoint {
  @Field(() => Float, { description: 'Широта' })
  @Prop()
  lat: number

  @Field(() => Float, { description: 'Долгота' })
  @Prop()
  lon: number

  @Field(() => Float, { nullable: true, description: 'Высота' })
  @Prop()
  alt?: number

  @Field(() => Float, { nullable: true, description: 'Временная метка' })
  @Prop()
  timestamp?: number

  @Field(() => Float, { nullable: true, description: 'Скорость' })
  @Prop()
  speed?: number

  @Field(() => Float, { nullable: true, description: 'Ускорение' })
  @Prop()
  boost?: number

  @Field(() => Float, { nullable: true, description: 'Вертикальная скорость' })
  @Prop()
  altSpeed?: number
}

@ObjectType()
@Schema({ _id: false })
export class TrackPhoto {
  @Field(() => String, { nullable: true, description: 'Сыылка на фото' })
  @Prop()
  uri?: string

  @Field(() => String, { nullable: true, description: 'Данные какие-то' })
  @Prop()
  data?: string

  @Field(() => String, { nullable: true, description: 'Описание' })
  @Prop()
  description?: string

  @Field(() => String, {
    nullable: true,
    description: 'id локальный для фронта'
  })
  @Prop()
  id?: string // Тут id можно не валидировать тк он локальный для фронта
}

@ObjectType()
@Schema({ _id: false })
export class TrackNote {
  @Field(() => TrackPoint, { description: 'Точка трека' })
  @Prop()
  point: TrackPoint

  @Field(() => String, { description: 'id локальный для фронта' })
  @Prop()
  id: string // Тут id можно не валидировать тк он локальный для фронта

  @Field(() => String, { description: 'Описание' })
  @Prop()
  description?: string

  @Field(() => [TrackPhoto], {
    nullable: true,
    description: 'Набор фотографий'
  })
  @Prop()
  photos?: TrackPhoto[]

  @Field(() => Boolean, { description: 'Нерабочее?' })
  @Prop()
  disabled?: boolean
}

@ObjectType()
@Schema()
export class Track {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  _id: MongooSchema.Types.ObjectId

  @Prop({ default: 'track' })
  type: string

  @Field(() => String, { description: 'id создателя' })
  @Prop()
  userId: MongooSchema.Types.ObjectId

  @Field(() => String, { description: 'Имя трека' })
  @Prop()
  name: string

  @Field(() => Float, { description: 'Временная метка' })
  @Prop()
  timestamp: number

  @Field(() => [TrackPoint], { description: 'Массив точек трека' })
  @Prop()
  points: TrackPoint[]

  @Field(() => Float, { nullable: true, description: 'Длительность' })
  @Prop()
  duration?: number

  @Field(() => Float, { nullable: true, description: 'Расстояние' })
  @Prop()
  distance?: number

  @Field(() => [TrackNote], {
    nullable: true,
    description: 'Заметки о точках трека'
  })
  @Prop()
  notes?: TrackNote[]

  @Field(() => Boolean, { nullable: true, description: 'Загружено?' })
  @Prop()
  uploaded?: boolean

  @Field(() => String, { nullable: true, description: 'Адрес' })
  @Prop()
  address?: string

  @Field(() => Boolean, { nullable: true, description: 'Нерабочее?' })
  @Prop()
  disabled?: boolean
}

export type TrackDocument = Track & Document
export const TrackSchema = SchemaFactory.createForClass(Track)

@InputType()
export class TrackPointInput {
  @Field(() => Float, { description: 'Широта' })
  lat: number

  @Field(() => Float, { description: 'Долгота' })
  lon: number

  @Field(() => Float, { nullable: true, description: 'Высота' })
  alt?: number

  @Field(() => Float, { nullable: true, description: 'Временная метка' })
  timestamp?: number

  @Field(() => Float, { nullable: true, description: 'Скорость' })
  speed?: number

  @Field(() => Float, { nullable: true, description: 'Ускорение' })
  boost?: number

  @Field(() => Float, { nullable: true, description: 'Вертикальная скорость' })
  altSpeed?: number
}

@InputType()
export class TrackPhotoInput {
  @Field(() => String, { nullable: true, description: 'Сыылка на фото' })
  uri?: string

  @Field(() => String, { nullable: true, description: 'Данные какие-то' })
  data?: string

  @Field(() => String, { nullable: true, description: 'Описание' })
  description?: string

  @Field(() => String, {
    nullable: true,
    description: 'id локальный для фронта'
  })
  id?: string // Тут id можно не валидировать тк он локальный для фронта
}

@InputType()
export class TrackNoteInput {
  @Field(() => TrackPointInput, { description: 'Точка трека' })
  point: TrackPointInput

  @Field(() => String, { description: 'id локальный для фронта' })
  id: string // Тут id можно не валидировать тк он локальный для фронта

  @Field(() => String, { nullable: true, description: 'Описание' })
  description?: string

  @Field(() => [TrackPhotoInput], {
    nullable: true,
    description: 'Набор фотографий'
  })
  photos?: TrackPhotoInput[]

  @Field(() => Boolean, { nullable: true, description: 'Нерабочее?' })
  disabled?: boolean
}

@InputType()
export class CreateTrackInput {
  @Field(() => String, { description: 'Имя трека' })
  name: string

  @Field(() => Float, { description: 'Временная метка' })
  timestamp: number

  @Field(() => [TrackPointInput], { description: 'Массив точек трека' })
  points: TrackPointInput[]

  @Field(() => Float, { nullable: true, description: 'Длительность' })
  duration?: number

  @Field(() => Float, { nullable: true, description: 'Расстояние' })
  distance?: number

  @Field(() => [TrackNoteInput], {
    nullable: true,
    description: 'Заметки о точках трека'
  })
  notes?: TrackNoteInput[]

  @Field(() => Boolean, { nullable: true, description: 'Загружено?' })
  uploaded?: boolean

  @Field(() => String, { nullable: true, description: 'Адрес' })
  address?: string

  @Field(() => Boolean, { nullable: true, description: 'Нерабочее?' })
  disabled?: boolean
}

@InputType()
export class DeleteTrackInput {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: MongooSchema.Types.ObjectId
}

@InputType()
export class UpdateTrackInput extends PartialType(CreateTrackInput) {
  @Field(() => String, { description: 'Идентифкатор в MongoDB' })
  id: MongooSchema.Types.ObjectId
}

@ObjectType({
  description: 'Объект ответа после запроса профайла'
})
export class GetUserResponce {
  @Field(() => String, {
    nullable: true,
    description: 'Номер телефона в формате string 7ХХХХХХХХХХ'
  })
  phone: string

  @Field(() => String, {
    nullable: true,
    description: 'Имя пользователя'
  })
  name: string

  @Field(() => String, {
    nullable: true,
    description: 'Аватар пользователя (временная download-ссылка на аватар )'
  })
  avatar: string
}

@InputType({
  description: 'Объект запроса имени пользователя'
})
export class SetNameInput {
  @Field(() => String, {
    description: 'Имя пользователя'
  })
  name: string
}

@ObjectType({
  description: 'Объект ответа после запроса профайла'
})
export class GetUserResponce {
  @Field(() => String, {
    nullable: true,
    description: 'Номер телефона в формате string 7ХХХХХХХХХХ'
  })
  phone: string

  @Field(() => String, {
    nullable: true,
    description: 'Имя пользователя'
  })
  name: string

  @Field(() => String, {
    nullable: true,
    description: 'Аватар пользователя (временная download-ссылка на аватар )'
  })
  avatar: string
}

@InputType({
  description: 'Объект запроса имени пользователя'
})
export class SetNameInput {
  @Field(() => String, {
    description: 'Имя пользователя'
  })
  name: string
}
