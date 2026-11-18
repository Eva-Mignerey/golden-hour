import type { GeocodingPlace } from '~/types/open-meteo'
import type { Place } from '~/types/light'

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'lieu'
}

export function placeSlug(place: Pick<Place, 'name' | 'id'>): string {
  return `${slugify(place.name)}-${place.id}`
}

export function parsePlaceId(slug: string): number | null {
  const match = /-(\d{1,12})$/.exec(slug) ?? /^(\d{1,12})$/.exec(slug)
  return match ? Number(match[1]) : null
}

export function toPlace(g: GeocodingPlace): Place {
  const region = g.admin2 && g.admin2 !== g.name ? g.admin2 : g.admin1
  return {
    id: g.id,
    name: g.name,
    subtitle: [region, g.country].filter(Boolean).join(', '),
    latitude: g.latitude,
    longitude: g.longitude
  }
}
