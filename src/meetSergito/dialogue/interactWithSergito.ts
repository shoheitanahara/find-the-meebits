import { getCachedMeebitTraits, loadMeebitTraitsDataset } from '../../data/meebitTraits'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { usePlayerStore } from '../../stores/playerStore'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { SERGITO_NPC_ID } from '../config'
import { useMeetSergitoStore } from '../store'
import { createSergitoDialogue } from './createSergitoDialogue'

export async function openSergitoDialogue() {
  const { bootPhase, canTalkToSergito, talkCount, incrementTalkCount } = useMeetSergitoStore.getState()
  const dialogueState = useDialogueStore.getState()

  if (bootPhase !== 'ready' || !canTalkToSergito || dialogueState.isOpen) return

  await loadMeebitTraitsDataset()
  const meebitId = usePlayerStore.getState().meebitNumber
  const traits = getCachedMeebitTraits(meebitId)
  const lines = createSergitoDialogue({ meebitId, traits, talkCount })

  void unlockAudioIfNeeded().then(() => playSfx('uiConfirm'))
  usePlayerStore.getState().setMovementLocked(true)
  useDialogueStore.getState().openDialogue(SERGITO_NPC_ID, lines)
  incrementTalkCount()
}

export function closeSergitoDialogue() {
  useDialogueStore.getState().closeDialogue()
  usePlayerStore.getState().setMovementLocked(false)
}

export function advanceSergitoDialogue() {
  const dialogue = useDialogueStore.getState()
  if (!dialogue.isOpen) return

  const hasNext = dialogue.nextLine()
  if (hasNext) return

  closeSergitoDialogue()
}

/**
 * パーク同様、会話開始と進行を同一ハンドラで処理する。
 * 最終行で閉じた直後の同じ keydown / キーリピートで再オープンしない。
 */
export function handleSergitoDialogueKeyDown(event: KeyboardEvent) {
  const dialogueState = useDialogueStore.getState()

  if (event.code === 'Escape' && dialogueState.isOpen && dialogueState.activeNpcId === SERGITO_NPC_ID) {
    event.preventDefault()
    closeSergitoDialogue()
    return
  }

  if (dialogueState.isOpen && dialogueState.activeNpcId === SERGITO_NPC_ID) {
    if (event.code === 'Enter' || event.code === 'Space' || event.code === 'KeyE') {
      event.preventDefault()
      if (event.repeat) return
      advanceSergitoDialogue()
    }
    return
  }

  if (event.code === 'KeyE') {
    if (event.repeat) return
    if (!useMeetSergitoStore.getState().canTalkToSergito) return
    event.preventDefault()
    tryInteractWithSergito()
  }
}

export function tryInteractWithSergito() {
  const dialogueState = useDialogueStore.getState()
  if (dialogueState.isOpen) return
  void openSergitoDialogue()
}
