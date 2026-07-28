import { getCachedMeebitTraits, loadMeebitTraitsDataset } from '../../data/meebitTraits'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { usePlayerStore } from '../../stores/playerStore'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { SERGITO_NPC_ID } from '../config'
import { useMeetSergitoStore } from '../store'
import { createSergitoDialogue } from './createSergitoDialogue'

export async function openSergitoDialogue() {
  const { canTalkToSergito, talkCount, incrementTalkCount } = useMeetSergitoStore.getState()
  const dialogueState = useDialogueStore.getState()

  if (!canTalkToSergito || dialogueState.isOpen) return

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

export function handleSergitoDialogueKeyDown(event: KeyboardEvent) {
  const dialogueState = useDialogueStore.getState()
  if (!dialogueState.isOpen || dialogueState.activeNpcId !== SERGITO_NPC_ID) return

  if (event.code === 'Escape') {
    event.preventDefault()
    closeSergitoDialogue()
    return
  }

  if (event.code === 'Enter' || event.code === 'Space' || event.code === 'KeyE') {
    event.preventDefault()
    advanceSergitoDialogue()
  }
}

export function tryInteractWithSergito() {
  const dialogueState = useDialogueStore.getState()
  if (dialogueState.isOpen) return
  void openSergitoDialogue()
}
