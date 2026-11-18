<template>
  <div ref="list" role="tablist" aria-label="Jour" class="tabs" @keydown="onKeydown">
    <button
      v-for="(day, index) in days"
      :id="`tab-${day.date}`"
      :key="day.date"
      type="button"
      role="tab"
      class="tabs__tab"
      :aria-selected="index === modelValue"
      :aria-controls="panelId"
      :tabindex="index === modelValue ? 0 : -1"
      @click="emit('update:modelValue', index)"
    >
      <span aria-hidden="true">{{ formatDayTab(day.date, index) }}</span>
      <span class="sr-only">{{ index === 0 ? 'Aujourd’hui, ' : '' }}{{ formatDayLong(day.date) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { DayForecast } from '~/types/light'

const props = defineProps<{
  days: DayForecast[]
  modelValue: number
  panelId: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const list = useTemplateRef<HTMLDivElement>('list')

function onKeydown(event: KeyboardEvent): void {
  const last = props.days.length - 1
  const moves: Record<string, number> = {
    ArrowRight: Math.min(last, props.modelValue + 1),
    ArrowLeft: Math.max(0, props.modelValue - 1),
    Home: 0,
    End: last
  }
  const next = moves[event.key]
  if (next === undefined) return
  event.preventDefault()
  emit('update:modelValue', next)
  nextTick(() => {
    list.value?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  })
}
</script>

<style scoped lang="scss">
.tabs {
  display: flex;
  gap: 6px;
  margin-inline: calc(var(--gutter) * -1);
  padding: 4px var(--gutter);
  overflow-x: auto;
  scrollbar-width: none;
}

.tabs__tab {
  position: relative;
  flex: none;
  min-height: var(--tap);
  padding: 0 16px;
  border: 1.5px solid var(--c-line);
  border-radius: var(--radius-pill);
  background: transparent;
  font-size: 0.875rem;
  cursor: pointer;

  &:hover {
    border-color: var(--c-ink);
  }

  &[aria-selected='true'] {
    border-color: var(--c-ink);
    background: var(--c-ink);
    color: var(--c-paper);
  }
}
</style>
