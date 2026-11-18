import type { GeocodingPlace, GeocodingSearchResponse } from '~/types/open-meteo'
import type { Place } from '~/types/light'

export function usePlace(id: MaybeRefOrGetter<number | null>) {
  return useAsyncData<Place | null>(
    () => `place:${toValue(id) ?? 'none'}`,
    async () => {
      const value = toValue(id)
      if (value === null) return null
      const res = await $fetch<GeocodingPlace>(`${apiUrls().geocoding}/get`, {
        query: { id: value, language: 'fr' },
        retry: 1,
        timeout: 10_000
      })
      return toPlace(res)
    },
    {
      getCachedData(k, nuxtApp) {
        return (nuxtApp.payload.data[k] ?? nuxtApp.static.data[k]) as Place | null | undefined
      }
    }
  )
}

export function usePlaceSearch(query: MaybeRefOrGetter<string>) {
  return useAsyncData<Place[]>(
    () => `search:${toValue(query).trim().toLowerCase()}`,
    async () => {
      const [rawName = '', ...rest] = toValue(query).split(',')
      const name = rawName.trim()
      const hint = slugify(rest.join(' '))
      if (name.length < 2) return []
      const res = await $fetch<GeocodingSearchResponse>(`${apiUrls().geocoding}/search`, {
        query: { name, count: 20, language: 'fr', format: 'json' },
        retry: 1,
        timeout: 10_000
      })
      const results = res.results ?? []
      const filtered = hint && hint !== 'lieu'
        ? results.filter((g) => [g.country, g.country_code, g.admin1, g.admin2].some((v) => v && slugify(v).includes(hint)))
        : results
      return filtered.slice(0, 10).map(toPlace)
    }
  )
}
