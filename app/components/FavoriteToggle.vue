<template>
  <button
    v-if="place.id !== null"
    type="button"
    class="btn btn--icon fav"
    :class="{ 'is-active': active }"
    :aria-pressed="active"
    :aria-label="active ? `Retirer ${place.name} de vos lieux` : `Ajouter ${place.name} à vos lieux`"
    @click="toggle(place)"
  >
    <svg width="24" height="24" viewBox="0 0 24 24" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-2.9-5.4 2.9 1.1-6L3.2 9.4l6.1-.8z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import type { Place } from '~/types/light'

const props = defineProps<{ place: Place }>()

const { isFavorite, toggle } = useFavorites()
const active = computed(() => isFavorite(props.place.id))
</script>

<style scoped lang="scss">
.fav {
  flex: none;
  border-color: transparent;

  svg {
    fill: transparent;
    stroke: var(--c-ink);
    transition: fill 0.2s ease;
  }

  &:hover {
    border-color: var(--c-line);
    background: transparent;
  }

  &.is-active svg {
    fill: var(--sky-gold);
    stroke: var(--c-amber);
  }
}
</style>
