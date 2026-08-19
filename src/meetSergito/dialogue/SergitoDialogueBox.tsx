import { ui } from '../../i18n/ui'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { TargetPreview } from '../../ui/TargetPreview'
import { PHONE_LAND_DIALOGUE } from '../../ui/phoneLandscape'
import { SERGITO_MEEBIT_ID, SERGITO_NPC_ID } from '../config'
import { advanceSergitoDialogue, closeSergitoDialogue } from './interactWithSergito'

const SERGITO_ROLE = 'MeebCo. CEO'

export function SergitoDialogueBox() {
  const isOpen = useDialogueStore((state) => state.isOpen)
  const activeNpcId = useDialogueStore((state) => state.activeNpcId)
  const lines = useDialogueStore((state) => state.lines)
  const currentIndex = useDialogueStore((state) => state.currentIndex)
  const t = ui()

  if (!isOpen || activeNpcId !== SERGITO_NPC_ID) return null

  const currentLine = lines[currentIndex]
  if (!currentLine) return null

  const isLastLine = currentIndex >= lines.length - 1
  const name = 'Sergito'

  return (
    <div className={`pointer-events-auto absolute inset-x-0 z-[35] mx-auto w-[min(860px,calc(100%-2rem))] bottom-5 max-lg:bottom-auto max-lg:top-[max(6rem,env(safe-area-inset-top))] max-lg:w-[calc(100%-0.75rem)] ${PHONE_LAND_DIALOGUE}`}>
      <div className="rounded-3xl border border-[#d4a060]/35 bg-[#1a140c]/92 px-5 py-4 text-[#f4ead2] shadow-2xl backdrop-blur-md max-lg:px-3.5 max-lg:py-3 sm:px-6 sm:py-5">
        <div className="hidden lg:grid lg:grid-cols-[auto_1fr] lg:gap-4">
          <TargetPreview
            meebitNumber={SERGITO_MEEBIT_ID}
            modelScale={1.1}
            sizeClassName="h-40 w-40 rounded-2xl border border-[#d4a060]/30 bg-[#120e08]"
          />
          <SergitoDialogueContent
            role={SERGITO_ROLE}
            name={name}
            currentLine={currentLine.text}
            currentIndex={currentIndex}
            linesLength={lines.length}
            onClose={closeSergitoDialogue}
            onNext={advanceSergitoDialogue}
            closeLabel={t.close}
            nextLabel={isLastLine ? t.done : t.nextLine}
          />
        </div>
        <div className="lg:hidden">
          <SergitoDialogueContent
            role={SERGITO_ROLE}
            name={name}
            currentLine={currentLine.text}
            currentIndex={currentIndex}
            linesLength={lines.length}
            onClose={closeSergitoDialogue}
            onNext={advanceSergitoDialogue}
            closeLabel={t.close}
            nextLabel={isLastLine ? t.done : t.nextLine}
            compact
          />
        </div>
      </div>
    </div>
  )
}

function SergitoDialogueContent({
  role,
  name,
  currentLine,
  currentIndex,
  linesLength,
  onClose,
  onNext,
  closeLabel,
  nextLabel,
  compact = false,
}: {
  role: string
  name: string
  currentLine: string
  currentIndex: number
  linesLength: number
  onClose: () => void
  onNext: () => void
  closeLabel: string
  nextLabel: string
  compact?: boolean
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold uppercase tracking-[0.25em] text-[#d4a060] ${
              compact ? 'text-[0.6rem]' : 'text-xs'
            }`}
          >
            {role}
          </p>
          <h2 className={`mt-0.5 font-black text-[#f4ead2] ${compact ? 'text-base' : 'text-xl sm:text-2xl'}`}>
            {name}
          </h2>
          <p className={`mt-0.5 font-semibold text-[#b8b2a6] ${compact ? 'text-xs' : 'text-sm'}`}>
            Meebit #{SERGITO_MEEBIT_ID}
          </p>
        </div>
        <button
          type="button"
          className={`shrink-0 rounded-full border border-white/15 bg-white/5 font-semibold text-[#d8c9aa] transition hover:bg-white/10 ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1 text-sm'
          }`}
          onClick={onClose}
        >
          {closeLabel}
        </button>
      </div>

      <p
        className={`leading-relaxed text-[#f1eadc] ${
          compact ? 'mt-2.5 text-sm leading-snug' : 'mt-4 text-base sm:text-lg'
        }`}
      >
        {currentLine}
      </p>

      <div className={`flex items-center justify-between gap-3 ${compact ? 'mt-3' : 'mt-5'}`}>
        <p className="text-xs font-medium text-[#8f897e]">
          {currentIndex + 1} / {linesLength}
        </p>
        <button
          type="button"
          className={`rounded-full border border-[#d4a060]/50 bg-gradient-to-b from-[#c89440] to-[#8a6020] font-bold text-[#fff9e9] transition hover:brightness-110 ${
            compact ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 text-sm'
          }`}
          onClick={onNext}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}
