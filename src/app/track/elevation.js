import fs from 'fs'
// import { fromArrayBuffer } from 'geotiff'

const TILES = [
  {
    region: 'W',
    maxLon: -44.9916667,
    maxLat: 60.0104165,
    minLon: -180.0104165,
    minLat: -60.0104167,
    width: 7201 * 0.00208333333,
    height: 5761 * 0.00208333333
  },
  {
    region: 'NE',
    maxLon: 180.0104162,
    maxLat: 60.0104165,
    minLon: -30.0104168,
    minLat: -0.0104168,
    width: 10081 * 0.00208333333,
    height: 2881 * 0.00208333333
  },
  {
    region: 'SE',
    maxLon: 180.0104162,
    maxLat: 0.0104166,
    minLon: -30.0104168,
    minLat: -60.0104167,
    width: 10081 * 0.00208333333,
    height: 2881 * 0.00208333333
  }
]

function chooseTile(lat, lon) {
  let regionIndex = -1
  for (let i = 0; i < 3; i++) {
    if (
      lon < TILES[i].maxLon &&
      lon > TILES[i].minLon &&
      lat < TILES[i].maxLat &&
      lat > TILES[i].minLat
    ) {
      regionIndex = i
      break
    }
  }
  if (regionIndex < 0) return null

  const column = Math.floor(
    (lon - TILES[regionIndex].minLon) / TILES[regionIndex].width
  )
  const row =
    9 -
    Math.floor((lat - TILES[regionIndex].minLat) / TILES[regionIndex].height)
  if (column > 9 || row < 0) return null

  return `SRTM_${TILES[regionIndex].region}_250m_${column}_${row}.tif`
}

// const lerp = (a, b, t) => (1 - t) * a + t * b

function transform(a, b, M, roundToInt = false) {
  const round = (v) => (roundToInt ? v | 0 : v)
  return [round(M[0] + M[1] * a + M[2] * b), round(M[3] + M[4] * a + M[5] * b)]
}

export async function elevation(lat, lon) {
  const geotiff = await import('geotiff')
  const fromArrayBuffer = geotiff.fromArrayBuffer

  const tile = chooseTile(lat, lon)
  if (!tile) {
    return null
  }

  const file = fs.readFileSync('/geodata/srtm-250m/' + tile).buffer
  const tiff = await fromArrayBuffer(file)
  const image = await tiff.getImage()

  // Construct the WGS-84 forward and inverse affine matrices:
  const { ModelPixelScale: s, ModelTiepoint: t } = image.fileDirectory
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [sx, _sy, sz] = s
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [px, py, k, gx, gy, gz] = t
  const sy = -_sy // WGS-84 tiles have a "flipped" y component

  const pixelToGPS = [gx, sx, 0, gy, 0, sy]
  // console.log(`pixel to GPS transform matrix:`, pixelToGPS)

  const gpsToPixel = [-gx / sx, 1 / sx, 0, -gy / sy, 0, 1 / sy]
  // console.log(`GPS to pixel transform matrix:`, gpsToPixel)

  // Convert a GPS coordinate to a pixel coordinate in our tile:
  // const [gx1, gy1, gx2, gy2] = image.getBoundingBox()
  // const lat = lerp(gy1, gy2, Math.random())
  // const long = lerp(gx1, gx2, Math.random())
  // console.log(`Looking up GPS coordinate (${lat.toFixed(6)},${lon.toFixed(6)})`)

  const [x, y] = transform(lon, lat, gpsToPixel, true)
  // console.log(`Corresponding tile pixel coordinate: [${x}][${y}]`)

  // And as each pixel in the tile covers a geographic area, not a single
  // GPS coordinate, get the area that this pixel covers:
  const gpsBBox = [
    transform(x, y, pixelToGPS),
    transform(x + 1, y + 1, pixelToGPS)
  ]
  console.log(`Pixel covers the following GPS area:`, gpsBBox)

  // Finally, retrieve the elevation associated with this pixel's geographic area:
  const rasters = await image.readRasters()
  const { width, [0]: raster } = rasters
  const elev = raster[x + y * width]
  // console.log(
  //   `The elevation  at (${lat.toFixed(6)},${lon.toFixed(6)}) is ${elev}m`
  // )

  return elev
}
