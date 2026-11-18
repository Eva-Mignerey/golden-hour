<template>
  <div class="locate">
    <button type="button" class="btn btn--soft locate__btn" :disabled="state === 'pending'" :aria-describedby="message ? messageId : undefined" @click="go">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--c-amber)" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>
      {{ state === 'pending' ? 'Localisation…' : 'Autour de moi' }}
    </button>
    <div :id="messageId" aria-live="polite">
      <StateMessage v-if="message" tone="error" :title="message.title">
        {{ message.text }}
      </StateMessage>
    </div>
  </div>
</template>

<script setup lang="ts">
const { state, locate } = useGeolocation()
const messageId = useId()

const messages: Partial<Record<GeoState, { title: string, text: string }>> = {
  denied: {
    title: 'Position non partagée',
    text: 'C’est votre choix. Cherchez un lieu par son nom, ou autorisez la localisation dans les réglages du navigateur.'
  },
  unavailable: {
    title: 'Position introuvable',
    text: 'Votre appareil n’a pas réussi à se localiser. Cherchez un lieu par son nom.'
  },
  timeout: {
    title: 'Localisation trop longue',
    text: 'La position met trop de temps à arriver. Réessayez ou cherchez un lieu par son nom.'
  },
  unsupported: {
    title: 'Localisation indisponible',
    text: 'Ce navigateur ne permet pas de partager votre position. Cherchez un lieu par son nom.'
  }
}

const message = computed(() => messages[state.value] ?? null)

async function go(): Promise<void> {
  const coords = await locate()
  if (!coords) return
  await navigateTo({ path: '/position', query: { lat: coords.latitude.toFixed(3), lon: coords.longitude.toFixed(3) } })
}
</script>

<style scoped lang="scss">
.locate {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
</style>
