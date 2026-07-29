import { Html } from '@react-three/drei'
import { shootingGalleryUi } from '../i18n'
import { useShootingGalleryStore } from '../store'

/** DOM HUD（Canvas 外でマウント） */
export function ShootingGalleryHud() {
  const phase = useShootingGalleryStore((state) => state.phase)
  const score = useShootingGalleryStore((state) => state.score)
  const combo = useShootingGalleryStore((state) => state.combo)
  const remainingSec = useShootingGalleryStore((state) => state.remainingSec)
  const countdownValue = useShootingGalleryStore((state) => state.countdownValue)
  const aimOnTarget = useShootingGalleryStore((state) => state.aimOnTarget)
  const fireFlashUntil = useShootingGalleryStore((state) => state.fireFlashUntil)
  const t = shootingGalleryUi()

  if (phase === 'idle' || phase === 'result') return null

  const urgent = phase === 'playing' && remainingSec <= 10
  const firing = performance.now() < fireFlashUntil

  return (
    <>
      {phase === 'countdown' ? (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center">
          <p className="font-[family-name:Georgia,Times_New_Roman,serif] text-7xl font-black text-amber-100 drop-shadow-xl">
            {t.countdown(countdownValue)}
          </p>
        </div>
      ) : null}

      {phase === 'playing' ? (
        <>
          <div className="pointer-events-none absolute left-1/2 top-[calc(env(safe-area-inset-top)+3.25rem)] z-30 -translate-x-1/2">
            <div
              className={`min-w-32 rounded-2xl border px-5 py-2 text-center shadow-2xl backdrop-blur-md ${
                urgent
                  ? 'border-rose-300/70 bg-rose-950/85 text-rose-100 shadow-rose-500/25'
                  : 'border-amber-200/45 bg-black/65 text-amber-100'
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

          <div
            className="pointer-events-none absolute left-3 top-[calc(env(safe-area-inset-top)+3.25rem)] z-30 rounded-xl border border-white/25 bg-black/50 px-3 py-2.5 text-white backdrop-blur"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/55">{t.title}</p>
            <div className="mt-1.5 space-y-0.5 border-t border-white/15 pt-1.5 text-xs">
              <p className="tabular-nums">
                {t.score} {score}
              </p>
              <p className="tabular-nums text-amber-100/90">
                {t.combo} ×{combo}
              </p>
            </div>
          </div>

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 z-30"
            style={{
              transform: `translate(-50%, -50%) scale(${firing ? 0.72 : 1})`,
              transition: 'transform 60ms linear',
            }}
          >
            <div
              className={`h-8 w-8 rounded-full border-2 ${
                aimOnTarget
                  ? 'border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.7)]'
                  : 'border-white/80'
              }`}
            />
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
          </div>
        </>
      ) : null}
    </>
  )
}

/** ワールド座標の得点ポップ（Canvas 内） */
export function ShootingGalleryFloatingScores() {
  const floatingScores = useShootingGalleryStore((state) => state.floatingScores)
  const phase = useShootingGalleryStore((state) => state.phase)
  if (phase !== 'playing' || floatingScores.length === 0) return null

  return (
    <group>
      {floatingScores.map((item) => (
        <Html key={item.id} position={[item.x, item.y + 0.35, item.z]} center>
          <div
            className={`whitespace-nowrap text-sm font-black drop-shadow ${
              item.points < 0
                ? 'text-rose-300'
                : item.points >= 500
                  ? 'text-amber-200'
                  : 'text-white'
            }`}
          >
            {item.points > 0 ? `+${item.points}` : item.points}
          </div>
        </Html>
      ))}
    </group>
  )
}
