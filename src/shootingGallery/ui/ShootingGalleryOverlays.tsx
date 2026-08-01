import { isTouchUiMode } from '../../game/perfConfig'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { SHOOTING_GALLERY } from '../config'
import { shootingGalleryUi } from '../i18n'
import { useShootingGalleryStore } from '../store'

const TARGET_SCORE_ROWS = [
  { id: 'normal', color: '#d8c090', score: SHOOTING_GALLERY.score.normal },
  { id: 'smallFast', color: '#8a9aaa', score: SHOOTING_GALLERY.score.smallFast },
  { id: 'gold', color: '#f0c050', score: SHOOTING_GALLERY.score.gold },
  { id: 'red', color: '#c02828', score: SHOOTING_GALLERY.score.red },
] as const

function requestAimPointerLock() {
  if (isTouchUiMode()) return
  const canvas = document.getElementById(SHOOTING_GALLERY.canvasElementId)
  if (!(canvas instanceof HTMLCanvasElement)) return
  if (document.pointerLockElement === canvas) return
  void canvas.requestPointerLock()
}

export function ShootingGalleryPlayPrompt() {
  const phase = useShootingGalleryStore((state) => state.phase)
  const startGame = useShootingGalleryStore((state) => state.startGame)
  const bestScore = useShootingGalleryStore((state) => state.bestScore)
  const t = shootingGalleryUi()

  if (phase !== 'idle') return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-40 overflow-y-auto bg-black/55 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center px-4 pb-6 pt-[max(5.5rem,calc(env(safe-area-inset-top)+4.75rem))] sm:items-center sm:py-6">
        <section className="w-full max-w-xl rounded-[2rem] border border-amber-200/35 bg-[#101820]/95 p-5 text-[#f4ead2] shadow-2xl sm:p-7">
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-amber-200/80">
          {t.rulesTitle}
        </p>
        <h1 className="mt-2 text-center font-[family-name:Georgia,Times_New_Roman,serif] text-3xl sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-3 text-center text-sm text-white/65">{t.subtitle}</p>
        <p className="mt-2 text-center text-xs leading-relaxed text-white/50">{t.controls}</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-amber-100/75">
              {t.scoreGuideTitle}
            </p>
            <div className="mt-3 grid gap-1.5">
              {TARGET_SCORE_ROWS.map(({ id, color, score }) => (
                <div
                  key={id}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5"
                >
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 rounded-full border border-white/25 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="min-w-0 flex-1 text-[0.7rem] font-semibold text-white/75">
                    {t.targetLabels[id]}
                  </span>
                  <span className={`font-mono text-xs font-black ${score < 0 ? 'text-red-300' : 'text-amber-100'}`}>
                    {score > 0 ? '+' : ''}
                    {score}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-2.5 space-y-0.5 text-center text-[0.65rem] font-semibold text-amber-100/65">
              <p>{t.comboGuide}</p>
              <p>{t.bullseyeGuide}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.22em] text-amber-100/75">
              {t.ratingGuideTitle}
            </p>
            <div className="mt-3 grid gap-1.5">
              {SHOOTING_GALLERY.rating.map(({ id, min }) => (
                <div
                  key={id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5"
                >
                  <span className="text-[0.7rem] font-semibold text-white/75">{t.rating[id]}</span>
                  <span className="whitespace-nowrap font-mono text-[0.7rem] font-black text-amber-100">
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
          className="mt-5 w-full rounded-full bg-amber-100 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#101820] transition hover:bg-white active:scale-[0.99]"
          onClick={() => {
            requestAimPointerLock()
            startGame()
            void unlockAudioIfNeeded().then(() => {
              playSfx('timerStart')
            })
          }}
        >
          {t.play}
        </button>
        </section>
      </div>
    </div>
  )
}

export function ShootingGalleryResult() {
  const phase = useShootingGalleryStore((state) => state.phase)
  const score = useShootingGalleryStore((state) => state.score)
  const bestScore = useShootingGalleryStore((state) => state.bestScore)
  const ratingId = useShootingGalleryStore((state) => state.ratingId)
  const replay = useShootingGalleryStore((state) => state.replay)
  const exitToIdle = useShootingGalleryStore((state) => state.exitToIdle)
  const t = shootingGalleryUi()

  if (phase !== 'result' || !ratingId) return null

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-3xl border border-amber-200/40 bg-[#101820]/94 p-6 text-center text-white shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-200">
          {t.resultEyebrow}
        </p>
        <h2 className="mt-2 text-3xl font-black">{t.resultHeadline}</h2>
        <p className="mt-4 font-[family-name:Georgia,Times_New_Roman,serif] text-5xl tabular-nums text-amber-100">
          {score}
        </p>
        <p className="mt-2 text-sm text-[#f1d48c]">
          {t.bestScore}: {bestScore}
        </p>
        <p className="mt-3 text-sm uppercase tracking-[0.2em] text-white/70">{t.rating[ratingId]}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="rounded-full bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#101820]"
            onClick={() => {
              requestAimPointerLock()
              replay()
              void unlockAudioIfNeeded().then(() => {
                playSfx('uiConfirm')
              })
            }}
          >
            {t.replay}
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
