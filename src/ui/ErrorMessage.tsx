import { useGameStore } from '../stores/gameStore'

export function ErrorMessage() {
  const playerModelStatus = useGameStore((state) => state.playerModelStatus)
  const playerModelError = useGameStore((state) => state.playerModelError)

  if (playerModelStatus !== 'error') {
    return null
  }

  return (
    <div className="pointer-events-none absolute bottom-5 left-5 z-20 max-w-sm rounded-3xl border border-amber-200 bg-amber-50/90 px-5 py-4 text-sm shadow-xl shadow-amber-900/10 backdrop-blur-md">
      <p className="font-black text-amber-950">Could not load this Meebit model.</p>
      <p className="mt-1 font-medium text-amber-800">
        Placeholder avatar is active. Please check the VRM file path or network access.
      </p>
      {playerModelError ? <p className="mt-2 text-xs text-amber-700">{playerModelError}</p> : null}
    </div>
  )
}
