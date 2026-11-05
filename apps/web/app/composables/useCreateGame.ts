import type { Color } from '~/types/game'
import { onScopeDispose, ref } from 'vue'

export type CreateGameStatus = 'idle' | 'creating' | 'error'

export interface NewGameSettings {
  timeControl?: string
  colour: Color | 'random'
}

const MOCK_DELAY_MS = 800

export function useCreateGame() {
  const route = useRoute()
  const status = ref<CreateGameStatus>('idle')
  let timer: ReturnType<typeof setTimeout> | undefined

  onScopeDispose(() => clearTimeout(timer))

  function wait(ms: number) {
    return new Promise<void>((resolve) => {
      timer = setTimeout(resolve, ms)
    })
  }

  async function create(settings: NewGameSettings) {
    if (!settings.timeControl || status.value === 'creating')
      return
    status.value = 'creating'
    const shouldFail = route.query.mock === 'fail'
    await wait(MOCK_DELAY_MS)
    if (shouldFail) {
      status.value = 'error'
      return
    }
    try {
      await navigateTo('/game/demo')
    }
    catch {
      status.value = 'error'
    }
  }

  return { status, create }
}
