import type { TimeRange } from '~/types/light'

const timeFormatters = new Map<string, Intl.DateTimeFormat>()
const dateFormatters = new Map<string, Intl.DateTimeFormat>()

function timeFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = timeFormatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone })
    timeFormatters.set(timeZone, f)
  }
  return f
}

function dateFormatter(timeZone: string): Intl.DateTimeFormat {
  let f = dateFormatters.get(timeZone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone })
    dateFormatters.set(timeZone, f)
  }
  return f
}

export function formatTime(ms: number | null, timeZone: string): string {
  return ms === null ? '—' : timeFormatter(timeZone).format(ms)
}

export function formatRange(range: TimeRange | null, timeZone: string): string {
  return range ? `${formatTime(range.start, timeZone)} – ${formatTime(range.end, timeZone)}` : '—'
}

export function spokenTime(ms: number, timeZone: string): string {
  return formatTime(ms, timeZone).replace(':', ' h ')
}

export function localDate(ms: number, timeZone: string): string {
  return dateFormatter(timeZone).format(ms)
}

export function hourOf(ms: number, timeZone: string): number {
  return Number(formatTime(ms, timeZone).slice(0, 2))
}

function utcNoon(dateIso: string): Date {
  const [y, m, d] = dateIso.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(y, m - 1, d, 12))
}

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

export function formatDayTab(dateIso: string, index: number): string {
  const date = utcNoon(dateIso)
  const day = date.getUTCDate()
  if (index === 0) return `Auj. ${day}`
  const weekday = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', timeZone: 'UTC' }).format(date)
  return `${capitalize(weekday)} ${day}`
}

export function formatDayLong(dateIso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(utcNoon(dateIso))
}

export function formatCoords(latitude: number, longitude: number): string {
  const lat = `${Math.abs(latitude).toFixed(2).replace('.', ',')}° ${latitude >= 0 ? 'N' : 'S'}`
  const lon = `${Math.abs(longitude).toFixed(2).replace('.', ',')}° ${longitude >= 0 ? 'E' : 'O'}`
  return `${lat}, ${lon}`
}
