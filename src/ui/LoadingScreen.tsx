import { useGameStore } from '../stores/gameStore'

export function LoadingScreen() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const playerModelStatus = useGameStore((state) => state.playerModelStatus)

  if (gamePhase === 'intro' || gamePhase === 'preparing' || playerModelStatus !== 'loading') {
    return null
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-sky-100/35 backdrop-blur-[2px]">
      <div className="rounded-3xl border border-white/60 bg-white/80 px-6 py-5 text-center shadow-2xl shadow-sky-900/10">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Loading</p>
        <p className="mt-2 text-xl font-black text-slate-950">Loading Meebits World...</p>
        <p className="mt-2 text-sm font-medium text-slate-600">Loading your Meebit avatar...</p>
      </div>
    </div>
  )
}
