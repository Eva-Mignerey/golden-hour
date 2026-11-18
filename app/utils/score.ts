import type { HourSlot, ScoreFactor, SkyPhase, SunDay } from '~/types/light'
import { overlap, phaseAt } from './sun'

const HOUR = 3_600_000

export const WEIGHTS = {
  gold: 45,
  blue: 25,
  day: 8,
  low: 25,
  high: 15,
  rain: 10,
  visibility: 5
} as const

export interface WeatherInput {
  cloudCover: number
  cloudLow: number
  cloudMid: number
  cloudHigh: number
  visibility: number
  precipitation: number
  precipitationProbability: number
}

const clamp = (v: number, min = 0, max = 1): number => Math.min(max, Math.max(min, v))

function interpolate(x: number, points: Array<[number, number]>): number {
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i] as [number, number]
    const [x1, y1] = points[i + 1] as [number, number]
    if (x <= x1) return y0 + ((y1 - y0) * (clamp(x, x0, x1) - x0)) / (x1 - x0)
  }
  return (points.at(-1) as [number, number])[1]
}

function lowDetail(low: number): string {
  if (low < 15) return 'Rien ne bloque le soleil sur l’horizon.'
  if (low < 50) return 'Quelques nuages bas peuvent masquer le soleil.'
  return 'Les nuages bas bouchent l’horizon.'
}

function highDetail(cover: number): string {
  if (cover < 10) return 'Ciel pur : lumière nette, mais peu de couleurs dans le ciel.'
  if (cover <= 65) return 'Assez de nuages hauts pour colorer le ciel, pas assez pour l’éteindre.'
  return 'Voile épais : les couleurs risquent d’être ternes.'
}

function rainDetail(probability: number, mm: number): string {
  if (mm >= 0.2) return `Il pleut (${mm.toFixed(1).replace('.', ',')} mm).`
  if (probability < 20) return 'Sec.'
  if (probability < 50) return 'Risque d’averse, prévoyez de quoi protéger le boîtier.'
  return 'Pluie probable.'
}

function lightDetail(phase: SkyPhase): string {
  switch (phase) {
    case 'gold': return 'Soleil bas, lumière chaude et rasante.'
    case 'blue': return 'Ciel bleu profond juste avant le lever ou après le coucher.'
    case 'day': return 'Plein jour : lumière plus dure et plus plate.'
    default: return 'Il fait nuit.'
  }
}

const LIGHT_LABEL: Record<SkyPhase, string> = {
  gold: 'Heure dorée',
  blue: 'Heure bleue',
  day: 'Plein jour',
  night: 'Nuit'
}

export function slotPhase(start: number, sun: SunDay): SkyPhase {
  const end = start + HOUR
  const gold = overlap(start, end, sun.goldMorning) + overlap(start, end, sun.goldEvening)
  const blue = overlap(start, end, sun.blueMorning) + overlap(start, end, sun.blueEvening)
  if (gold >= HOUR / 3) return 'gold'
  if (blue >= HOUR / 3) return 'blue'
  if (gold > 0) return 'gold'
  if (blue > 0) return 'blue'
  return phaseAt(start + HOUR / 2, sun)
}

export function scoreSlot(start: number, weather: WeatherInput, sun: SunDay): HourSlot {
  const end = start + HOUR
  const gold = (overlap(start, end, sun.goldMorning) + overlap(start, end, sun.goldEvening)) / HOUR
  const blue = (overlap(start, end, sun.blueMorning) + overlap(start, end, sun.blueEvening)) / HOUR
  const daylight = sun.always === 'day' ? 1 : sun.sunrise !== null && sun.sunset !== null ? overlap(start, end, { start: sun.sunrise, end: sun.sunset }) / HOUR : 0
  const plainDay = clamp(daylight - gold)
  const phase = slotPhase(start, sun)

  const lightPoints = Math.round(WEIGHTS.gold * gold + WEIGHTS.blue * blue + WEIGHTS.day * plainDay)
  const lightFactor: ScoreFactor = {
    id: 'light',
    label: LIGHT_LABEL[phase],
    points: lightPoints,
    max: WEIGHTS.gold,
    detail: lightDetail(phase)
  }

  const base: Omit<HourSlot, 'score' | 'factors'> = { time: start, phase, ...weather }

  if (lightPoints === 0) {
    return { ...base, score: 0, factors: [lightFactor] }
  }

  const k = clamp(gold + 0.8 * blue + 0.3 * plainDay)
  const highCover = Math.max(weather.cloudMid, weather.cloudHigh)
  const rainQuality = weather.precipitation >= 0.2 ? 0 : 1 - weather.precipitationProbability / 100
  const km = Math.round(weather.visibility / 1000)

  const weatherFactors: ScoreFactor[] = [
    {
      id: 'low',
      label: `Nuages bas · ${weather.cloudLow} %`,
      points: Math.round(WEIGHTS.low * k * (1 - weather.cloudLow / 100)),
      max: Math.round(WEIGHTS.low * k),
      detail: lowDetail(weather.cloudLow)
    },
    {
      id: 'high',
      label: `Nuages hauts · ${highCover} %`,
      points: Math.round(WEIGHTS.high * k * interpolate(highCover, [[0, 0.5], [25, 1], [60, 1], [100, 0.2]])),
      max: Math.round(WEIGHTS.high * k),
      detail: highDetail(highCover)
    },
    {
      id: 'rain',
      label: `Pluie · ${weather.precipitationProbability} %`,
      points: Math.round(WEIGHTS.rain * k * rainQuality),
      max: Math.round(WEIGHTS.rain * k),
      detail: rainDetail(weather.precipitationProbability, weather.precipitation)
    },
    {
      id: 'visibility',
      label: `Visibilité · ${km} km`,
      points: Math.round(WEIGHTS.visibility * k * clamp(weather.visibility / 20_000)),
      max: Math.round(WEIGHTS.visibility * k),
      detail: km >= 10 ? 'Air transparent, lointains nets.' : 'Brume ou air chargé, lointains adoucis.'
    }
  ]

  const factors = [lightFactor, ...weatherFactors]
  const score = Math.min(100, factors.reduce((sum, f) => sum + f.points, 0))
  return { ...base, score, factors }
}

export function scoreLabel(score: number): string {
  if (score >= 75) return 'Belle lumière'
  if (score >= 55) return 'Lumière intéressante'
  if (score >= 35) return 'Lumière moyenne'
  if (score > 0) return 'Lumière terne'
  return 'Pas de lumière'
}

export function scoreSummary(slot: HourSlot): string {
  const low = slot.cloudLow
  const high = Math.max(slot.cloudMid, slot.cloudHigh)
  if (slot.precipitation >= 0.2 || slot.precipitationProbability >= 60) return 'La pluie risque de gâcher le créneau, mais un ciel d’orage peut aussi surprendre.'
  if (low >= 60) return 'Les nuages bas risquent de cacher le soleil : lumière douce et diffuse.'
  if (low < 20 && high >= 10 && high <= 65) return 'Horizon dégagé et nuages hauts qui peuvent s’embraser : le meilleur scénario.'
  if (low < 20 && high < 10) return 'Ciel dégagé : lumière chaude et nette, ciel sans relief.'
  return 'Ciel partagé : la lumière peut percer par moments.'
}
