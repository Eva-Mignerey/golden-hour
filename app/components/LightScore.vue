<template>
  <section class="score" aria-labelledby="score-title">
    <h2 id="score-title" class="score__title">{{ title }}</h2>
    <template v-if="best">
      <div class="score__main">
        <p class="score__value" :class="{ 'score__value--low': best.score < 55 }">
          {{ best.score }}<span class="sr-only"> sur 100</span>
        </p>
        <p class="score__meta">
          <span class="score__label">{{ scoreLabel(best.score) }}</span>
          <span>{{ moment }}</span>
        </p>
      </div>
      <p class="score__summary">{{ scoreSummary(best) }}</p>
    </template>
    <p v-else class="score__summary">Aucun créneau lumineux ce jour-là à cet endroit.</p>
  </section>
</template>

<script setup lang="ts">
import type { HourSlot, SunDay, TimeRange } from '~/types/light'

const props = defineProps<{
  best: HourSlot | null
  sun: SunDay
  timezone: string
  isToday: boolean
}>()

const title = computed(() => (props.isToday ? 'Meilleure lumière aujourd’hui' : 'Meilleure lumière ce jour-là'))

const moment = computed(() => {
  const slot = props.best
  if (!slot) return ''
  const contains = (r: TimeRange | null): boolean => r !== null && slot.time < r.end && slot.time + 3_600_000 > r.start
  const periods: Array<[TimeRange | null, string]> = [
    [props.sun.goldMorning, 'dorée du matin'],
    [props.sun.goldEvening, 'dorée du soir'],
    [props.sun.blueMorning, 'bleue du matin'],
    [props.sun.blueEvening, 'bleue du soir']
  ]
  const match = periods.find(([r]) => contains(r))
  if (match && match[0]) return `${formatRange(match[0], props.timezone)} · ${match[1]}`
  return `${formatRange({ start: slot.time, end: slot.time + 3_600_000 }, props.timezone)} · plein jour`
})
</script>

<style scoped lang="scss">
@use '~/assets/scss/breakpoints' as *;

.score {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score__title {
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--c-sepia);
}

.score__main {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.score__value {
  font-family: var(--font-display);
  font-size: clamp(5.5rem, 22vw, 8.75rem);
  line-height: 0.82;
  letter-spacing: -0.03em;
  color: var(--c-amber);

  &--low {
    color: var(--c-sepia);
  }
}

.score__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 6px;
}

.score__label {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.5rem;
  line-height: 1.1;

  @include from($bp-md) {
    font-size: 1.75rem;
  }
}

.score__summary {
  font-family: var(--font-display);
  font-size: 1.1875rem;
  line-height: 1.4;

  @include from($bp-md) {
    font-size: 1.3125rem;
  }
}
</style>
