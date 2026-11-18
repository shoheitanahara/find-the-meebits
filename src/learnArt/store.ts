import { create } from 'zustand'
import { recordLearnArtVisit } from '../park/dailyRecords'

export type LearnArtPhase = 'title' | 'playing'

type LearnArtState = {
  phase: LearnArtPhase
  audienceIds: number[]
  emptySeatIndices: number[]
  playerSeatIndex: number | null
  nearestEmptySeatIndex: number | null
  /** 入場後にスクリーン再生を開始 */
  playbackStarted: boolean
  /** 自動再生は mute 必須。UI で解除する */
  soundMuted: boolean
  /** 上映中の YouTube 動画タイトル（未取得は null） */
  episodeTitle: string | null
  start: (payload: { audienceIds: number[]; emptySeatIndices: number[] }) => void
  setSoundMuted: (muted: boolean) => void
  setEpisodeTitle: (title: string | null) => void
  setNearestEmptySeatIndex: (seatIndex: number | null) => void
  sitAtSeat: (seatIndex: number) => void
  standUp: () => void
}

export const useLearnArtStore = create<LearnArtState>((set, get) => ({
  phase: 'title',
  audienceIds: [],
  emptySeatIndices: [],
  playerSeatIndex: null,
  nearestEmptySeatIndex: null,
  playbackStarted: false,
  soundMuted: true,
  episodeTitle: null,
  start: ({ audienceIds, emptySeatIndices }) => {
    recordLearnArtVisit()
    set({
      phase: 'playing',
      audienceIds,
      emptySeatIndices,
      playerSeatIndex: null,
      nearestEmptySeatIndex: null,
      playbackStarted: true,
      soundMuted: true,
      episodeTitle: null,
    })
  },
  setSoundMuted: (soundMuted) => set({ soundMuted }),
  setEpisodeTitle: (episodeTitle) =>
    set((state) => (state.episodeTitle === episodeTitle ? state : { episodeTitle })),
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
