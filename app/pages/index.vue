<template>
  <div class="home">
    <section class="home__hero" aria-labelledby="home-title">
      <h1 id="home-title" class="home__title">
        Quand sortir <em>photographier</em>&nbsp;?
      </h1>
      <p class="home__intro">
        Heures dorées, heures bleues et qualité de la lumière, lieu par lieu, d'après les prévisions de couverture nuageuse.
      </p>
    </section>

    <div class="home__find">
      <SearchForm />
      <LocateButton />
    </div>

    <FavoriteList />

    <ul class="legend" aria-label="Légende de la bande du ciel">
      <li v-for="item in legend" :key="item.label">
        <span class="legend__swatch" :style="{ background: `var(--sky-${item.sky})` }" aria-hidden="true" />
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'La météo des photographes', titleTemplate: 'Golden Hour · %s' })

const legend = [
  { sky: 'night', label: 'nuit' },
  { sky: 'blue', label: 'heure bleue' },
  { sky: 'gold', label: 'heure dorée' },
  { sky: 'day', label: 'jour' }
] as const
</script>

<style scoped lang="scss">
@use '~/assets/scss/breakpoints' as *;

.home {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 40rem;
}

.home__find {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.home__hero {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.home__title {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  line-height: 1.02;
  letter-spacing: -0.01em;

  em {
    color: var(--c-amber);
  }
}

.home__intro {
  font-family: var(--font-display);
  font-size: 1.1875rem;
  line-height: 1.45;

  @include from($bp-md) {
    font-size: 1.375rem;
  }
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding: 0;
  list-style: none;
  font-size: 0.8125rem;
  color: var(--c-sepia);

  li {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}

.legend__swatch {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}
</style>
