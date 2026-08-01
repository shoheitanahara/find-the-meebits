import { Html } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { getRideStoryBeat, starlightRideRuntime } from '../ridePath'
import { starlightRushUi } from '../i18n'
import { useStarlightRushStore } from '../store'

export function StarlightRushHud() {
  const phase = useStarlightRushStore((state) => state.phase)
  const score = useStarlightRushStore((state) => state.score)
  const combo = useStarlightRushStore((state) => state.combo)
  const remainingSec = useStarlightRushStore((state) => state.remainingSec)
  const countdownValue = useStarlightRushStore((state) => state.countdownValue)
  const aimOnTarget = useStarlightRushStore((state) => state.aimOnTarget)
  const fireFlashUntil = useStarlightRushStore((state) => state.fireFlashUntil)
  const [storyBeat, setStoryBeat] = useState<'depart' | 'cruise' | 'approach'>('depart')
  const t = starlightRushUi()

  useEffect(() => {
    if (phase !== 'playing' && phase !== 'countdown' && phase !== 'docking') return
    let raf = 0
    const tick = () => {
      const next = getRideStoryBeat(starlightRideRuntime.progress)
      setStoryBeat((prev) => (prev === next ? prev : next))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  if (phase === 'idle' || phase === 'result') return null

  const urgent = phase === 'playing' && remainingSec <= 12
  const firing = performance.now() < fireFlashUntil
  const storyLabel =
    phase === 'docking'
      ? t.storyDocking
      : storyBeat === 'depart'
        ? t.storyDepart
        : storyBeat === 'approach'
          ? t.storyApproach
          : t.storyCruise
  const launching = phase === 'countdown' && countdownValue === 0

  return (
    <>
      {phase === 'countdown' ? (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[#8fdfff]/80">
              {launching ? t.storyLaunching : t.storyDepart}
            </p>
            {launching ? (
              <p className="font-[family-name:Georgia,Times_New_Roman,serif] text-4xl font-black text-[#dff8ff] drop-shadow-xl sm:text-5xl">
                {t.storyDepart}
              </p>
            ) : (
              <p className="font-[family-name:Georgia,Times_New_Roman,serif] text-7xl font-black text-[#dff8ff] drop-shadow-xl">
                {t.countdown(countdownValue)}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {phase === 'docking' ? (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <div className="text-center">
            <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.28em] text-[#ff6ad5]/85">
              {t.storyApproach}
            </p>
            <p className="font-[family-name:Georgia,Times_New_Roman,serif] text-4xl font-black text-[#ffe0f4] drop-shadow-xl sm:text-5xl">
              {t.storyDocking}
            </p>
          </div>
        </div>
      ) : null}

      {phase === 'playing' || phase === 'docking' ? (
        <>
          {phase === 'playing' ? (
            <div className="pointer-events-none absolute left-1/2 top-[calc(env(safe-area-inset-top)+3.25rem)] z-30 -translate-x-1/2">
              <div
                className={`min-w-32 rounded-2xl border px-5 py-2 text-center shadow-2xl backdrop-blur-md ${
                  urgent
                    ? 'border-fuchsia-300/70 bg-fuchsia-950/85 text-fuchsia-100'
                    : 'border-[#5ce0ff]/45 bg-black/65 text-[#dff8ff]'
                }`}
              >
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.24em] text-current opacity-65">
                  {t.time}
                </p>
                <p className="font-mono text-3xl font-black leading-none tabular-nums sm:text-4xl">
                  {remainingSec.toFixed(1)}
                  <span className="ml-1 text-sm font-bold opacity-70">s</span>
                </p>
              </div>
            </div>
          ) : null}

          {phase === 'playing' ? (
            <div className="pointer-events-none absolute inset-x-0 top-[calc(env(safe-area-inset-top)+7.4rem)] z-30 flex justify-center px-4">
              <p className="rounded-full border border-white/15 bg-black/45 px-4 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-[#c8d8f0] backdrop-blur-md">
                {storyLabel}
              </p>
            </div>
          ) : null}

          <div className="pointer-events-none absolute left-3 top-[calc(env(safe-area-inset-top)+3.25rem)] z-30 sm:left-5">
            <div className="rounded-2xl border border-[#5ce0ff]/35 bg-black/60 px-4 py-2 backdrop-blur-md">
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#8fdfff]/80">
                {t.score}
              </p>
              <p className="font-mono text-2xl font-black tabular-nums text-[#f4ead2]">{score}</p>
              {phase === 'playing' && combo >= 2 ? (
                <p className="mt-0.5 font-mono text-xs font-bold tabular-nums text-[#ffb0e4]">
                  {t.combo} ×{combo}
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      {phase === 'playing' || phase === 'countdown' ? (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div
            className={`h-7 w-7 rounded-full border-2 transition ${
              aimOnTarget
                ? 'border-[#ffe66d] bg-[#ffe66d]/20 shadow-[0_0_18px_rgba(255,230,109,0.55)]'
                : firing
                  ? 'border-white bg-white/30'
                  : 'border-white/70 bg-transparent'
            }`}
          />
        </div>
      ) : null}
    </>
  )
}

export function StarlightRushFloatingScores() {
  const phase = useStarlightRushStore((state) => state.phase)
  const floatingScores = useStarlightRushStore((state) => state.floatingScores)
  const t = starlightRushUi()
  if (phase !== 'playing' || floatingScores.length === 0) return null

  return (
    <>
      {floatingScores.map((item) => (
        <Html key={item.id} position={[item.x, item.y + 0.4, item.z]} center distanceFactor={8}>
          <div className="pointer-events-none select-none text-center font-black text-[#ffe66d] drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
            <div className="tabular-nums whitespace-nowrap">+{item.points}</div>
            {item.comboMultiplier > 1 ? (
              <div className="whitespace-nowrap text-[0.7em] leading-tight tracking-wide">
                {t.floatCombo(item.comboMultiplier)}
              </div>
            ) : null}
          </div>
        </Html>
      ))}
    </>
  )
}
