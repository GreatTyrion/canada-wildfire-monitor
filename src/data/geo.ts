// Small geographic utilities — enough that we don't need turf.

const R = 6371 // km

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

export function compassDirection(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const dLon = toRad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon)
  const bearing = (toDeg(Math.atan2(y, x)) + 360) % 360
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(bearing / 45) % 8]
}

type Ring = number[][]

/** Ray-casting test; supports GeoJSON Polygon and MultiPolygon with holes. */
export function pointInGeometry(
  lon: number,
  lat: number,
  geometry: { type: string; coordinates: unknown },
): boolean {
  if (geometry.type === 'Polygon') {
    return pointInPolygon(lon, lat, geometry.coordinates as Ring[])
  }
  if (geometry.type === 'MultiPolygon') {
    return (geometry.coordinates as Ring[][]).some((poly) => pointInPolygon(lon, lat, poly))
  }
  return false
}

function pointInPolygon(lon: number, lat: number, rings: Ring[]): boolean {
  if (rings.length === 0) return false
  if (!pointInRing(lon, lat, rings[0])) return false
  // Inside the outer ring — make sure the point is not inside a hole.
  return !rings.slice(1).some((hole) => pointInRing(lon, lat, hole))
}

function pointInRing(lon: number, lat: number, ring: Ring): boolean {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

function toRad(d: number) {
  return (d * Math.PI) / 180
}

function toDeg(r: number) {
  return (r * 180) / Math.PI
}
