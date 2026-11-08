import { create } from 'zustand'
import { recordCinemaVisit } from '../park/dailyRecords'

export type CinemaPhase = 'title' | 'playing'

type CinemaState = {
  phase: CinemaPhase
  audienceIds: number[]
  emptySeatIndices: number[]
  playerSeatIndex: number | null
  nearestEmptySeatIndex: number | null
  /** 入場後にスクリーン再生を開始 */
  playbackStarted: boolean
  /** 自動再生は mute 必須。UI で解除する */
  soundMuted: boolean
  start: (payload: { audienceIds: number[]; emptySeatIndices: number[] }) => void
  setSoundMuted: (muted: boolean) => void
  setNearestEmptySeatIndex: (seatIndex: number | null) => void
  sitAtSeat: (seatIndex: number) => void
  standUp: () => void
}

export const useCinemaStore = create<CinemaState>((set, get) => ({
  phase: 'title',
  audienceIds: [],
  emptySeatIndices: [],
  playerSeatIndex: null,
  nearestEmptySeatIndex: null,
  playbackStarted: false,
  soundMuted: true,
  start: ({ audienceIds, emptySeatIndices }) => {
    recordCinemaVisit()
    set({
      phase: 'playing',
      audienceIds,
      emptySeatIndices,
      playerSeatIndex: null,
      nearestEmptySeatIndex: null,
      playbackStarted: true,
      soundMuted: true,
    })
  },
  setSoundMuted: (soundMuted) => set({ soundMuted }),
  setNearestEmptySeatIndex: (nearestEmptySeatIndex) =>
    set((state) =>
      state.nearestEmptySeatIndex === nearestEmptySeatIndex ? state : { nearestEmptySeatIndex },
    ),
  sitAtSeat: (seatIndex) => {
    const { emptySeatIndices, playerSeatIndex } = get()
    if (playerSeatIndex !== null) return
    if (!emptySeatIndices.includes(seatIndex)) return
    set({ playerSeatIndex: seatIndex, nearestEmptySeatIndex: null })
  },
  standUp: () => set({ playerSeatIndex: null }),
}))
