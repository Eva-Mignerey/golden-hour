export interface OpenMeteoError {
  error: true
  reason: string
}

export interface GeocodingPlace {
  id: number
  name: string
  latitude: number
  longitude: number
  elevation?: number
  feature_code?: string
  country_code?: string
  country?: string
  admin1?: string
  admin2?: string
  timezone: string
  population?: number
}

export interface GeocodingSearchResponse {
  results?: GeocodingPlace[]
  generationtime_ms: number
}

export interface ForecastResponse {
  latitude: number
  longitude: number
  timezone: string
  utc_offset_seconds: number
  hourly: {
    time: number[]
    cloud_cover: Array<number | null>
    cloud_cover_low: Array<number | null>
    cloud_cover_mid: Array<number | null>
    cloud_cover_high: Array<number | null>
    visibility: Array<number | null>
    precipitation: Array<number | null>
    precipitation_probability: Array<number | null>
  }
  daily: {
    time: number[]
    sunrise: number[]
    sunset: number[]
  }
}
