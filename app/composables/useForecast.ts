import type { ForecastResponse } from '~/types/open-meteo'
import type { LocationForecast } from '~/types/light'

const memory = new Map<string, LocationForecast>()
const MAX_ENTRIES = 200

function remember(key: string, value: LocationForecast): void {
  memory.delete(key)
  memory.set(key, value)
  if (memory.size > MAX_ENTRIES) {
    const oldest = memory.keys().next().value
    if (oldest !== undefined) memory.delete(oldest)
  }
}

const isFresh = (value: LocationForecast | undefined): value is LocationForecast => !!value && Date.now() - value.fetchedAt < CACHE_TTL

export function forecastKey(latitude: number, longitude: number): string {
  return `forecast:${roundCoord(latitude)},${roundCoord(longitude)}`
}

export async function fetchForecast(latitude: number, longitude: number): Promise<LocationForecast> {
  const key = forecastKey(latitude, longitude)
  const cached = memory.get(key)
  if (isFresh(cached)) return cached
  const res = await $fetch<ForecastResponse>(apiUrls().forecast, {
    query: {
      latitude: roundCoord(latitude),
      longitude: roundCoord(longitude),
      hourly: HOURLY_VARIABLES,
      daily: 'sunrise,sunset',
      timezone: 'auto',
      timeformat: 'unixtime',
      forecast_days: FORECAST_DAYS
    },
    retry: 1,
    timeout: 10_000
  })
  const forecast = buildForecast(res, latitude, longitude, Date.now())
  remember(key, forecast)
  return forecast
}

export function useForecast(coords: MaybeRefOrGetter<{ latitude: number, longitude: number } | null>, options: { server?: boolean, lazy?: boolean } = {}) {
  const key = computed(() => {
    const c = toValue(coords)
    return c ? forecastKey(c.latitude, c.longitude) : 'forecast:none'
  })

  return useAsyncData<LocationForecast | null>(
    key,
    () => {
      const c = toValue(coords)
      return c ? fetchForecast(c.latitude, c.longitude) : Promise.resolve(null)
    },
    {
      server: options.server ?? true,
      lazy: options.lazy ?? false,
      getCachedData(k, nuxtApp, ctx) {
        if (ctx.cause === 'refresh:manual') return undefined
        const fromPayload = (nuxtApp.isHydrating ? nuxtApp.payload.data[k] : undefined) as LocationForecast | undefined
        if (fromPayload) {
          remember(k, fromPayload)
          return fromPayload
        }
        const cached = memory.get(k)
        return isFresh(cached) ? cached : undefined
      }
    }
  )
}
