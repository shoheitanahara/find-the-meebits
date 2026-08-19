import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { SHORE_FISHING } from '../config'
import { fishLabel, fishScoreRows, ratingLabel, shoreFishingUi } from '../i18n'
import { getFishKind } from '../config'
import { useShoreFishingStore } from '../store'
import {
  PHONE_LAND_OVERLAY_CARD,
  PHONE_LAND_OVERLAY_FRAME,
  PHONE_LAND_OVERLAY_TITLE,
} from '../../ui/phoneLandscape'

export function ShoreFishingPlayPrompt() {
  const phase = useShoreFishingStore((s) => s.phase)
  const startGame = useShoreFishingStore((s) => s.startGame)
  const bestScore = useShoreFishingStore((s) => s.bestScore)
  const t = shoreFishingUi()

  if (phase !== 'idle') return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 overflow-y-auto bg-black/55 backdrop-blur-sm">
      <div className={`flex min-h-full items-start justify-center px-4 pb-6 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.75rem))] sm:items-center sm:py-6 ${PHONE_LAND_OVERLAY_FRAME}`}>
        <section className={`w-full max-w-xl rounded-[2rem] border border-cyan-200/30 bg-[#0c1824]/95 p-5 text-[#e8f4f8] shadow-2xl sm:p-7 ${PHONE_LAND_OVERLAY_CARD}`}>
          <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-cyan-200/80">
            {t.rulesTitle}
          </p>
          <h1 className={`mt-2 text-center font-[family-name:Georgia,Times_New_Roman,serif] text-3xl sm:text-4xl ${PHONE_LAND_OVERLAY_TITLE}`}>
            {t.title}
          </h1>
          <p className="mt-3 text-center text-sm text-white/65 phone-land:hidden">{t.subtitle}</p>
          <p className="mt-2 text-center text-xs leading-relaxed text-white/50 phone-land:hidden">{t.controls}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 phone-land:mt-2 phone-land:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 phone-land:p-2">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cyan-100/75">
                {t.scoreGuideTitle}
              </p>
              <div className="mt-3 grid max-h-48 gap-1 overflow-y-auto pr-1 phone-land:max-h-20">
                {fishScoreRows().map(({ id, color, score, label, rare }) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5"
                  >
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-white/25"
                      style={{ backgroundColor: color }}
                    />
                    <span className="min-w-0 flex-1 text-[0.7rem] font-semibold text-white/75">
                      {label}
                      {rare ? ' ★' : ''}
                    </span>
                    <span className="font-mono text-xs font-black text-amber-100">+{score}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 phone-land:p-2">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cyan-100/75">
                {t.ratingGuideTitle}
              </p>
              <div className="mt-3 grid gap-1.5">
                {SHORE_FISHING.rating.map(({ id, min }) => (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[0.7rem]"
                  >
                    <span className="font-semibold text-white/75">{ratingLabel(id)}</span>
                    <span className="font-mono text-amber-100/80">{min}+</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-xs text-white/45">
                {t.best}: <span className="font-mono text-amber-100">{bestScore}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-2xl border border-cyan-200/40 bg-cyan-400/15 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-cyan-50 transition hover:bg-cyan-400/25 phone-land:mt-3 phone-land:py-2.5"
            onClick={() => {
              void unlockAudioIfNeeded().then(() => playSfx('uiConfirm'))
              startGame()
            }}
          >
            {t.start}
          </button>
        </section>
      </div>
    </div>
  )
}

export function ShoreFishingResult() {
  const phase = useShoreFishingStore((s) => s.phase)
  const score = useShoreFishingStore((s) => s.score)
  const bestScore = useShoreFishingStore((s) => s.bestScore)
  const ratingId = useShoreFishingStore((s) => s.ratingId)
  const catches = useShoreFishingStore((s) => s.catches)
  const replay = useShoreFishingStore((s) => s.replay)
  const exitToIdle = useShoreFishingStore((s) => s.exitToIdle)
  const t = shoreFishingUi()

  if (phase !== 'result') return null

  const tallies = new Map<string, { count: number; score: number; color: string }>()
  for (const c of catches) {
    const fish = getFishKind(c.fishId)
    const prev = tallies.get(c.fishId) ?? { count: 0, score: 0, color: fish.color }
    tallies.set(c.fishId, {
      count: prev.count + 1,
      score: prev.score + c.score,
      color: fish.color,
    })
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 overflow-y-auto bg-black/60 backdrop-blur-sm">
      <div className={`flex min-h-full items-start justify-center px-4 pb-6 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.75rem))] sm:items-center sm:py-6 ${PHONE_LAND_OVERLAY_FRAME}`}>
        <section className={`w-full max-w-md rounded-[2rem] border border-cyan-200/30 bg-[#0c1824]/95 p-6 text-[#e8f4f8] shadow-2xl ${PHONE_LAND_OVERLAY_CARD}`}>
          <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-cyan-200/70">
            {t.resultTitle}
          </p>
          <p className="mt-2 text-center font-[family-name:Georgia,Times_New_Roman,serif] text-3xl phone-land:text-xl">
            {ratingId ? ratingLabel(ratingId) : '—'}
          </p>
          <p className="mt-3 text-center font-mono text-4xl font-black text-amber-100 phone-land:mt-1 phone-land:text-3xl">{score}</p>
          <p className="mt-1 text-center text-xs text-white/45">
            {t.best}: {bestScore}
          </p>

          <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-cyan-100/70">
              {t.sessionTitle}
            </p>
            {tallies.size === 0 ? (
              <p className="mt-3 text-center text-sm text-white/45">{t.emptySession}</p>
            ) : (
              <div className="mt-3 grid max-h-48 gap-1.5 overflow-y-auto phone-land:max-h-24">
                {[...tallies.entries()].map(([id, row]) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-lg border border-white/10 px-2.5 py-1.5 text-[0.75rem]"
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                    <span className="flex-1 font-semibold text-white/80">
                      {fishLabel(id as Parameters<typeof fishLabel>[0])} ×{row.count}
                    </span>
                    <span className="font-mono text-amber-100">{row.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 grid gap-2 phone-land:mt-3">
            <button
              type="button"
              className="w-full rounded-2xl border border-cyan-200/40 bg-cyan-400/15 py-3.5 text-sm font-bold uppercase tracking-[0.18em] text-cyan-50 transition hover:bg-cyan-400/25"
              onClick={() => {
                void unlockAudioIfNeeded().then(() => playSfx('uiConfirm'))
                replay()
              }}
            >
              {t.playAgain}
            </button>
            <button
              type="button"
              className="w-full rounded-2xl border border-white/20 bg-white/5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-white/80 transition hover:bg-white/10"
              onClick={() => {
                void unlockAudioIfNeeded().then(() => playSfx('uiClick'))
                exitToIdle()
              }}
            >
              {t.backToTitle}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
