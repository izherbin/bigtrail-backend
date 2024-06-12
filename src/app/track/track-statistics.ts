import { TrackPoint, TrackStatistics } from './entities/track.entity'
import { GraphPoint } from './dto/graph-point'
export async function trackStatistics(
  points: TrackPoint[]
): Promise<TrackStatistics> {
  const olSphere = await import('ol/sphere.js')

  let distance = 0
  let duration = 0
  let totalSpeed = 0
  let maxSpeed = 0
  let minSpeed = 0
  let maxAltitude = 0
  let minAltitude = points?.length > 0 && points[0].alt ? points[0].alt : 0
  let movingTime = 0
  let verticalDistance = 0

  let prevPointInMotion = points[0]

  for (let idx = 0; idx < points.length - 1; idx++) {
    const point = points[idx]
    const prevPoint = idx > 0 ? points[idx - 1] : null

    distance += prevPoint
      ? getSqDist(point, prevPoint, olSphere.getDistance)
      : 0
    duration +=
      prevPoint?.timestamp && point?.timestamp
        ? point.timestamp - prevPoint.timestamp
        : 0

    totalSpeed += point.speed || 0
    maxSpeed = Math.max(maxSpeed, point.speed || 0)
    minSpeed = Math.min(minSpeed, point.speed || 0)
    maxAltitude = Math.max(maxAltitude, point.alt || 0)
    minAltitude = Math.min(minAltitude, point.alt || 0)
    verticalDistance += Math.abs(
      (point.alt ? point.alt : 0) - (prevPoint ? prevPoint.alt : 0)
    )

    if (point?.timestamp && idx > 0 && point.speed) {
      movingTime += prevPointInMotion?.timestamp
        ? point.timestamp - prevPointInMotion.timestamp
        : 0
      prevPointInMotion = point
    }
  }

  const statistics: TrackStatistics = {
    distance,
    duration: Math.round(duration / 1000),
    averageSpeed: totalSpeed / points.length,
    maxSpeed,
    minSpeed,
    maxAltitude,
    minAltitude,
    movingTime: Math.round(movingTime / 1000),
    altitudesDifference: maxAltitude - minAltitude,
    verticalDistance
  }

  return statistics
}

export async function distance2AltitudeGraph(
  points: TrackPoint[]
): Promise<GraphPoint[]> {
  const olSphere = await import('ol/sphere.js')

  const data: GraphPoint[] = []

  let isEmpty = true
  for (let idx = 0; idx < points.length; idx++) {
    let distance = 0
    if (idx !== 0) {
      distance =
        Math.abs(
          getSqDist(points[idx], points[idx - 1], olSphere.getDistance)
        ) + (data.at(-1)?.x ?? 0)
      if (distance !== 0) isEmpty = false
    }

    data.push({
      y: points[idx].alt!,
      x: Math.round(distance * 10000) / 10000
    })
  }

  if (isEmpty) return []
  else return data
}

export function time2SpeedGraph(points: TrackPoint[]): GraphPoint[] {
  const data: GraphPoint[] = []

  let isEmpty = true
  for (let idx = 0; idx < points.length; idx++) {
    data.push({
      y: points[idx].speed!,
      x: Math.abs(points[0].timestamp! - points[idx].timestamp!)
    })
    if (points[idx].speed !== 0) isEmpty = false
  }

  if (isEmpty) return []
  else return data
}

export async function time2DistanceGraph(
  points: TrackPoint[]
): Promise<GraphPoint[]> {
  const olSphere = await import('ol/sphere.js')

  const data: GraphPoint[] = []

  let isEmpty = true
  for (let idx = 0; idx < points.length; idx++) {
    let distance = 0
    if (idx !== 0) {
      distance =
        Math.abs(
          getSqDist(points[idx], points[idx - 1], olSphere.getDistance)
        ) + (data.at(-1)?.y ?? 0)
    }

    data.push({
      y: Math.round(distance * 10000) / 10000,
      x: Math.abs(points[0].timestamp! - points[idx].timestamp!)
    })
    if (distance !== 0) isEmpty = false
  }

  if (isEmpty) return []
  else return data
}

export function getSqDist(
  p1: TrackPoint,
  p2: TrackPoint,
  getDistance: (point1: any, point2: any) => number
): number {
  const distance = getDistance([p1.lon, p1.lat], [p2.lon, p2.lat])
  return distance
}

// Example usage
// ;(async () => {
//   const olSphere = await import('ol/sphere.js')

//   const moscow = { lon: 37.629072, lat: 55.747443 }
//   const tumen = { lon: 65.584994, lat: 57.134673 }

//   const dist = getSqDist(moscow, tumen, olSphere.getDistance)
//   console.log('distance = ', (dist / 1000).toFixed(0), ' km')
// })()
