import { useDialogueStore } from '../dialogue/dialogueStore'
import { useNpcStore } from '../stores/npcStore'
import { usePlayerStore } from '../stores/playerStore'
import { getMeebitTalkCount, recordMeebitTalk } from '../systems/save/localStorage'
import { playSfx, unlockAudioIfNeeded } from '../ui/sfx'
import type { DailyThemeTrait } from './dailyFeatured'
import { selectParkDialogueLines } from './parkDialogue'
import { getParkNpcById } from './parkNpcRegistry'
import { useTopStore } from './topStore'

let parkDialogueContext: { featuredId: number; themeTrait: DailyThemeTrait } | null = null

export function setParkDialogueContext(featuredId: number, themeTrait: DailyThemeTrait) {
  parkDialogueContext = { featuredId, themeTrait }
}

export function interactWithNearestParkNpc(): boolean {
  const dialogue = useDialogueStore.getState()
  if (dialogue.isOpen) return false

  const top = useTopStore.getState()
  if (!top.started) return false

  const nearestId = useNpcStore.getState().nearestNpcId
  if (!nearestId) return false

  const npc = getParkNpcById(nearestId)
  if (!npc || !parkDialogueContext) return false

  void unlockAudioIfNeeded()
  playSfx('talk')

  const talkCount = getMeebitTalkCount(npc.meebitNumber)
  const lines = selectParkDialogueLines(
    npc,
    talkCount,
    parkDialogueContext.featuredId,
    parkDialogueContext.themeTrait,
  )

  recordMeebitTalk(npc.meebitNumber, [top.x, 0, top.z])
  usePlayerStore.getState().setMovementLocked(true)
  dialogue.openDialogue(nearestId, lines)
  return true
}

export function closeParkDialogue() {
  useDialogueStore.getState().closeDialogue()
  usePlayerStore.getState().setMovementLocked(false)
}

export function advanceParkDialogue() {
  const dialogue = useDialogueStore.getState()
  if (!dialogue.isOpen) return
  if (!dialogue.nextLine()) {
    closeParkDialogue()
  }
}

/** パーク用キーボード（E で会話 / 会話中は進行）。 */
export function handleParkDialogueKeyDown(event: KeyboardEvent) {
  const dialogue = useDialogueStore.getState()

  if (event.code === 'Escape' && dialogue.isOpen) {
    event.preventDefault()
    closeParkDialogue()
    return
  }

  if (dialogue.isOpen) {
    if (event.code === 'Enter' || event.code === 'KeyE' || event.code === 'Space') {
      event.preventDefault()
      advanceParkDialogue()
    }
    return
  }

  if (event.code === 'KeyE') {
    event.preventDefault()
    interactWithNearestParkNpc()
  }
}
