<template>
  <section v-if="slot" class="explain" aria-labelledby="explain-title">
    <h2 id="explain-title" class="explain__title">Pourquoi {{ slot.score }}&nbsp;?</h2>
    <p class="explain__intro">Créneau de {{ formatTime(slot.time, timezone) }}. Chaque critère rapporte des points, le total donne le score sur 100.</p>
    <dl class="explain__list">
      <div v-for="factor in slot.factors" :key="factor.id" class="explain__row">
        <dt class="explain__label">{{ factor.label }}</dt>
        <dd class="explain__points" :class="pointsClass(factor)">
          <span aria-hidden="true">+{{ factor.points }}</span>
          <span class="sr-only">{{ factor.points }} points sur {{ factor.max }}</span>
        </dd>
        <dd class="explain__detail">{{ factor.detail }}</dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import type { HourSlot, ScoreFactor } from '~/types/light'

defineProps<{
  slot: HourSlot | null
  timezone: string
}>()

function pointsClass(factor: ScoreFactor): string {
  if (factor.max === 0) return 'is-neutral'
  const ratio = factor.points / factor.max
  if (ratio >= 0.66) return 'is-good'
  if (ratio >= 0.33) return 'is-neutral'
  return 'is-bad'
}
</script>

<style scoped lang="scss">
.explain {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 20px;
  border-top: 1px solid var(--c-line);
}

.explain__title {
  font-size: 1.375rem;
}

.explain__intro {
  margin-bottom: 4px;
  font-size: 0.875rem;
  color: var(--c-sepia);
}

.explain__list {
  display: flex;
  flex-direction: column;
}

.explain__row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2px 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--c-line);
}

.explain__label {
  font-weight: 500;
}

.explain__points {
  margin: 0;
  font-weight: 500;
  font-variant-numeric: tabular-nums;

  &.is-good {
    color: var(--c-positive);
  }

  &.is-neutral {
    color: var(--c-sepia);
  }

  &.is-bad {
    color: var(--c-error);
  }
}

.explain__detail {
  grid-column: 1 / -1;
  margin: 0;
  font-size: 0.875rem;
  color: var(--c-sepia);
}
</style>
