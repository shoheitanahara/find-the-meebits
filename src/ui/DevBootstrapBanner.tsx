import { formatDevBootstrapHint, getDevBootstrapConfig } from '../game/devBootstrap'

export function DevBootstrapBanner() {
  const config = getDevBootstrapConfig()

  if (!config) {
    return null
  }

  return (
    <div className="pointer-events-none absolute bottom-2 left-2 z-[60] rounded-full bg-amber-400/95 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-amber-950 shadow-lg max-lg:bottom-[max(0.5rem,env(safe-area-inset-bottom))]">
      {formatDevBootstrapHint(config)}
    </div>
  )
}
