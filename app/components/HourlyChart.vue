<template>
  <section class="hourly" aria-labelledby="hourly-title">
    <div class="hourly__head">
      <h2 id="hourly-title" class="hourly__title">Heure par heure</h2>
      <button
        type="button"
        class="link-btn"
        :aria-expanded="showTable"
        :aria-controls="tableId"
        @click="showTable = !showTable"
      >
        {{ showTable ? 'Masquer le tableau' : 'Voir le tableau' }}
      </button>
    </div>

    <svg
      ref="chart"
      class="hourly__chart"
      :viewBox="`0 0 ${width} ${HEIGHT}`"
      :height="HEIGHT"
      role="img"
      :aria-label="summary"
    >
      <rect
        v-for="band in bands"
        :key="`${band.kind}-${band.x}`"
        :x="band.x"
        :y="TOP"
        :width="band.w"
        :height="BASE - TOP"
        :class="`hourly__band hourly__band--${band.kind}`"
      />
      <g v-for="(bar, i) in bars" :key="bar.time">
        <rect :x="i * STEP + 3" :y="bar.cloudY" :width="STEP - 6" :height="BASE - bar.cloudY" rx="2" class="hourly__cloud" />
        <rect :x="i * STEP + 3" :y="bar.lowY" :width="STEP - 6" :height="BASE - bar.lowY" rx="2" class="hourly__cloud-low" />
        <circle v-if="bar.rain" :cx="i * STEP + STEP / 2" :cy="TOP - 4" :r="bar.rain" class="hourly__rain" />
      </g>
      <polyline :points="scoreLine" class="hourly__score" />
      <circle v-if="bestPoint" :cx="bestPoint.x" :cy="bestPoint.y" r="5" class="hourly__best" />
      <line x1="0" :y1="BASE" :x2="width" :y2="BASE" class="hourly__axis" />
      <text
        v-for="(bar, i) in bars"
        v-show="bar.hour % 3 === 0"
        :key="`t-${bar.time}`"
        :x="i * STEP + STEP / 2"
        :y="BASE + 18"
        text-anchor="middle"
        class="hourly__tick"
      >{{ bar.hour }}h</text>
    </svg>

    <ul class="hourly__legend" aria-label="Légende du graphique">
      <li><span class="swatch swatch--low" aria-hidden="true" />nuages bas</li>
      <li><span class="swatch swatch--cloud" aria-hidden="true" />nuages au total</li>
      <li><span class="swatch swatch--score" aria-hidden="true" />score lumière</li>
      <li><span class="swatch swatch--rain" aria-hidden="true" />risque de pluie</li>
      <li><span class="swatch swatch--gold" aria-hidden="true" />heure dorée</li>
      <li><span class="swatch swatch--blue" aria-hidden="true" />heure bleue</li>
    </ul>

    <div v-show="showTable" :id="tableId" class="hourly__table-wrap">
      <table class="hourly__table">
        <caption class="sr-only">Prévisions heure par heure</caption>
        <thead>
          <tr>
            <th scope="col">Heure</th>
            <th scope="col">Score</th>
            <th scope="col">Nuages bas</th>
            <th scope="col">Nuages</th>
            <th scope="col">Pluie</th>
            <th scope="col">Visib.</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="slot in visibleSlots" :key="slot.time" :class="`is-${slot.phase}`">
            <th scope="row">{{ formatTime(slot.time, timezone) }}</th>
            <td>{{ slot.score }}</td>
            <td>{{ slot.cloudLow }} %</td>
            <td>{{ slot.cloudCover }} %</td>
            <td>{{ slot.precipitationProbability }} %</td>
            <td>{{ Math.round(slot.visibility / 1000) }} km</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HourSlot, SunDay, TimeRange } from '~/types/light'

const props = defineProps<{
  slots: HourSlot[]
  sun: SunDay
  timezone: string
}>()

const HEIGHT = 230
const TOP = 16
const BASE = HEIGHT - 28
const HOUR = 3_600_000

const showTable = ref(false)
const tableId = useId()

const visibleSlots = computed(() => {
  const lit = props.slots.map((s, i) => (s.phase !== 'night' ? i : -1)).filter((i) => i >= 0)
  if (!lit.length) return props.slots
  const first = Math.max(0, (lit[0] as number) - 1)
  const last = Math.min(props.slots.length - 1, (lit.at(-1) as number) + 1)
  return props.slots.slice(first, last + 1)
})

const chart = useTemplateRef<SVGSVGElement>('chart')
const measured = ref(0)
let observer: ResizeObserver | undefined

onMounted(() => {
  if (!chart.value) return
  observer = new ResizeObserver(([entry]) => {
    if (entry) measured.value = Math.round(entry.contentRect.width)
  })
  observer.observe(chart.value)
})

onBeforeUnmount(() => observer?.disconnect())

const STEP = computed(() => {
  const n = Math.max(1, visibleSlots.value.length)
  return measured.value ? Math.min(64, Math.max(16, measured.value / n)) : 26
})

const width = computed(() => visibleSlots.value.length * STEP.value)
const scale = (v: number): number => BASE - ((BASE - TOP) * v) / 100

const bars = computed(() => visibleSlots.value.map((s) => ({
  time: s.time,
  hour: hourOf(s.time, props.timezone),
  cloudY: scale(s.cloudCover * 0.9),
  lowY: scale(s.cloudLow * 0.9),
  rain: s.precipitationProbability >= 30 ? (s.precipitationProbability >= 60 ? 4 : 2.5) : 0
})))

const scoreLine = computed(() => visibleSlots.value.map((s, i) => `${i * STEP.value + STEP.value / 2},${scale(s.score)}`).join(' '))

const bestPoint = computed(() => {
  let index = -1
  visibleSlots.value.forEach((s, i) => {
    if (s.score > 0 && (index < 0 || s.score > (visibleSlots.value[index] as HourSlot).score)) index = i
  })
  if (index < 0) return null
  return { x: index * STEP.value + STEP.value / 2, y: scale((visibleSlots.value[index] as HourSlot).score) }
})

const bands = computed(() => {
  const start = visibleSlots.value[0]?.time
  if (start === undefined) return []
  const toX = (t: number): number => ((t - start) / HOUR) * STEP.value
  const clip = (r: TimeRange | null, kind: 'gold' | 'blue') => {
    if (!r) return null
    const x = Math.max(0, toX(r.start))
    const end = Math.min(width.value, toX(r.end))
    return end > x ? { kind, x, w: end - x } : null
  }
  return [
    clip(props.sun.blueMorning, 'blue'),
    clip(props.sun.goldMorning, 'gold'),
    clip(props.sun.goldEvening, 'gold'),
    clip(props.sun.blueEvening, 'blue')
  ].filter((b): b is { kind: 'gold' | 'blue', x: number, w: number } => b !== null)
})

const summary = computed(() => {
  const best = visibleSlots.value.reduce<HourSlot | null>((top, s) => (!top || s.score > top.score ? s : top), null)
  const from = visibleSlots.value[0]
  const to = visibleSlots.value.at(-1)
  if (!best || !from || !to) return 'Pas de données horaires.'
  return `Nuages et score de lumière de ${spokenTime(from.time, props.timezone)} à ${spokenTime(to.time, props.timezone)}. Meilleur score ${best.score} sur 100 à ${spokenTime(best.time, props.timezone)}. Le détail est disponible en tableau.`
})
</script>

<style scoped lang="scss">
.hourly {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hourly__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hourly__title {
  font-size: 1.375rem;
}

.hourly__chart {
  width: 100%;
  max-width: 100%;
  overflow: visible;
}

.hourly__band--gold {
  fill: var(--sky-gold);
  opacity: 0.3;
}

.hourly__band--blue {
  fill: var(--sky-blue);
  opacity: 0.25;
}

.hourly__cloud {
  fill: #b9c0c8;
}

.hourly__cloud-low {
  fill: #6f7a86;
}

.hourly__rain {
  fill: var(--c-blue);
}

.hourly__score {
  fill: none;
  stroke: var(--c-amber);
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.hourly__best {
  fill: var(--c-amber);
  stroke: var(--c-paper);
  stroke-width: 2;
}

.hourly__axis {
  stroke: var(--c-ink);
  stroke-width: 1;
}

.hourly__tick {
  font-family: var(--font-ui);
  font-size: 12px;
  fill: var(--c-sepia);
}

.hourly__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  padding: 0;
  list-style: none;
  font-size: 0.8125rem;
  color: var(--c-sepia);

  li {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.swatch {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;

  &--low { background: #6f7a86; }
  &--cloud { background: #b9c0c8; }
  &--score { height: 3px; width: 16px; background: var(--c-amber); }
  &--rain { width: 8px; height: 8px; border-radius: 50%; background: var(--c-blue); }
  &--gold { background: #f3d39b; }
  &--blue { background: #b9c1d8; }
}

.hourly__table-wrap {
  overflow-x: auto;
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  background: var(--c-card);
}

.hourly__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  font-variant-numeric: tabular-nums;

  th,
  td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--c-line);
    text-align: right;
    white-space: nowrap;
  }

  thead th {
    font-weight: 500;
    color: var(--c-sepia);
  }

  th[scope='row'],
  thead th:first-child {
    text-align: left;
  }

  tr.is-gold th[scope='row'] {
    color: var(--c-amber);
    font-weight: 500;
  }

  tr.is-blue th[scope='row'] {
    color: var(--c-blue);
    font-weight: 500;
  }

  tbody tr:last-child > * {
    border-bottom: 0;
  }
}
</style>
