import { useNpcStore } from '../stores/npcStore'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { getNpcById } from '../npc/npcData'

export function InteractionPrompt() {
  const nearestNpcId = useNpcStore((state) => state.nearestNpcId)
  const isDialogueOpen = useDialogueStore((state) => state.isOpen)

  if (!nearestNpcId || isDialogueOpen) {
    return null
  }

  const npc = getNpcById(nearestNpcId)
  if (!npc) {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-20 flex justify-center">
      <div className="rounded-full border border-white/60 bg-slate-900/80 px-5 py-2 text-sm font-bold text-white shadow-xl backdrop-blur-md">
        Press E to inspect this Meebit
      </div>
    </div>
  )
}
