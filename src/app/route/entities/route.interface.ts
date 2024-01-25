/* eslint-disable @typescript-eslint/no-unused-vars */
import { Photo } from 'src/app/track/dto/photo.response'
import { RouteDifficulty } from './route.entity'
import { TrackNote, TrackPoint } from 'src/app/track/entities/track.entity'

interface Route {
  type?: 'route'
  id: string
  name: string
  transit: string
  category: string
  availability: number[]
  difficulty: RouteDifficulty
  description: string
  photos: Photo[]
  timestamp: number
  points: TrackPoint[]
  duration: number
  distance: number
  notes: TrackNote[]
  address: string
}
