<template>
  <section class="next" aria-labelledby="next-title">
    <h2 id="next-title" class="next__title">Les prochains jours</h2>
    <ul class="next__list">
      <li v-for="item in items" :key="item.date">
        <button type="button" class="next__item" :aria-current="item.index === selected ? 'true' : undefined" @click="emit('select', item.index)">
          <span class="next__day">{{ formatDayTab(item.date, item.index) }}</span>
          <span class="next__score" :class="{ 'is-good': item.score >= 55 }">
            {{ item.score }}<span class="sr-only"> sur 100</span>
          </span>
          <span class="next__text">{{ item.text }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { DayForecast } from '~/types/light'

const props = defineProps<{
  days: DayForecast[]
  selected: number
  timezone: string
}>()

const emit = defineEmits<{ select: [index: number] }>()

const items = computed(() => props.days.map((day, index) => ({
  index,
  date: day.date,
  score: day.best?.score ?? 0,
  text: day.best
    ? `${scoreLabel(day.best.score)} vers ${formatTime(day.best.time, props.timezone)}`
    : 'Pas de créneau lumineux'
})))
</script>

<style scoped lang="scss">
.next {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.next__title {
  margin-bottom: 4px;
  font-size: 1.375rem;
}

.next__list {
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--c-line);

  li {
    border-bottom: 1px solid var(--c-line);
  }
}

.next__item {
  display: grid;
  grid-template-columns: 64px 48px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: var(--tap);
  padding: 10px 4px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: var(--c-card);
  }

  &[aria-current='true'] {
    background: var(--c-card);
    box-shadow: inset 3px 0 0 var(--c-amber);
  }
}

.next__day {
  font-size: 0.9375rem;
}

.next__score {
  font-family: var(--font-display);
  font-size: 1.75rem;
  line-height: 1;
  color: var(--c-sepia);

  &.is-good {
    color: var(--c-amber);
  }
}

.next__text {
  font-size: 0.875rem;
  color: var(--c-sepia);
}
</style>
