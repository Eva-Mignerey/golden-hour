export default defineNuxtPlugin((nuxtApp) => {
  const { favorites, ready } = useFavorites()

  nuxtApp.hook('app:suspense:resolve', () => {
    if (ready.value) return
    favorites.value = readStoredFavorites()
    ready.value = true
  })

  window.addEventListener('storage', (event) => {
    if (event.key === 'golden-hour:favorites') favorites.value = readStoredFavorites()
  })
})
