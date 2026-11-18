<template>
  <form class="search" role="search" :action="action" method="get" @submit.prevent="submit">
    <label :for="inputId" class="search__label" :class="{ 'sr-only': hideLabel }">Chercher un lieu</label>
    <div class="search__row">
      <input
        :id="inputId"
        v-model="query"
        class="search__input"
        :class="{ 'is-invalid': !!error }"
        type="search"
        name="q"
        autocomplete="off"
        enterkeyhint="search"
        placeholder="Troyes, Étretat, Lac d'Orient"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        required
        minlength="2"
      >
      <button type="submit" class="btn btn--primary btn--icon search__submit" aria-label="Rechercher">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
      </button>
    </div>
    <p v-if="error" :id="errorId" class="search__error">{{ error }}</p>
    <p v-else-if="hint" :id="hintId" class="search__hint">{{ hint }}</p>
  </form>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  initial?: string
  error?: string
  hint?: string
  hideLabel?: boolean
}>(), {
  initial: '',
  error: '',
  hint: '',
  hideLabel: false
})

const action = useRouter().resolve('/recherche').href
const inputId = useId()
const errorId = `${inputId}-error`
const hintId = `${inputId}-hint`
const query = ref(props.initial)

watch(() => props.initial, (value) => {
  query.value = value
})

const describedBy = computed(() => (props.error ? errorId : props.hint ? hintId : undefined))

function submit(): void {
  const q = query.value.trim()
  if (q.length < 2) return
  navigateTo({ path: '/recherche', query: { q } })
}
</script>

<style scoped lang="scss">
.search {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search__label {
  font-size: 0.875rem;
  font-weight: 500;
}

.search__row {
  display: flex;
  gap: 8px;
}

.search__input {
  flex: 1;
  min-width: 0;
  height: 48px;
  padding: 0 14px;
  border: 1.5px solid var(--c-ink);
  border-radius: var(--radius);
  background: var(--c-card);
  font-size: 1rem;

  &::placeholder {
    color: var(--c-sepia);
  }

  &.is-invalid {
    border-color: var(--c-error);
  }
}

.search__submit {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
}

.search__error {
  font-size: 0.9375rem;
  line-height: 1.45;
  color: var(--c-error);
}

.search__hint {
  font-size: 0.875rem;
  color: var(--c-sepia);
}
</style>
