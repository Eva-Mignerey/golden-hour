<template>
  <div class="shell">
    <a class="skip-link" href="#contenu">Aller au contenu</a>
    <div class="sky-strip" aria-hidden="true">
      <span v-for="(band, index) in bands" :key="index" :style="{ flexGrow: band.minutes, background: `var(--sky-${band.name})` }" />
    </div>
    <header class="site-header">
      <NuxtLink to="/" class="wordmark">Golden Hour</NuxtLink>
      <p class="tagline">la météo des photographes</p>
    </header>
    <p v-if="!online" class="offline" role="status">Vous êtes hors ligne : les prévisions affichées peuvent dater.</p>
    <main id="contenu" class="site-main" tabindex="-1">
      <slot />
    </main>
    <footer class="site-footer">
      Prévisions <a href="https://open-meteo.com/" rel="noopener">Open-Meteo</a> · CC BY 4.0
    </footer>
  </div>
</template>

<script setup lang="ts">
const online = useOnline()

type SkyName = 'night' | 'blue' | 'gold' | 'day' | 'sunset' | 'dusk'

interface Band {
  name: SkyName
  minutes: number
}

const bands: Band[] = [
  { name: 'night', minutes: 440 },
  { name: 'blue', minutes: 25 },
  { name: 'gold', minutes: 55 },
  { name: 'day', minutes: 450 },
  { name: 'sunset', minutes: 60 },
  { name: 'dusk', minutes: 25 },
  { name: 'night', minutes: 385 }
]
</script>

<style scoped lang="scss">
@use '~/assets/scss/breakpoints' as *;

.shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.sky-strip {
  display: flex;
  height: 10px;

  span {
    flex-basis: 0;
  }
}

.site-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 20px var(--gutter) 0;
}

.wordmark {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 1.375rem;
  color: var(--c-ink);
  text-decoration: none;

  &:hover {
    color: var(--c-amber);
  }
}

.tagline {
  font-size: 0.8125rem;
  color: var(--c-sepia);
}

.offline {
  width: calc(100% - var(--gutter) * 2);
  max-width: calc(var(--max-width) - var(--gutter) * 2);
  margin: 16px auto 0;
  padding: 10px 14px;
  border-radius: var(--radius);
  background: var(--c-ink);
  color: var(--c-paper);
  font-size: 0.875rem;
}

.site-main {
  flex: 1;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 40px var(--gutter);

  &:focus {
    outline: none;
  }

  @include from($bp-md) {
    padding-block: 56px;
  }
}

.site-footer {
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--gutter) 20px;
  font-size: 0.8125rem;
  color: var(--c-sepia);
}
</style>
