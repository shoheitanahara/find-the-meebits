import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { TargetPreview } from '../ui/TargetPreview'
import { useDialogueStore } from './dialogueStore'

export function DialogueBox() {
  const isOpen = useDialogueStore((state) => state.isOpen)
  const activeNpcId = useDialogueStore((state) => state.activeNpcId)
  const lines = useDialogueStore((state) => state.lines)
  const currentIndex = useDialogueStore((state) => state.currentIndex)
  const closeDialogue = useDialogueStore((state) => state.closeDialogue)
  const nextLine = useDialogueStore((state) => state.nextLine)
  const setMovementLocked = usePlayerStore((state) => state.setMovementLocked)
  const clearGame = useGameStore((state) => state.clearGame)

  if (!isOpen || !activeNpcId) {
    return null
  }

  const npc = getNpcById(activeNpcId)
  const currentLine = lines[currentIndex]
  const isLastLine = currentIndex >= lines.length - 1

  if (!npc || !currentLine) {
    return null
  }

  const handleClose = () => {
    const completionAction = closeDialogue()

    if (completionAction === 'clearGame') {
      clearGame()
      return
    }

    setMovementLocked(false)
  }

  const handleNext = () => {
    const hasNext = nextLine()
    if (!hasNext) {
      handleClose()
    }
  }

  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-5 z-30 mx-auto w-[min(860px,calc(100%-2rem))] max-md:bottom-[max(7.5rem,env(safe-area-inset-bottom))] max-md:w-[calc(100%-1rem)]">
      <div className="grid gap-4 rounded-3xl border border-white/60 bg-white/90 px-5 py-4 shadow-2xl shadow-sky-900/15 backdrop-blur-md max-md:gap-3 max-md:px-4 max-md:py-3 sm:grid-cols-[auto_1fr] sm:px-6 sm:py-5">
        <div className="mx-auto sm:mx-0">
          <TargetPreview
            meebitNumber={npc.meebitNumber}
            modelScale={1.1}
            sizeClassName="h-40 w-40 max-md:h-28 max-md:w-28"
          />
        </div>

        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-neutral-500">
                {npc.role}
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">{npc.name}</h2>
              <p className="text-sm font-semibold text-slate-500">Meebit #{npc.meebitNumber}</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              onClick={handleClose}
            >
              Close
            </button>
          </div>

          <p className="mt-4 text-base leading-relaxed text-slate-800 sm:text-lg">
            {currentLine.text}
          </p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-slate-500">
              {currentIndex + 1} / {lines.length}
            </p>
            <button
              type="button"
              className="rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-neutral-700 max-md:px-6 max-md:py-3"
              onClick={handleNext}
            >
              {isLastLine ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
