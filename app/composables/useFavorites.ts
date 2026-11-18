import type { Place } from '~/types/light'

export type FavoritePlace = Place & { id: number }

const STORAGE_KEY = 'golden-hour:favorites'
const MAX_FAVORITES = 12

function isFavoritePlace(value: unknown): value is FavoritePlace {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.id === 'number' && typeof v.name === 'string' && typeof v.subtitle === 'string'
    && typeof v.latitude === 'number' && typeof v.longitude === 'number'
}

export function readStoredFavorites(): FavoritePlace[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter(isFavoritePlace).slice(0, MAX_FAVORITES) : []
  } catch {
    return []
  }
}

function writeStoredFavorites(list: FavoritePlace[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    return
  }
}

export function useFavorites() {
  const favorites = useState<FavoritePlace[]>('favorites', () => [])
  const ready = useState<boolean>('favorites-ready', () => false)

  const isFavorite = (id: number | null): boolean => id !== null && favorites.value.some((f) => f.id === id)

  function save(list: FavoritePlace[]): void {
    favorites.value = list
    writeStoredFavorites(list)
  }

  function add(place: Place): void {
    if (place.id === null || isFavorite(place.id)) return
    save([{ ...place, id: place.id }, ...favorites.value].slice(0, MAX_FAVORITES))
  }

  function remove(id: number): void {
    save(favorites.value.filter((f) => f.id !== id))
  }

  function toggle(place: Place): void {
    if (place.id === null) return
    if (isFavorite(place.id)) remove(place.id)
    else add(place)
  }

  return { favorites, ready, isFavorite, add, remove, toggle }
}
