<template>
  <div>
    <StateMessage v-if="placeError" tone="error" title="Lieu indisponible">
      Impossible de charger ce lieu pour le moment. Vérifiez votre connexion.
      <template #actions>
        <button type="button" class="btn btn--primary" @click="refreshPlace()">Réessayer</button>
      </template>
    </StateMessage>
    <LocationView
      v-else-if="place"
      v-model:day="day"
      :place="place"
      :forecast="forecast ?? null"
      :pending="forecastStatus === 'pending'"
      :error-kind="forecastError ? errorKind(forecastError) : null"
      @retry="refreshForecast()"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const placeId = computed(() => parsePlaceId(String(route.params.slug)))

if (placeId.value === null) {
  throw createError({ statusCode: 404, statusMessage: 'Lieu introuvable', fatal: true })
}

const { data: place, error: rawPlaceError, refresh: refreshPlace } = await usePlace(placeId)

if (rawPlaceError.value && errorKind(rawPlaceError.value) === 'not-found') {
  throw createError({ statusCode: 404, statusMessage: 'Lieu introuvable', fatal: true })
}

const placeError = computed(() => (rawPlaceError.value && errorKind(rawPlaceError.value) !== 'not-found' ? rawPlaceError.value : null))

if (place.value) {
  const canonical = placeSlug(place.value)
  if (canonical !== route.params.slug) {
    await navigateTo({ path: `/lieu/${canonical}`, query: route.query }, { redirectCode: 301, replace: true })
  }
}

const coords = computed(() => (place.value ? { latitude: place.value.latitude, longitude: place.value.longitude } : null))
const { data: forecast, status: forecastStatus, error: forecastError, refresh: refreshForecast } = await useForecast(coords)

const day = ref(0)
watch(placeId, () => {
  day.value = 0
})

const best = computed(() => forecast.value?.days[0]?.best ?? null)

useSeoMeta({
  title: () => place.value?.name ?? 'Lieu',
  description: () => {
    if (!place.value) return 'Heures dorées et qualité de la lumière.'
    const b = best.value
    return b
      ? `${place.value.name} : score lumière ${b.score}/100 aujourd’hui. Heures dorées, heures bleues et nuages heure par heure.`
      : `${place.value.name} : heures dorées, heures bleues et nuages heure par heure.`
  },
  ogTitle: () => (place.value ? `${place.value.name} · Golden Hour` : 'Golden Hour')
})
</script>
