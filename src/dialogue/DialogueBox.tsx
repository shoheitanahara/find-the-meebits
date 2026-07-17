import { getNpcById } from '../npc/npcData'
import { advanceDialogue } from './advanceDialogue'
import { ui } from '../i18n/ui'
import { useGameStore } from '../stores/gameStore'
import { usePlayerStore } from '../stores/playerStore'
import { TargetPreview } from '../ui/TargetPreview'
import { playSfx, unlockAudioIfNeeded } from '../ui/sfx'
import { useDialogueStore } from './dialogueStore'

export function DialogueBox() {
  const isOpen = useDialogueStore((state) => state.isOpen)
  const activeNpcId = useDialogueStore((state) => state.activeNpcId)
  const lines = useDialogueStore((state) => state.lines)
  const currentIndex = useDialogueStore((state) => state.currentIndex)
  const closeDialogue = useDialogueStore((state) => state.closeDialogue)
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
    const foundNpcId = activeNpcId
    const completionAction = closeDialogue()

    if (completionAction === 'clearGame' && foundNpcId) {
      clearGame(foundNpcId)
      return
    }

    setMovementLocked(false)
  }

  const handleNext = () => {
    advanceDialogue()
  }

  return (
    <div className="pointer-events-auto absolute inset-x-0 z-30 mx-auto w-[min(860px,calc(100%-2rem))] bottom-5 max-lg:bottom-auto max-lg:top-[max(6rem,env(safe-area-inset-top))] max-lg:w-[calc(100%-0.75rem)]">
      <div className="rounded-3xl border border-white/60 bg-white/90 px-5 py-4 shadow-2xl shadow-sky-900/15 backdrop-blur-md max-lg:px-3.5 max-lg:py-3 sm:px-6 sm:py-5">
        <div className="hidden sm:grid sm:grid-cols-[auto_1fr] sm:gap-4">
          <div>
            <TargetPreview
              meebitNumber={npc.meebitNumber}
              modelScale={1.1}
              sizeClassName="h-40 w-40"
            />
          </div>
          <DialogueContent
            npc={npc}
            currentLine={currentLine}
            currentIndex={currentIndex}
            linesLength={lines.length}
            isLastLine={isLastLine}
            onClose={handleClose}
            onNext={handleNext}
          />
        </div>

        <div className="sm:hidden">
          <DialogueContent
            npc={npc}
            currentLine={currentLine}
            currentIndex={currentIndex}
            linesLength={lines.length}
            isLastLine={isLastLine}
            onClose={handleClose}
            onNext={handleNext}
            compact
          />
        </div>
      </div>
    </div>
  )
}

type DialogueContentProps = {
  npc: NonNullable<ReturnType<typeof getNpcById>>
  currentLine: { text: string; category: string }
  currentIndex: number
  linesLength: number
  isLastLine: boolean
  onClose: () => void
  onNext: () => void
  compact?: boolean
}

function DialogueContent({
  npc,
  currentLine,
  currentIndex,
  linesLength,
  isLastLine,
  onClose,
  onNext,
  compact = false,
}: DialogueContentProps) {
  const playerMeebitNumber = usePlayerStore((state) => state.meebitNumber)
  const setMeebitNumber = usePlayerStore((state) => state.setMeebitNumber)
  const isCurrentAvatar = playerMeebitNumber === npc.meebitNumber
  const t = ui()

  const handleUseAvatar = () => {
    if (isCurrentAvatar) {
      return
    }

    unlockAudioIfNeeded()
    playSfx('uiConfirm')
    setMeebitNumber(npc.meebitNumber)
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`font-semibold uppercase tracking-[0.25em] text-neutral-500 ${
              compact ? 'text-[0.6rem]' : 'text-xs'
            }`}
          >
            {npc.role}
          </p>
          <h2 className={`mt-0.5 font-black text-slate-950 ${compact ? 'text-base' : 'text-xl sm:text-2xl'}`}>
            {npc.name}
          </h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className={`font-semibold text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>
              Meebit #{npc.meebitNumber}
            </p>
            {isCurrentAvatar ? (
              <span
                className={`rounded-full bg-slate-100 px-2 py-0.5 font-semibold uppercase tracking-[0.12em] text-slate-500 ${
                  compact ? 'text-[0.55rem]' : 'text-[0.6rem]'
                }`}
              >
                {t.yourAvatar}
              </span>
            ) : (
              <button
                type="button"
                className={`rounded-full border border-slate-300 bg-white px-2 py-0.5 font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-slate-950 hover:text-slate-950 ${
                  compact ? 'text-[0.55rem]' : 'text-[0.6rem]'
                }`}
                onClick={handleUseAvatar}
              >
                {t.useThisAvatar}
              </button>
            )}
          </div>
        </div>
        <button
          type="button"
          className={`shrink-0 rounded-full border border-slate-200 bg-white font-semibold text-slate-600 transition hover:bg-slate-50 ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1 text-sm'
          }`}
          onClick={onClose}
        >
          {t.close}
        </button>
      </div>

      {currentLine.category === 'hint' ? (
        <div className={compact ? 'mt-2.5' : 'mt-4'}>
          <p
            className={`font-semibold uppercase tracking-[0.2em] text-amber-700 ${
              compact ? 'text-[0.6rem]' : 'text-xs'
            }`}
          >
            {t.hint}
          </p>
          <p
            className={`mt-1.5 font-black leading-relaxed text-neutral-950 ${
              compact ? 'text-sm leading-snug' : 'text-base sm:text-lg'
            }`}
          >
            {currentLine.text}
          </p>
        </div>
      ) : (
        <p
          className={`leading-relaxed text-slate-800 ${
            compact ? 'mt-2.5 text-sm leading-snug' : 'mt-4 text-base sm:text-lg'
          }`}
        >
          {currentLine.text}
        </p>
      )}

      <div className={`flex items-center justify-between gap-3 ${compact ? 'mt-3' : 'mt-5'}`}>
        <p className="text-xs font-medium text-slate-500">
          {currentIndex + 1} / {linesLength}
        </p>
        <button
          type="button"
          className={`rounded-full bg-neutral-950 font-bold text-white transition hover:bg-neutral-700 ${
            compact ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm max-lg:px-6 max-lg:py-3'
          }`}
          onClick={onNext}
        >
          {isLastLine ? t.done : t.nextLine}
        </button>
      </div>
    </div>
  )
}
