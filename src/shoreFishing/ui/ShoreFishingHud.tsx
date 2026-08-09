import { getFishKind } from '../config'
import { fishLabel, shoreFishingUi } from '../i18n'
import { useShoreFishingStore } from '../store'

export function ShoreFishingHud() {
  const phase = useShoreFishingStore((s) => s.phase)
  const score = useShoreFishingStore((s) => s.score)
  const remainingSec = useShoreFishingStore((s) => s.remainingSec)
  const catches = useShoreFishingStore((s) => s.catches)
  const castPhase = useShoreFishingStore((s) => s.castPhase)
  const promptFlash = useShoreFishingStore((s) => s.promptFlash)
  const lastCatch = useShoreFishingStore((s) => s.lastCatch)
  const countdownValue = useShoreFishingStore((s) => s.countdownValue)
  const nearShore = useShoreFishingStore((s) => s.nearShore)
  const pendingFishId = useShoreFishingStore((s) => s.pendingFishId)
  const t = shoreFishingUi()

  if (phase === 'idle' || phase === 'result') return null

  const status =
    castPhase === 'ready'
      ? nearShore
        ? t.nearShore
        : t.walkHint
      : castPhase === 'casting'
        ? t.wait
        : castPhase === 'approach' && !pendingFishId
          ? t.waitFish
          : castPhase === 'bite' || promptFlash === 'bite'
            ? t.bite
            : castPhase === 'nibble'
              ? t.nibble
              : castPhase === 'caught' || (castPhase === 'reeling' && pendingFishId)
                ? t.catch
                : castPhase === 'reeling' &&
                    (promptFlash === 'miss' || promptFlash === 'empty')
                  ? t.miss
                  : castPhase === 'reeling'
                    ? t.wait
                    : castPhase === 'miss'
                      ? t.miss
                      : t.wait

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[max(3.25rem,calc(env(safe-area-inset-top)+2.75rem))] z-30 flex flex-col items-center gap-2 px-3">
      <div className="flex w-full max-w-lg items-center justify-between gap-3 rounded-2xl border border-white/15 bg-[#0a1520]/75 px-4 py-2.5 text-[#f4ead2] shadow-lg backdrop-blur-md">
        <div>
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-cyan-100/60">{t.score}</p>
          <p className="font-mono text-xl font-black tabular-nums">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-cyan-100/60">{t.time}</p>
          <p className="font-mono text-xl font-black tabular-nums">
            {phase === 'countdown' ? countdownValue : remainingSec.toFixed(1)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-cyan-100/60">{t.caught}</p>
          <p className="font-mono text-xl font-black tabular-nums">{catches.length}</p>
        </div>
      </div>

      {phase === 'countdown' ? (
        <p className="rounded-full border border-amber-200/40 bg-black/50 px-4 py-1.5 text-sm font-bold tracking-wide text-amber-100">
          {t.countdown} {countdownValue}
        </p>
      ) : (
        <p
          className={`rounded-full border px-4 py-1.5 text-sm font-bold tracking-wide ${
            promptFlash === 'bite'
              ? 'animate-pulse border-red-300/70 bg-red-900/70 text-red-100'
              : promptFlash === 'catch'
                ? 'border-emerald-300/50 bg-emerald-900/60 text-emerald-100'
                : promptFlash === 'miss' || promptFlash === 'empty'
                  ? 'border-white/20 bg-black/50 text-white/70'
                  : 'border-white/20 bg-black/45 text-white/80'
          }`}
        >
          {status}
          {lastCatch && (castPhase === 'caught' || castPhase === 'reeling')
            ? ` ${fishLabel(lastCatch.fishId)} +${lastCatch.score}`
            : ''}
        </p>
      )}

      {(castPhase === 'caught' || castPhase === 'reeling') && lastCatch ? (
        <div
          className="mt-1 flex items-center gap-2 rounded-2xl border border-white/15 bg-[#102030]/90 px-4 py-2"
          style={{ borderColor: `${getFishKind(lastCatch.fishId).color}66` }}
        >
          <span
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: getFishKind(lastCatch.fishId).color }}
          />
          <span className="text-sm font-semibold text-white/90">{fishLabel(lastCatch.fishId)}</span>
          <span className="font-mono text-sm font-black text-amber-200">+{lastCatch.score}</span>
        </div>
      ) : null}
    </div>
  )
}
