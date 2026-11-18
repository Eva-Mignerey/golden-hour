export const apiUrls = (): { geocoding: string, forecast: string } => {
  const { geocodingUrl, forecastUrl } = useRuntimeConfig().public
  return { geocoding: geocodingUrl, forecast: forecastUrl }
}
export const FORECAST_DAYS = 7
export const CACHE_TTL = 15 * 60 * 1000

export const HOURLY_VARIABLES = [
  'cloud_cover',
  'cloud_cover_low',
  'cloud_cover_mid',
  'cloud_cover_high',
  'visibility',
  'precipitation',
  'precipitation_probability'
].join(',')

export type ApiErrorKind = 'not-found' | 'network' | 'server'

export function errorKind(error: unknown): ApiErrorKind {
  const status = (error as { statusCode?: number, status?: number } | null)?.statusCode ?? (error as { status?: number } | null)?.status
  if (status === 404 || status === 400) return 'not-found'
  if (!status) return 'network'
  return 'server'
}

export const roundCoord = (value: number): number => Math.round(value * 1000) / 1000
