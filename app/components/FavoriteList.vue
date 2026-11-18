<template>
  <section class="favs" aria-labelledby="favs-title">
    <div class="favs__head">
      <h2 id="favs-title" class="favs__title">Vos lieux</h2>
      <p v-if="favorites.length" class="favs__hint">meilleure lumière du jour</p>
    </div>

    <p v-if="!ready" class="favs__empty" role="status">Chargement de vos lieux…</p>

    <div v-else-if="!favorites.length" class="favs__empty favs__empty--box">
      <h3 class="favs__empty-title">Gardez vos spots sous la main</h3>
      <p>Touchez l’étoile sur la page d’un lieu pour le retrouver ici avec son score du jour.</p>
    </div>

    <ul v-else class="favs__list">
      <li v-for="fav in favorites" :key="fav.id" class="favs__item">
        <NuxtLink :to="`/lieu/${placeSlug(fav)}`" class="favs__link">
          <span class="favs__score" :class="{ 'is-good': (summaries[fav.id]?.score ?? 0) >= 55 }">
            <template v-if="summaries[fav.id]?.state === 'ok'">{{ summaries[fav.id]?.score }}<span class="sr-only"> sur 100,</span></template>
            <template v-else-if="summaries[fav.id]?.state === 'error'">–<span class="sr-only">score indisponible,</span></template>
            <template v-else>·<span class="sr-only">chargement,</span></template>
          </span>
          <span class="favs__body">
            <span class="favs__name">{{ fav.name }}</span>
            <SkyBand
              v-if="summaries[fav.id]?.day"
              :segments="summaries[fav.id]!.day!.segments"
              :start="summaries[fav.id]!.day!.start"
              :end="summaries[fav.id]!.day!.end"
              :timezone="summaries[fav.id]!.timezone"
              label=""
              size="sm"
              aria-hidden="true"
            />
            <span v-else class="favs__subtitle">{{ fav.subtitle }}</span>
          </span>
          <span class="favs__when">{{ summaries[fav.id]?.when ?? '' }}</span>
        </NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { DayForecast } from '~/types/light'

interface Summary {
  state: 'loading' | 'ok' | 'error'
  score?: number
  when?: string
  day?: DayForecast
  timezone: string
}

const { favorites, ready } = useFavorites()
const summaries = reactive<Record<number, Summary>>({})

async function load(id: number, latitude: number, longitude: number): Promise<void> {
  if (summaries[id]?.state === 'ok') return
  summaries[id] = { state: 'loading', timezone: 'UTC' }
  try {
    const forecast = await fetchForecast(latitude, longitude)
    const day = forecast.days[0]
    const best = day?.best ?? null
    summaries[id] = {
      state: 'ok',
      score: best?.score ?? 0,
      when: best ? `vers ${formatTime(best.time, forecast.timezone)}` : 'nuit',
      day,
      timezone: forecast.timezone
    }
  } catch {
    summaries[id] = { state: 'error', when: 'hors ligne', timezone: 'UTC' }
  }
}

watch(favorites, (list) => {
  list.forEach((f) => {
    load(f.id, f.latitude, f.longitude)
  })
}, { immediate: true, deep: true })
</script>

<style scoped lang="scss">
.favs {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.favs__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.favs__title {
  font-size: 1.375rem;
}

.favs__hint {
  font-size: 0.8125rem;
  color: var(--c-sepia);
}

.favs__empty {
  font-size: 0.9375rem;
  line-height: 1.45;
  color: var(--c-sepia);

  &--box {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 20px;
    border: 1.5px dashed #c8b9a4;
    border-radius: 16px;
  }
}

.favs__empty-title {
  font-size: 1.3125rem;
  color: var(--c-ink);
}

.favs__list {
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--c-line);
}

.favs__item {
  border-bottom: 1px solid var(--c-line);
}

.favs__link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  color: var(--c-ink);
  text-decoration: none;

  &:hover .favs__name {
    color: var(--c-amber);
  }
}

.favs__score {
  flex: none;
  width: 48px;
  font-family: var(--font-display);
  font-size: 2.125rem;
  line-height: 1;
  color: var(--c-sepia);

  &.is-good {
    color: var(--c-amber);
  }
}

.favs__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.favs__name {
  font-size: 1rem;
  font-weight: 500;
}

.favs__subtitle {
  font-size: 0.8125rem;
  color: var(--c-sepia);
}

.favs__when {
  flex: none;
  width: 72px;
  font-size: 0.875rem;
  text-align: right;
  color: var(--c-sepia);
}
</style>
