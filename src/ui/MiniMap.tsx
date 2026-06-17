import { WORLD_RADIUS } from '../game/gameConfig'
import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'
import { useNpcStore } from '../stores/npcStore'
import { usePlayerStore } from '../stores/playerStore'

export function MiniMap() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const targetNpcId = useGameStore((state) => state.targetNpcId)
  const position = usePlayerStore((state) => state.position)
  const rotationY = usePlayerStore((state) => state.rotationY)
  const npcPositions = useNpcStore((state) => state.npcPositions)
  const isAnswerReveal = gamePhase === 'timedOut'

  if (gamePhase !== 'playing' && !isAnswerReveal) {
    return null
  }

  const targetNpc = isAnswerReveal ? getNpcById(targetNpcId) : null
  const targetPosition = targetNpc
    ? (npcPositions[targetNpc.id] ?? targetNpc.position)
    : null

  const xPercent = ((position[0] + WORLD_RADIUS) / (WORLD_RADIUS * 2)) * 100
  const zPercent = ((position[2] + WORLD_RADIUS) / (WORLD_RADIUS * 2)) * 100
  // 矢印の左右が逆に見えるため回転方向を反転
  const arrowRotation = -rotationY + Math.PI
  const targetXPercent = targetPosition
    ? ((targetPosition[0] + WORLD_RADIUS) / (WORLD_RADIUS * 2)) * 100
    : null
  const targetZPercent = targetPosition
    ? ((targetPosition[2] + WORLD_RADIUS) / (WORLD_RADIUS * 2)) * 100
    : null

  return (
    <aside
      className={`pointer-events-none absolute bottom-5 left-5 z-30 rounded-3xl border p-4 text-white shadow-2xl backdrop-blur-md max-md:bottom-[9.5rem] max-md:left-3 max-md:p-2.5 ${
        isAnswerReveal
          ? 'border-amber-300/35 bg-amber-950/85'
          : 'border-white/20 bg-neutral-950/85'
      }`}
    >
      <div className="flex items-center justify-between gap-4 max-md:gap-2">
        <div>
          <p
            className={`text-[0.65rem] font-semibold uppercase tracking-[0.3em] max-md:text-[0.55rem] ${
              isAnswerReveal ? 'text-amber-200/90' : 'text-neutral-400'
            }`}
          >
            Map
          </p>
          <p className="mt-1 text-sm font-bold text-neutral-200 max-md:text-xs">
            {isAnswerReveal ? 'Find the glow' : 'You are here'}
          </p>
        </div>
        <p className="text-xs font-semibold text-neutral-400 max-md:hidden">
          {Math.round(position[0])}, {Math.round(position[2])}
        </p>
      </div>

      <div className="relative mt-3 h-36 w-36 overflow-hidden rounded-2xl border border-neutral-600 bg-neutral-800 max-md:mt-2 max-md:h-24 max-md:w-24 max-md:rounded-xl">
        <div className="absolute left-1/2 top-0 h-full w-px bg-neutral-600/70" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-neutral-600/70" />
        <div className="absolute inset-3 border border-neutral-500/50" />
        {targetXPercent !== null && targetZPercent !== null ? (
          <div
            className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${
              isAnswerReveal ? 'animate-pulse bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.95)]' : 'bg-red-400'
            }`}
            style={{
              left: `${clampPercent(targetXPercent)}%`,
              top: `${clampPercent(targetZPercent)}%`,
            }}
          />
        ) : null}
        <div
          className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${clampPercent(xPercent)}%`,
            top: `${clampPercent(zPercent)}%`,
            transform: `translate(-50%, -50%) rotate(${arrowRotation}rad)`,
          }}
        >
          <div className="h-0 w-0 border-x-[8px] border-b-[14px] border-x-transparent border-b-white drop-shadow" />
        </div>
      </div>
    </aside>
  )
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value))
}
