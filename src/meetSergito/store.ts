import { create } from 'zustand'

export type MeetSergitoBootPhase = 'loading' | 'ready'

type MeetSergitoState = {
  bootPhase: MeetSergitoBootPhase
  playerVrmReady: boolean
  sergitoVrmReady: boolean
  walkersReadyCount: number
  walkersExpected: number
  figuresReadyCount: number
  figuresExpected: number
  canTalkToSergito: boolean
  talkCount: number
  setCanTalkToSergito: (canTalk: boolean) => void
  incrementTalkCount: () => void
  resetBoot: (walkersExpected: number, figuresExpected: number) => void
  setPlayerVrmReady: (ready: boolean) => void
  setSergitoVrmReady: (ready: boolean) => void
  setWalkerVrmReady: (index: number) => void
  setFigureVrmReady: (index: number) => void
}

const readyWalkerIndices = new Set<number>()
const readyFigureIndices = new Set<number>()

function recomputeBootPhase(state: MeetSergitoState): MeetSergitoBootPhase {
  if (!state.playerVrmReady || !state.sergitoVrmReady) return 'loading'
  if (state.walkersReadyCount < state.walkersExpected) return 'loading'
  if (state.figuresReadyCount < state.figuresExpected) return 'loading'
  return 'ready'
}

export const useMeetSergitoStore = create<MeetSergitoState>((set) => ({
  bootPhase: 'loading',
  playerVrmReady: false,
  sergitoVrmReady: false,
  walkersReadyCount: 0,
  walkersExpected: 0,
  figuresReadyCount: 0,
  figuresExpected: 0,
  canTalkToSergito: false,
  talkCount: 0,
  setCanTalkToSergito: (canTalkToSergito) => set({ canTalkToSergito }),
  incrementTalkCount: () => set((state) => ({ talkCount: state.talkCount + 1 })),
  resetBoot: (walkersExpected, figuresExpected) => {
    readyWalkerIndices.clear()
    readyFigureIndices.clear()
    set({
      bootPhase: 'loading',
      playerVrmReady: false,
      sergitoVrmReady: false,
      walkersReadyCount: 0,
      walkersExpected,
      figuresReadyCount: 0,
      figuresExpected,
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
  setFigureVrmReady: (index) => {
    if (readyFigureIndices.has(index)) return
    readyFigureIndices.add(index)
    set((state) => {
      const figuresReadyCount = readyFigureIndices.size
      const next = { ...state, figuresReadyCount }
      return { figuresReadyCount, bootPhase: recomputeBootPhase(next) }
    })
  },
}))

export function isMeetSergitoBootReady() {
  return useMeetSergitoStore.getState().bootPhase === 'ready'
}

/** ローディング表示用のざっくり進捗（プレイヤー・Sergito・歩行者・フィギュア） */
export function getMeetSergitoBootProgress(state: MeetSergitoState) {
  const expected = 2 + state.walkersExpected + state.figuresExpected
  const ready =
    (state.playerVrmReady ? 1 : 0) +
    (state.sergitoVrmReady ? 1 : 0) +
    state.walkersReadyCount +
    state.figuresReadyCount
  return { ready, expected: Math.max(1, expected) }
}
