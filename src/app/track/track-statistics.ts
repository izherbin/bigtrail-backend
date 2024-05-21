import { TrackPoint, TrackStatistics } from './entities/track.entity'
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
  let minAltitude = 0
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
