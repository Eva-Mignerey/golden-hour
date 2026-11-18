<template>
  <div class="results-page">
    <h1 class="results-page__title">Recherche</h1>
    <SearchForm :initial="q" :error="notFound ? notFoundMessage : ''" />

    <StateMessage v-if="status === 'pending'" tone="loading" title="Recherche en cours…" />

    <StateMessage v-else-if="error" tone="error" title="Recherche impossible">
      {{ errorKind(error) === 'network' ? 'Impossible de joindre le service de recherche. Vérifiez votre connexion.' : 'Le service de recherche ne répond pas correctement pour le moment.' }}
      <template #actions>
        <button type="button" class="btn btn--primary" @click="refresh()">Réessayer</button>
      </template>
    </StateMessage>

    <section v-else-if="places && places.length" aria-labelledby="results-title">
      <h2 id="results-title" class="results-page__count">
        {{ places.length }} lieu{{ places.length > 1 ? 'x' : '' }} pour «&nbsp;{{ q }}&nbsp;»
      </h2>
      <ul class="results">
        <li v-for="item in places" :key="item.id ?? item.name">
          <NuxtLink :to="`/lieu/${placeSlug(item)}`" class="results__link">
            <span class="results__name">{{ item.name }}</span>
            <span class="results__meta">{{ item.subtitle }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const q = computed(() => (typeof route.query.q === 'string' ? route.query.q.trim() : ''))

const { data: places, status, error, refresh } = await usePlaceSearch(q)

const notFound = computed(() => q.value.length >= 2 && status.value === 'success' && (places.value?.length ?? 0) === 0)
const notFoundMessage = computed(() => `Aucun lieu nommé «\u00a0${q.value}\u00a0». Vérifiez l’orthographe ou précisez le pays, par exemple «\u00a0Troyes, France\u00a0».`)

useSeoMeta({
  title: () => (q.value ? `Recherche «\u00a0${q.value}\u00a0»` : 'Recherche'),
  robots: 'noindex'
})
</script>

<style scoped lang="scss">
.results-page {
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 40rem;
}

.results-page__title {
  font-size: 2.5rem;
}

.results-page__count {
  margin-bottom: 8px;
  font-family: var(--font-ui);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--c-sepia);
}

.results {
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--c-line);

  li {
    border-bottom: 1px solid var(--c-line);
  }
}

.results__link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 0;
  color: var(--c-ink);
  text-decoration: none;

  &:hover .results__name {
    color: var(--c-amber);
  }
}

.results__name {
  font-family: var(--font-display);
  font-size: 1.375rem;
}

.results__meta {
  font-size: 0.875rem;
  color: var(--c-sepia);
}
</style>
