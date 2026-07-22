import { ui } from '../i18n/ui'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { TargetPreview } from '../ui/TargetPreview'
import { playSfx, unlockAudioIfNeeded } from '../ui/sfx'
import { usePlayerStore } from '../stores/playerStore'
import { getLocale } from '../i18n/locale'
import { advanceParkDialogue, closeParkDialogue } from './interactWithParkNpc'
import { getParkNpcById } from './parkNpcRegistry'
import { useTopStore } from './topStore'

/** パーク専用の会話ボックス（Hunt の DialogueBox と同型、NPC 解決だけパーク用）。 */
export function ParkDialogueBox() {
  const isOpen = useDialogueStore((state) => state.isOpen)
  const activeNpcId = useDialogueStore((state) => state.activeNpcId)
  const lines = useDialogueStore((state) => state.lines)
  const currentIndex = useDialogueStore((state) => state.currentIndex)
  const playerMeebitNumber = useTopStore((state) => state.meebitNumber)
  const setPlayerMeebitNumber = usePlayerStore((state) => state.setMeebitNumber)
  const setTopMeebitNumber = useTopStore((state) => state.setMeebitNumber)
  const t = ui()

  if (!isOpen || !activeNpcId) return null

  const npc = getParkNpcById(activeNpcId)
  const currentLine = lines[currentIndex]
  if (!npc || !currentLine) return null

  const isLastLine = currentIndex >= lines.length - 1
  const isCurrentAvatar = playerMeebitNumber === npc.meebitNumber
  const role = getParkRoleLabel(npc.isFeatured, npc.matched)
  const name = `Meebit #${npc.meebitNumber}`

  const handleUseAvatar = () => {
    if (isCurrentAvatar) return
    void unlockAudioIfNeeded().then(() => playSfx('uiConfirm'))
    // 表示中のアバターは topStore、永続化は playerStore
    setTopMeebitNumber(npc.meebitNumber)
    setPlayerMeebitNumber(npc.meebitNumber)
  }

  return (
    <div className="pointer-events-auto absolute inset-x-0 z-30 mx-auto w-[min(860px,calc(100%-2rem))] bottom-5 max-lg:bottom-auto max-lg:top-[max(6rem,env(safe-area-inset-top))] max-lg:w-[calc(100%-0.75rem)]">
      <div className="rounded-3xl border border-[#d4b46a]/40 bg-[#0c0d18]/92 px-5 py-4 text-[#f4ead2] shadow-2xl backdrop-blur-md max-lg:px-3.5 max-lg:py-3 sm:px-6 sm:py-5">
        <div className="hidden sm:grid sm:grid-cols-[auto_1fr] sm:gap-4">
          <TargetPreview
            meebitNumber={npc.meebitNumber}
            modelScale={1.1}
            sizeClassName="h-40 w-40 rounded-2xl border border-[#d4b46a]/30 bg-[#10111d]"
          />
          <ParkDialogueContent
            role={role}
            name={name}
            meebitNumber={npc.meebitNumber}
            isCurrentAvatar={isCurrentAvatar}
            currentLine={currentLine.text}
            currentIndex={currentIndex}
            linesLength={lines.length}
            onClose={closeParkDialogue}
            onNext={advanceParkDialogue}
            onUseAvatar={handleUseAvatar}
            yourAvatarLabel={t.yourAvatar}
            useAvatarLabel={t.useThisAvatar}
            closeLabel={t.close}
            nextLabel={isLastLine ? t.done : t.nextLine}
          />
        </div>
        <div className="sm:hidden">
          <ParkDialogueContent
            role={role}
            name={name}
            meebitNumber={npc.meebitNumber}
            isCurrentAvatar={isCurrentAvatar}
            currentLine={currentLine.text}
            currentIndex={currentIndex}
            linesLength={lines.length}
            onClose={closeParkDialogue}
            onNext={advanceParkDialogue}
            onUseAvatar={handleUseAvatar}
            yourAvatarLabel={t.yourAvatar}
            useAvatarLabel={t.useThisAvatar}
            closeLabel={t.close}
            nextLabel={isLastLine ? t.done : t.nextLine}
            compact
          />
        </div>
      </div>
    </div>
  )
}

function getParkRoleLabel(isFeatured: boolean, matched: boolean) {
  const ja = getLocale() === 'ja'
  if (isFeatured) return ja ? '本日の主役' : "Today's Star"
  if (matched) return ja ? '共通点ゲスト' : 'Theme Guest'
  return ja ? '来場者' : 'Park Visitor'
}

function ParkDialogueContent({
  role,
  name,
  meebitNumber,
  isCurrentAvatar,
  currentLine,
  currentIndex,
  linesLength,
  onClose,
  onNext,
  onUseAvatar,
  yourAvatarLabel,
  useAvatarLabel,
  closeLabel,
  nextLabel,
  compact = false,
}: {
  role: string
  name: string
  meebitNumber: number
  isCurrentAvatar: boolean
  currentLine: string
  currentIndex: number
  linesLength: number
  onClose: () => void
  onNext: () => void
  onUseAvatar: () => void
  yourAvatarLabel: string
  useAvatarLabel: string
  closeLabel: string
  nextLabel: string
  compact?: boolean
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold uppercase tracking-[0.25em] text-[#caa75b] ${
              compact ? 'text-[0.6rem]' : 'text-xs'
            }`}
          >
            {role}
          </p>
          <h2 className={`mt-0.5 font-black text-[#f4ead2] ${compact ? 'text-base' : 'text-xl sm:text-2xl'}`}>
            {name}
          </h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className={`font-semibold text-[#b8b2a6] ${compact ? 'text-xs' : 'text-sm'}`}>
              Meebit #{meebitNumber}
            </p>
            {isCurrentAvatar ? (
              <span
                className={`rounded-full bg-white/10 px-2 py-0.5 font-semibold uppercase tracking-[0.12em] text-[#d8c9aa] ${
                  compact ? 'text-[0.55rem]' : 'text-[0.6rem]'
                }`}
              >
                {yourAvatarLabel}
              </span>
            ) : (
              <button
                type="button"
                className={`rounded-full border border-[#d4b46a]/40 bg-[#d4b46a]/10 px-2 py-0.5 font-semibold uppercase tracking-[0.12em] text-[#e9cf91] transition hover:bg-[#d4b46a]/20 ${
                  compact ? 'text-[0.55rem]' : 'text-[0.6rem]'
                }`}
                onClick={onUseAvatar}
              >
                {useAvatarLabel}
              </button>
            )}
          </div>
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
          className={`rounded-full border border-[#ead394]/50 bg-gradient-to-b from-[#b18a3f] to-[#7f5d22] font-bold text-[#fff9e9] transition hover:brightness-110 ${
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
