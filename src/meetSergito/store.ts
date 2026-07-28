import { create } from 'zustand'

export type MeetSergitoBootPhase = 'loading' | 'ready'

type MeetSergitoState = {
  bootPhase: MeetSergitoBootPhase
  playerVrmReady: boolean
  sergitoVrmReady: boolean
  walkersReadyCount: number
  walkersExpected: number
  canTalkToSergito: boolean
  talkCount: number
  setCanTalkToSergito: (canTalk: boolean) => void
  incrementTalkCount: () => void
  resetBoot: (walkersExpected: number) => void
  setPlayerVrmReady: (ready: boolean) => void
  setSergitoVrmReady: (ready: boolean) => void
  setWalkerVrmReady: (index: number) => void
}

const readyWalkerIndices = new Set<number>()

function recomputeBootPhase(state: MeetSergitoState): MeetSergitoBootPhase {
  if (!state.playerVrmReady || !state.sergitoVrmReady) return 'loading'
  if (state.walkersReadyCount < state.walkersExpected) return 'loading'
  return 'ready'
}

export const useMeetSergitoStore = create<MeetSergitoState>((set) => ({
  bootPhase: 'loading',
  playerVrmReady: false,
  sergitoVrmReady: false,
  walkersReadyCount: 0,
  walkersExpected: 0,
  canTalkToSergito: false,
  talkCount: 0,
  setCanTalkToSergito: (canTalkToSergito) => set({ canTalkToSergito }),
  incrementTalkCount: () => set((state) => ({ talkCount: state.talkCount + 1 })),
  resetBoot: (walkersExpected) => {
    readyWalkerIndices.clear()
    set({
      bootPhase: 'loading',
      playerVrmReady: false,
      sergitoVrmReady: false,
      walkersReadyCount: 0,
      walkersExpected,
      canTalkToSergito: false,
    })
  },
  setPlayerVrmReady: (ready) => {
    set((state) => {
      const next = { ...state, playerVrmReady: ready }
      return { playerVrmReady: ready, bootPhase: recomputeBootPhase(next) }
    })
  },
  setSergitoVrmReady: (ready) => {
    set((state) => {
      const next = { ...state, sergitoVrmReady: ready }
      return { sergitoVrmReady: ready, bootPhase: recomputeBootPhase(next) }
    })
  },
  setWalkerVrmReady: (index) => {
    if (readyWalkerIndices.has(index)) return
    readyWalkerIndices.add(index)
    set((state) => {
      const walkersReadyCount = readyWalkerIndices.size
      const next = { ...state, walkersReadyCount }
      return { walkersReadyCount, bootPhase: recomputeBootPhase(next) }
    })
  },
}))

export function isMeetSergitoBootReady() {
  return useMeetSergitoStore.getState().bootPhase === 'ready'
}
