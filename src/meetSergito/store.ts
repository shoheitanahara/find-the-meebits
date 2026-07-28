import { create } from 'zustand'

type MeetSergitoState = {
  canTalkToSergito: boolean
  talkCount: number
  setCanTalkToSergito: (canTalk: boolean) => void
  incrementTalkCount: () => void
}

export const useMeetSergitoStore = create<MeetSergitoState>((set) => ({
  canTalkToSergito: false,
  talkCount: 0,
  setCanTalkToSergito: (canTalkToSergito) => set({ canTalkToSergito }),
  incrementTalkCount: () => set((state) => ({ talkCount: state.talkCount + 1 })),
}))
