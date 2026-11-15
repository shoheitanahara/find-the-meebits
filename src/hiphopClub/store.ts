import { create } from 'zustand'
import { recordHiphopVisit } from '../park/dailyRecords'

export type ClubPhase = 'title' | 'playing'

type ClubState = {
  phase: ClubPhase
  audienceIds: number[]
  playbackStarted: boolean
  soundMuted: boolean
  episodeTitle: string | null
  start: (payload: { audienceIds: number[] }) => void
  setSoundMuted: (muted: boolean) => void
  setEpisodeTitle: (title: string | null) => void
}

export const useClubStore = create<ClubState>((set) => ({
  phase: 'title',
  audienceIds: [],
  playbackStarted: false,
  soundMuted: true,
  episodeTitle: null,
  start: ({ audienceIds }) => {
    recordHiphopVisit()
    set({
      phase: 'playing',
      audienceIds,
      playbackStarted: true,
      soundMuted: true,
      episodeTitle: null,
    })
  },
  setSoundMuted: (soundMuted) => set({ soundMuted }),
  setEpisodeTitle: (episodeTitle) =>
    set((state) => (state.episodeTitle === episodeTitle ? state : { episodeTitle })),
}))
