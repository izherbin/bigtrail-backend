/*
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

import { TrackPoint } from '../track/entities/track.entity'

// to suit your point format, run search/replace for '.x' and '.y';
// for 3D version, see 3d branch (configurability would draw significant performance overhead)

// square distance between 2 points
function getSqDist(p1: TrackPoint, p2: TrackPoint) {
  const dx = p1.lon - p2.lon,
    dy = p1.lat - p2.lat

  return dx * dx + dy * dy
}

// square distance from a point to a segment
function getSqSegDist(p: TrackPoint, p1: TrackPoint, p2: TrackPoint) {
  let x = p1.lon,
    y = p1.lat,
    dx = p2.lon - x,
    dy = p2.lat - y

  if (dx !== 0 || dy !== 0) {
    const t = ((p.lon - x) * dx + (p.lat - y) * dy) / (dx * dx + dy * dy)

    if (t > 1) {
      x = p2.lon
      y = p2.lat
    } else if (t > 0) {
      x += dx * t
      y += dy * t
    }
  }

  dx = p.lon - x
  dy = p.lat - y

  return dx * dx + dy * dy
}
// rest of the code doesn't care about point format

// basic distance-based simplification
function simplifyRadialDist(points: TrackPoint[], sqTolerance: number) {
  let prevPoint = points[0],
    point: TrackPoint
  const newPoints = [prevPoint]

  for (let i = 1, len = points.length; i < len; i++) {
    point = points[i]

    if (getSqDist(point, prevPoint) > sqTolerance) {
      newPoints.push(point)
      prevPoint = point
    }
  }

  if (prevPoint !== point) newPoints.push(point)

  return newPoints
}

function simplifyDPStep(
  points: TrackPoint[],
  first: number,
  last: number,
  sqTolerance: number,
  simplified: TrackPoint[]
) {
  let maxSqDist = sqTolerance,
    index: number

  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last])

    if (sqDist > maxSqDist) {
      index = i
      maxSqDist = sqDist
    }
  }

  if (maxSqDist > sqTolerance) {
    if (index - first > 1)
      simplifyDPStep(points, first, index, sqTolerance, simplified)
    simplified.push(points[index])
    if (last - index > 1)
      simplifyDPStep(points, index, last, sqTolerance, simplified)
  }
}

// simplification using Ramer-Douglas-Peucker algorithm
function simplifyDouglasPeucker(points: TrackPoint[], sqTolerance: number) {
  const last = points.length - 1

  const simplified = [points[0]]
  simplifyDPStep(points, 0, last, sqTolerance, simplified)
  simplified.push(points[last])

  return simplified
}

// both algorithms combined for awesome performance
export function simplifyPoints(
  points: TrackPoint[],
  tolerance: number,
  highestQuality: boolean
) {
  if (points.length <= 2) return points

  const sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1

  points = highestQuality ? points : simplifyRadialDist(points, sqTolerance)
  points = simplifyDouglasPeucker(points, sqTolerance)

  return points
}
