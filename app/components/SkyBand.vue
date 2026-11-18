<template>
  <figure class="sky" :class="`sky--${size}`" :aria-label="label">
    <div class="sky__track">
      <div class="sky__band" aria-hidden="true">
        <span
          v-for="segment in segments"
          :key="segment.start"
          class="sky__segment"
          :style="{ flexGrow: segment.end - segment.start, background: `var(--sky-${segment.phase})` }"
        />
      </div>
      <template v-if="nowPosition !== null">
        <span class="sky__now" :style="{ left: `${nowPosition}%` }" aria-hidden="true" />
        <span class="sky__now-label" :style="{ left: `${nowPosition}%` }" aria-hidden="true">{{ nowLabel }}</span>
      </template>
    </div>
    <div v-if="axis" class="sky__axis" aria-hidden="true">
      <span v-for="tick in ticks" :key="tick">{{ tick }}h</span>
    </div>
  </figure>
</template>

<script setup lang="ts">
import type { SkySegment } from '~/types/light'

const props = withDefaults(defineProps<{
  segments: SkySegment[]
  start: number
  end: number
  timezone: string
  label: string
  now?: number | null
  size?: 'sm' | 'md' | 'lg'
  axis?: boolean
}>(), {
  now: null,
  size: 'md',
  axis: false
})

const nowPosition = computed(() => {
  if (props.now === null || props.now < props.start || props.now >= props.end) return null
  return ((props.now - props.start) / (props.end - props.start)) * 100
})

const nowLabel = computed(() => (props.now === null ? '' : formatTime(props.now, props.timezone)))

const ticks = computed(() => (props.size === 'lg' ? [0, 3, 6, 9, 12, 15, 18, 21, 24] : [0, 6, 12, 18, 24]))
</script>

<style scoped lang="scss">
.sky {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sky__track {
  position: relative;
}

.sky__band {
  display: flex;
  height: 44px;
  overflow: hidden;
  border-radius: var(--radius);
}

.sky--sm .sky__band {
  height: 6px;
  border-radius: 3px;
}

.sky--lg .sky__band {
  height: 56px;
  border-radius: 14px;
}

.sky__segment {
  flex-basis: 0;
  min-width: 1px;
}

.sky__now {
  position: absolute;
  top: -6px;
  bottom: -6px;
  width: 2px;
  margin-left: -1px;
  background: var(--c-ink);
}

.sky__now-label {
  position: absolute;
  top: -26px;
  font-size: 0.75rem;
  white-space: nowrap;
  transform: translateX(-50%);
}

.sky__axis {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--c-sepia);
}
</style>
