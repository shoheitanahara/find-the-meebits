import { isTouchUiMode } from '../../game/perfConfig'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { getLocale } from '../../i18n/locale'
import { STARLIGHT_RUSH } from '../config'
import { STARLIGHT_SCORE_ROWS, starlightRushUi } from '../i18n'
import { useStarlightRushStore } from '../store'

function requestAimPointerLock() {
  if (isTouchUiMode()) return
  const canvas = document.getElementById(STARLIGHT_RUSH.canvasElementId)
  if (!(canvas instanceof HTMLCanvasElement)) return
  if (document.pointerLockElement === canvas) return
  void canvas.requestPointerLock()
}

function returnToAstro() {
  const locale = getLocale()
  const path = locale === 'ja' ? '/jp' : '/'
  window.location.assign(`${path}?from=starlight`)
}

export function StarlightRushPlayPrompt() {
  const phase = useStarlightRushStore((state) => state.phase)
  const startGame = useStarlightRushStore((state) => state.startGame)
  const bestScore = useStarlightRushStore((state) => state.bestScore)
  const t = starlightRushUi()

  if (phase !== 'idle') return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 overflow-y-auto bg-black/55 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center px-4 py-4">
        <section className="w-full max-w-xl rounded-[2rem] border border-[#5ce0ff]/35 bg-[#0b1220]/95 p-5 text-[#f4ead2] shadow-2xl sm:p-7">
          <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#8fdfff]/80">
            {t.rulesTitle}
          </p>
          <h1 className="mt-2 text-center font-[family-name:Georgia,Times_New_Roman,serif] text-3xl sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-3 text-center text-sm text-white/65">{t.subtitle}</p>
          <p className="mt-1 text-center text-xs leading-relaxed text-[#8fdfff]/75">{t.storyLine}</p>
          <p className="mt-2 text-center text-xs leading-relaxed text-white/50">{t.controls}</p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#8fdfff]/75">
                {t.scoreGuideTitle}
              </p>
              <div className="mt-3 grid gap-1.5">
                {STARLIGHT_SCORE_ROWS.map(({ id, color, score }) => (
                  <div
                    key={id}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5"
                  >
                    <span
                      aria-hidden
                      className="h-3 w-3 shrink-0 rounded-full border border-white/25"
                      style={{ backgroundColor: color }}
                    />
                    <span className="min-w-0 flex-1 text-[0.7rem] font-semibold text-white/75">
                      {t.starKindLabels[id]}
                    </span>
                    <span className="font-mono text-xs font-black text-[#dff8ff]">+{score}</span>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 space-y-0.5 text-center text-[0.65rem] font-semibold text-[#8fdfff]/65">
                <p>{t.comboGuide}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#8fdfff]/75">
                {t.ratingGuideTitle}
              </p>
              <div className="mt-3 grid gap-1.5">
                {STARLIGHT_RUSH.rating.map(({ id, min }) => (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5"
                  >
                    <span className="text-[0.7rem] font-semibold text-white/75">{t.rating[id]}</span>
                    <span className="font-mono text-[0.65rem] text-[#9eb4d4]">
                      {t.pointsOrMore(min)}
                    </span>
                  </div>
                ))}
              </div>
              {bestScore > 0 ? (
                <p className="mt-3 text-center text-xs text-[#f1d48c]">
                  {t.bestScore}: {bestScore}
                </p>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            className="mt-6 w-full rounded-full border border-[#8fdfff]/55 bg-gradient-to-b from-[#3a6aa8] to-[#1a3a68] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-[#dff8ff] shadow-[0_10px_30px_rgba(40,100,180,0.35)] transition hover:brightness-110"
            onClick={() => {
              requestAimPointerLock()
              startGame()
              void unlockAudioIfNeeded().then(() => playSfx('timerStart'))
            }}
          >
            {t.play}
          </button>
        </section>
      </div>
    </div>
  )
}

export function StarlightRushResult() {
  const phase = useStarlightRushStore((state) => state.phase)
  const score = useStarlightRushStore((state) => state.score)
  const bestScore = useStarlightRushStore((state) => state.bestScore)
  const ratingId = useStarlightRushStore((state) => state.ratingId)
  const replay = useStarlightRushStore((state) => state.replay)
  const exitToIdle = useStarlightRushStore((state) => state.exitToIdle)
  const t = starlightRushUi()

  if (phase !== 'result' || !ratingId) return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-3xl border border-[#5ce0ff]/40 bg-[#0b1220]/94 p-6 text-center text-white shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8fdfff]">
          {t.resultEyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-black">{t.resultHeadline}</h2>
        <p className="mt-4 font-[family-name:Georgia,Times_New_Roman,serif] text-5xl tabular-nums text-[#dff8ff]">
          {score}
        </p>
        <p className="mt-2 text-sm text-[#f1d48c]">
          {t.bestScore}: {bestScore}
        </p>
        <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/70">{t.rating[ratingId]}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0b1220]"
            onClick={() => {
              requestAimPointerLock()
              replay()
              void unlockAudioIfNeeded().then(() => playSfx('uiConfirm'))
            }}
          >
            {t.replay}
          </button>
          <button
            type="button"
            className="rounded-full border border-[#8fdfff]/50 bg-[#1a2a44] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#dff8ff]"
            onClick={() => {
              playSfx('uiClick')
              returnToAstro()
            }}
          >
            {t.returnAstro}
          </button>
          <button
            type="button"
            className="rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
            onClick={() => {
              playSfx('uiClick')
              exitToIdle()
            }}
          >
            {t.exit}
          </button>
        </div>
      </section>
    </div>
  )
}
