<template>
  <NuxtLayout>
    <section class="error-page" aria-labelledby="error-title">
      <p class="error-page__code">{{ error.statusCode }}</p>
      <h1 id="error-title" class="error-page__title">{{ title }}</h1>
      <p class="error-page__text">{{ text }}</p>
      <div class="error-page__actions">
        <button type="button" class="btn btn--primary" @click="handleError">Retour à l’accueil</button>
      </div>
    </section>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)
const title = computed(() => (isNotFound.value ? 'Ce lieu n’existe pas ici' : 'Quelque chose s’est mal passé'))
const text = computed(() => (isNotFound.value
  ? 'Le lien est peut-être incomplet. Cherchez le lieu par son nom depuis l’accueil.'
  : 'Réessayez dans un instant. Si le problème continue, le service météo est peut-être indisponible.'))

useHead({ title: title.value })

function handleError(): void {
  clearError({ redirect: '/' })
}
</script>

<style scoped lang="scss">
.error-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 36rem;
}

.error-page__code {
  font-family: var(--font-display);
  font-size: 6rem;
  line-height: 0.85;
  color: var(--c-amber);
}

.error-page__title {
  font-style: italic;
  font-size: 2.25rem;
}

.error-page__text {
  font-size: 1.0625rem;
}

.error-page__actions {
  margin-top: 8px;
}
</style>
