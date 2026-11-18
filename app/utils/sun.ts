import type { SkyPhase, SkySegment, SunDay, TimeRange } from '~/types/light'

const RAD = Math.PI / 180
const DAY_MS = 86_400_000
const J1970 = 2_440_588
const J2000 = 2_451_545
const J0 = 0.0009
const OBLIQUITY = RAD * 23.4397

export const ANGLES = {
  sunrise: -0.833,
  blueLow: -6,
  blueHigh: -4,
  goldHigh: 6
} as const

const toJulian = (ms: number): number => ms / DAY_MS - 0.5 + J1970
const fromJulian = (j: number): number => (j + 0.5 - J1970) * DAY_MS
const toDays = (ms: number): number => toJulian(ms) - J2000
const meanAnomaly = (d: number): number => RAD * (357.5291 + 0.98560028 * d)

function eclipticLongitude(m: number): number {
  const center = RAD * (1.9148 * Math.sin(m) + 0.02 * Math.sin(2 * m) + 0.0003 * Math.sin(3 * m))
  return m + center + RAD * 102.9372 + Math.PI
}

const declination = (l: number): number => Math.asin(Math.sin(OBLIQUITY) * Math.sin(l))
const approxTransit = (ht: number, lw: number, n: number): number => J0 + (ht + lw) / (2 * Math.PI) + n
const solarTransit = (ds: number, m: number, l: number): number => J2000 + ds + 0.0053 * Math.sin(m) - 0.0069 * Math.sin(2 * l)

export interface Crossings {
  rise: number | null
  set: number | null
  always: 'above' | 'below' | null
}

export function sunCrossings(dateIso: string, latitude: number, longitude: number, angle: number): Crossings {
  const [year, month, day] = dateIso.split('-').map(Number) as [number, number, number]
  const noonGuess = Date.UTC(year, month - 1, day, 12) - (longitude / 15) * 3_600_000
  const lw = RAD * -longitude
  const phi = RAD * latitude
  const d = toDays(noonGuess)
  const n = Math.round(d - J0 - lw / (2 * Math.PI))
  const ds = approxTransit(0, lw, n)
  const m = meanAnomaly(ds)
  const l = eclipticLongitude(m)
  const dec = declination(l)
  const noon = solarTransit(ds, m, l)
  const cos = (Math.sin(angle * RAD) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec))
  if (cos < -1) return { rise: null, set: null, always: 'above' }
  if (cos > 1) return { rise: null, set: null, always: 'below' }
  const set = solarTransit(approxTransit(Math.acos(cos), lw, n), m, l)
  const rise = noon - (set - noon)
  return { rise: Math.round(fromJulian(rise)), set: Math.round(fromJulian(set)), always: null }
}

function range(start: number | null, end: number | null): TimeRange | null {
  return start !== null && end !== null && end > start ? { start, end } : null
}

export function computeSunDay(dateIso: string, latitude: number, longitude: number, sunrise: number | null, sunset: number | null): SunDay {
  const blueLow = sunCrossings(dateIso, latitude, longitude, ANGLES.blueLow)
  const blueHigh = sunCrossings(dateIso, latitude, longitude, ANGLES.blueHigh)
  const gold = sunCrossings(dateIso, latitude, longitude, ANGLES.goldHigh)
  const lowSunAllDay = gold.always === 'below' && blueHigh.always === null
  return {
    date: dateIso,
    sunrise,
    sunset,
    always: blueLow.always === 'above' ? 'day' : blueLow.always === 'below' ? 'night' : null,
    blueMorning: range(blueLow.rise, blueHigh.rise),
    goldMorning: lowSunAllDay ? range(blueHigh.rise, blueHigh.set) : range(blueHigh.rise, gold.rise),
    goldEvening: lowSunAllDay ? null : range(gold.set, blueHigh.set),
    blueEvening: range(blueHigh.set, blueLow.set)
  }
}

const inRange = (t: number, r: TimeRange | null): boolean => r !== null && t >= r.start && t < r.end

export function phaseAt(t: number, sun: SunDay): SkyPhase {
  if (sun.always) return sun.always
  if (inRange(t, sun.goldMorning) || inRange(t, sun.goldEvening)) return 'gold'
  if (inRange(t, sun.blueMorning) || inRange(t, sun.blueEvening)) return 'blue'
  if (sun.goldMorning && sun.goldEvening && t >= sun.goldMorning.end && t < sun.goldEvening.start) return 'day'
  if (!sun.goldMorning && sun.sunrise !== null && sun.sunset !== null && t >= sun.sunrise && t < sun.sunset) return 'day'
  return 'night'
}

export function overlap(start: number, end: number, r: TimeRange | null): number {
  if (!r) return 0
  return Math.max(0, Math.min(end, r.end) - Math.max(start, r.start))
}

export function buildSegments(dayStart: number, dayEnd: number, sun: SunDay): SkySegment[] {
  const bounds = [sun.blueMorning, sun.goldMorning, sun.goldEvening, sun.blueEvening, sun.sunrise !== null && sun.sunset !== null ? { start: sun.sunrise, end: sun.sunset } : null]
    .flatMap((r) => (r ? [r.start, r.end] : []))
    .filter((at) => at > dayStart && at < dayEnd)
    .sort((a, b) => a - b)
  const cuts = [dayStart, ...bounds, dayEnd]
  const segments: SkySegment[] = []
  for (let i = 0; i < cuts.length - 1; i++) {
    const start = cuts[i] as number
    const end = cuts[i + 1] as number
    if (end <= start) continue
    const mid = (start + end) / 2
    const base = phaseAt(mid, sun)
    const phase: SkySegment['phase'] = base === 'gold' && inRange(mid, sun.goldEvening)
      ? 'sunset'
      : base === 'blue' && inRange(mid, sun.blueEvening) ? 'dusk' : base
    const last = segments.at(-1)
    if (last && last.phase === phase) last.end = end
    else segments.push({ phase, start, end })
  }
  return segments
}
