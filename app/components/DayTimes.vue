<template>
  <section class="times" aria-labelledby="times-title">
    <h2 id="times-title" class="times__title">Les heures du jour</h2>
    <div class="times__grid">
      <div class="times__card" :class="{ 'is-highlight': highlight === 'morning' }">
        <h3 class="times__period">Matin</h3>
        <dl class="times__list">
          <div><dt class="is-blue">heure bleue</dt><dd>{{ formatRange(sun.blueMorning, timezone) }}</dd></div>
          <div><dt class="is-gold">heure dorée</dt><dd>{{ formatRange(sun.goldMorning, timezone) }}</dd></div>
          <div><dt>lever</dt><dd>{{ formatTime(sun.sunrise, timezone) }}</dd></div>
        </dl>
      </div>
      <div class="times__card" :class="{ 'is-highlight': highlight === 'evening' }">
        <h3 class="times__period">Soir</h3>
        <dl class="times__list">
          <div><dt class="is-gold">heure dorée</dt><dd>{{ formatRange(sun.goldEvening, timezone) }}</dd></div>
          <div><dt>coucher</dt><dd>{{ formatTime(sun.sunset, timezone) }}</dd></div>
          <div><dt class="is-blue">heure bleue</dt><dd>{{ formatRange(sun.blueEvening, timezone) }}</dd></div>
        </dl>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { HourSlot, SunDay } from '~/types/light'

const props = defineProps<{
  sun: SunDay
  timezone: string
  best: HourSlot | null
}>()

const highlight = computed(() => {
  if (!props.best || props.best.phase === 'day' || props.best.phase === 'night') return null
  const noon = props.sun.sunrise !== null && props.sun.sunset !== null ? (props.sun.sunrise + props.sun.sunset) / 2 : null
  if (noon === null) return null
  return props.best.time < noon ? 'morning' : 'evening'
})
</script>

<style scoped lang="scss">
.times {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.times__title {
  font-size: 1.375rem;
}

.times__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.times__card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  background: var(--c-card);

  &.is-highlight {
    border: 1.5px solid var(--c-amber);
  }
}

.times__period {
  font-family: var(--font-ui);
  font-size: 0.8125rem;
  color: var(--c-sepia);
}

.times__list {
  display: flex;
  flex-direction: column;
  gap: 10px;

  dt {
    font-size: 0.8125rem;
    color: var(--c-sepia);

    &.is-blue {
      font-weight: 500;
      color: var(--c-blue);
    }

    &.is-gold {
      font-weight: 500;
      color: var(--c-amber);
    }
  }

  dd {
    margin: 0;
    font-size: 1.0625rem;
    font-variant-numeric: tabular-nums;
  }
}
</style>
