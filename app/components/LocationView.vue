<template>
  <article class="location">
    <header class="location__head">
      <div class="location__names">
        <h1 class="location__title">{{ place.name }}</h1>
        <p class="location__subtitle">{{ place.subtitle }}</p>
      </div>
      <slot name="actions" />
    </header>

    <StateMessage v-if="pending && !forecast" tone="loading" :title="`On regarde le ciel au-dessus de ${place.name}…`" />

    <StateMessage v-else-if="errorKind && !forecast" tone="error" title="Prévisions indisponibles">
      {{ errorKind === 'network' ? 'Impossible de joindre le service météo. Vérifiez votre connexion.' : 'Le service météo ne répond pas correctement pour le moment.' }}
      <template #actions>
        <button type="button" class="btn btn--primary" @click="emit('retry')">Réessayer</button>
      </template>
    </StateMessage>

    <template v-else-if="forecast && day">
      <DayTabs v-model="selected" :days="forecast.days" :panel-id="panelId" />

      <div :id="panelId" role="tabpanel" :aria-labelledby="`tab-${day.date}`" class="location__panel">
        <SkyBand
          class="location__sky"
          :segments="day.segments"
          :start="day.start"
          :end="day.end"
          :timezone="forecast.timezone"
          :now="now"
          :label="skyLabel"
          size="lg"
          axis
        />

        <div class="location__columns">
          <div class="location__col">
            <LightScore :best="day.best" :sun="day.sun" :timezone="forecast.timezone" :is-today="isToday" />
            <ScoreExplain :slot="day.best" :timezone="forecast.timezone" />
          </div>
          <div class="location__col location__col--wide">
            <DayTimes :sun="day.sun" :timezone="forecast.timezone" :best="day.best" />
            <HourlyChart :slots="day.slots" :sun="day.sun" :timezone="forecast.timezone" />
            <NextDays :days="forecast.days" :selected="selected" :timezone="forecast.timezone" @select="selectDay" />
          </div>
        </div>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import type { LocationForecast, Place } from '~/types/light'
import type { ApiErrorKind } from '~/utils/api'

const props = defineProps<{
  place: Place
  forecast: LocationForecast | null
  pending: boolean
  errorKind: ApiErrorKind | null
}>()

const emit = defineEmits<{ retry: [] }>()

const selected = defineModel<number>('day', { default: 0 })
const panelId = useId()
const now = ref<number | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  now.value = Date.now()
  timer = setInterval(() => {
    now.value = Date.now()
  }, 60_000)
})

onBeforeUnmount(() => clearInterval(timer))

const day = computed(() => props.forecast?.days[selected.value] ?? props.forecast?.days[0] ?? null)

const isToday = computed(() => selected.value === 0)

function selectDay(index: number): void {
  selected.value = index
  const date = props.forecast?.days[index]?.date
  nextTick(() => {
    if (date) document.getElementById(`tab-${date}`)?.focus()
  })
}

const skyLabel = computed(() => {
  const d = day.value
  const tz = props.forecast?.timezone
  if (!d || !tz) return ''
  const parts = [`La journée du ${formatDayLong(d.date)}`]
  if (d.sun.goldMorning) parts.push(`heure dorée de ${spokenTime(d.sun.goldMorning.start, tz)} à ${spokenTime(d.sun.goldMorning.end, tz)}`)
  if (d.sun.goldEvening) parts.push(`puis de ${spokenTime(d.sun.goldEvening.start, tz)} à ${spokenTime(d.sun.goldEvening.end, tz)}`)
  if (d.sun.blueEvening) parts.push(`heure bleue du soir jusqu’à ${spokenTime(d.sun.blueEvening.end, tz)}`)
  return `${parts.join(', ')}.`
})
</script>

<style scoped lang="scss">
@use '~/assets/scss/breakpoints' as *;

.location {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.location__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.location__names {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.location__title {
  font-style: italic;
  font-size: clamp(3rem, 9vw, 4.5rem);
  line-height: 0.95;
  overflow-wrap: anywhere;
}

.location__subtitle {
  font-size: 0.875rem;
  color: var(--c-sepia);
}

.location__panel {
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.location__sky {
  margin-top: 20px;
}

.location__columns {
  display: flex;
  flex-wrap: wrap;
  gap: 36px 48px;
}

.location__col {
  display: flex;
  flex: 1 1 340px;
  flex-direction: column;
  gap: 32px;
  min-width: 0;

  &--wide {
    flex: 999 1 520px;
  }
}
</style>
