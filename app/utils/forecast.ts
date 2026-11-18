import type { ForecastResponse } from '~/types/open-meteo'
import type { DayForecast, HourSlot, LocationForecast } from '~/types/light'
import { buildSegments, computeSunDay } from './sun'
import { scoreSlot } from './score'
import { localDate } from './format'

const DAY = 86_400_000

const num = (v: number | null | undefined, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)

export function buildForecast(res: ForecastResponse, latitude: number, longitude: number, fetchedAt: number): LocationForecast {
  const tz = res.timezone
  const hourly = res.hourly
  const days: DayForecast[] = res.daily.time.map((startSec, i) => {
    const dayStart = startSec * 1000
    const next = res.daily.time[i + 1]
    const dayEnd = next !== undefined ? next * 1000 : dayStart + DAY
    const date = localDate(dayStart + DAY / 2, tz)
    const sunrise = num(res.daily.sunrise[i], NaN)
    const sunset = num(res.daily.sunset[i], NaN)
    const sun = computeSunDay(
      date,
      latitude,
      longitude,
      Number.isNaN(sunrise) ? null : sunrise * 1000,
      Number.isNaN(sunset) ? null : sunset * 1000
    )

    const slots: HourSlot[] = []
    hourly.time.forEach((sec, h) => {
      const t = sec * 1000
      if (t < dayStart || t >= dayEnd) return
      const cloud = hourly.cloud_cover[h]
      if (cloud === null || cloud === undefined) return
      slots.push(scoreSlot(t, {
        cloudCover: num(cloud),
        cloudLow: num(hourly.cloud_cover_low[h]),
        cloudMid: num(hourly.cloud_cover_mid[h]),
        cloudHigh: num(hourly.cloud_cover_high[h]),
        visibility: num(hourly.visibility[h], 20_000),
        precipitation: num(hourly.precipitation[h]),
        precipitationProbability: num(hourly.precipitation_probability[h])
      }, sun))
    })

    const best = slots.reduce<HourSlot | null>((top, s) => (s.score > 0 && (!top || s.score > top.score) ? s : top), null)

    return { date, start: dayStart, end: dayEnd, sun, segments: buildSegments(dayStart, dayEnd, sun), slots, best }
  })

  return { timezone: tz, days: days.filter((d) => d.slots.length > 0), fetchedAt }
}
