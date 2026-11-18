export type GeoState = 'idle' | 'pending' | 'denied' | 'unavailable' | 'timeout' | 'unsupported'

export function useGeolocation() {
  const state = ref<GeoState>('idle')

  function locate(): Promise<{ latitude: number, longitude: number } | null> {
    if (!import.meta.client || !('geolocation' in navigator)) {
      state.value = 'unsupported'
      return Promise.resolve(null)
    }
    state.value = 'pending'
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          state.value = 'idle'
          resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        },
        (error) => {
          state.value = error.code === error.PERMISSION_DENIED
            ? 'denied'
            : error.code === error.TIMEOUT ? 'timeout' : 'unavailable'
          resolve(null)
        },
        { enableHighAccuracy: false, timeout: 12_000, maximumAge: 10 * 60 * 1000 }
      )
    })
  }

  return { state, locate }
}
