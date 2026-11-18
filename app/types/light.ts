export type SkyPhase = 'night' | 'blue' | 'gold' | 'day'

export interface TimeRange {
  start: number
  end: number
}

export interface SunDay {
  date: string
  sunrise: number | null
  sunset: number | null
  always: 'day' | 'night' | null
  blueMorning: TimeRange | null
  goldMorning: TimeRange | null
  goldEvening: TimeRange | null
  blueEvening: TimeRange | null
}

export interface SkySegment {
  phase: SkyPhase | 'sunset' | 'dusk'
  start: number
  end: number
}

export interface ScoreFactor {
  id: 'light' | 'low' | 'high' | 'rain' | 'visibility'
  label: string
  points: number
  max: number
  detail: string
}

export interface HourSlot {
  time: number
  cloudCover: number
  cloudLow: number
  cloudMid: number
  cloudHigh: number
  visibility: number
  precipitation: number
  precipitationProbability: number
  phase: SkyPhase
  score: number
  factors: ScoreFactor[]
}

export interface DayForecast {
  date: string
  start: number
  end: number
  sun: SunDay
  segments: SkySegment[]
  slots: HourSlot[]
  best: HourSlot | null
}

export interface Place {
  id: number | null
  name: string
  subtitle: string
  latitude: number
  longitude: number
}

export interface LocationForecast {
  timezone: string
  days: DayForecast[]
  fetchedAt: number
}
