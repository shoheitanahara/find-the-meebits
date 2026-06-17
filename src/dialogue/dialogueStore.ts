import { create } from 'zustand'
import type { DialogueLine } from '../npc/npcTypes'

export type DialogueCompletionAction = 'clearGame'

type DialogueState = {
  isOpen: boolean
  activeNpcId: string | null
  lines: DialogueLine[]
  currentIndex: number
  completionAction: DialogueCompletionAction | null
  openDialogue: (
    npcId: string,
    lines: DialogueLine[],
    completionAction?: DialogueCompletionAction,
  ) => void
  nextLine: () => boolean
  closeDialogue: () => DialogueCompletionAction | null
}

export const useDialogueStore = create<DialogueState>((set, get) => ({
  isOpen: false,
  activeNpcId: null,
  lines: [],
  currentIndex: 0,
  completionAction: null,
  openDialogue: (npcId, lines, completionAction = undefined) =>
    set({
      isOpen: true,
      activeNpcId: npcId,
      lines,
      currentIndex: 0,
      completionAction: completionAction ?? null,
    }),
  nextLine: () => {
    const { currentIndex, lines } = get()

    if (currentIndex >= lines.length - 1) {
      return false
    }

    set({ currentIndex: currentIndex + 1 })
    return true
  },
  closeDialogue: () => {
    const { completionAction } = get()

    set({
      isOpen: false,
      activeNpcId: null,
      lines: [],
      currentIndex: 0,
      completionAction: null,
    })

    return completionAction
  },
}))
