<template>
  <div class="state" :class="`state--${tone}`" :role="tone === 'loading' ? 'status' : 'alert'">
    <div v-if="tone === 'loading'" class="state__skeleton" aria-hidden="true">
      <span class="state__bone state__bone--title" />
      <span class="state__bone state__bone--band" />
      <span class="state__bone state__bone--line" />
    </div>
    <h2 class="state__title">{{ title }}</h2>
    <p v-if="$slots.default" class="state__text"><slot /></p>
    <div v-if="$slots.actions" class="state__actions"><slot name="actions" /></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  tone?: 'loading' | 'error' | 'info'
}>(), {
  tone: 'info'
})
</script>

<style scoped lang="scss">
.state {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  border: 1px solid var(--c-line);
  border-radius: 16px;
  background: var(--c-card);

  &--error {
    border: 1.5px solid var(--c-ink);
  }
}

.state__title {
  font-size: 1.3125rem;
}

.state--loading .state__title {
  font-style: italic;
  font-size: 1.0625rem;
  color: var(--c-sepia);
}

.state__text {
  font-size: 0.9375rem;
  line-height: 1.45;
}

.state__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.state__skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 6px;
}

.state__bone {
  display: block;
  border-radius: 8px;
  background: #e8dccb;
  animation: pulse 1.6s ease-in-out infinite;

  &--title {
    width: 140px;
    height: 36px;
  }

  &--band {
    height: 44px;
    border-radius: var(--radius);
  }

  &--line {
    width: 70%;
    height: 14px;
  }
}

@keyframes pulse {
  50% {
    opacity: 0.55;
  }
}
</style>
