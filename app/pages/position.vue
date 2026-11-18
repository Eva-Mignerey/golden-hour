<template>
  <div>
    <StateMessage v-if="!place" tone="error" title="Position invalide">
      Les coordonnées de ce lien ne sont pas valides.
      <template #actions>
        <NuxtLink to="/" class="btn btn--primary">Chercher un lieu</NuxtLink>
      </template>
    </StateMessage>
    <LocationView
      v-else
      v-model:day="day"
      :place="place"
      :forecast="forecast ?? null"
      :pending="status === 'pending'"
      :error-kind="error ? errorKind(error) : null"
      @retry="refresh()"
    />
  </div>
</template>

<script setup lang="ts">
import type { Place } from '~/types/light'

const route = useRoute()

function readCoord(value: unknown, limit: number): number | null {
  const n = typeof value === 'string' ? Number(value) : NaN
  return Number.isFinite(n) && Math.abs(n) <= limit ? roundCoord(n) : null
}

const place = computed<Place | null>(() => {
  const latitude = readCoord(route.query.lat, 90)
  const longitude = readCoord(route.query.lon, 180)
  if (latitude === null || longitude === null) return null
  return { id: null, name: 'Votre position', subtitle: formatCoords(latitude, longitude), latitude, longitude }
})

const coords = computed(() => (place.value ? { latitude: place.value.latitude, longitude: place.value.longitude } : null))
const { data: forecast, status, error, refresh } = await useForecast(coords)

const day = ref(0)

useSeoMeta({
  title: 'Autour de moi',
  robots: 'noindex'
})
</script>
