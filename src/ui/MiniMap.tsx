import { WORLD_RADIUS } from '../game/gameConfig'
import { getNpcById } from '../npc/npcData'
import { useGameStore } from '../stores/gameStore'
import { useNpcStore } from '../stores/npcStore'
import { usePlayerStore } from '../stores/playerStore'

/** 内側の枠線 (inset-[12.5%]) に合わせてワールド座標をマップ上の % に変換 */
const MAP_INSET_RATIO = 0.125

function worldToMapPercent(coordinate: number) {
  const normalized = (coordinate + WORLD_RADIUS) / (WORLD_RADIUS * 2)
  return (MAP_INSET_RATIO + normalized * (1 - MAP_INSET_RATIO * 2)) * 100
}

export function MiniMap() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const targetNpcIds = useGameStore((state) => state.targetNpcIds)
  const position = usePlayerStore((state) => state.position)
  const rotationY = usePlayerStore((state) => state.rotationY)
  const npcPositions = useNpcStore((state) => state.npcPositions)
  const isAnswerReveal = gamePhase === 'timedOut'

  if (gamePhase !== 'playing' && !isAnswerReveal) {
    return null
  }

  const targetMarkers = isAnswerReveal
    ? targetNpcIds
        .map((id) => {
          const npc = getNpcById(id)
          if (!npc) return null
          const targetPosition = npcPositions[npc.id] ?? npc.position
          return {
            id: npc.id,
            xPercent: worldToMapPercent(targetPosition[0]),
            zPercent: worldToMapPercent(targetPosition[2]),
          }
        })
        .filter((marker): marker is NonNullable<typeof marker> => marker !== null)
    : []

  const xPercent = worldToMapPercent(position[0])
  const zPercent = worldToMapPercent(position[2])
  const arrowRotation = -rotationY + Math.PI

  return (
    <aside
      className={`pointer-events-none absolute bottom-[9.5rem] left-3 z-30 rounded-2xl border p-1.5 text-white shadow-2xl backdrop-blur-md md:bottom-5 md:left-5 md:rounded-3xl md:p-4 ${
        isAnswerReveal
          ? 'border-amber-300/35 bg-amber-950/85'
          : 'border-white/20 bg-neutral-950/85'
      }`}
    >
      <div className="flex items-center justify-between gap-2 md:gap-4">
        <p
          className={`text-[0.45rem] font-semibold uppercase tracking-[0.2em] md:text-[0.65rem] md:tracking-[0.3em] ${
            isAnswerReveal ? 'text-amber-200/90' : 'text-neutral-400'
          }`}
        >
          Map
        </p>
        <p className="hidden text-xs font-semibold text-neutral-400 md:block">
          {Math.round(position[0])}, {Math.round(position[2])}
        </p>
      </div>

      <div className="relative mt-1 size-12 overflow-hidden rounded-lg border border-neutral-600 bg-neutral-800 md:mt-3 md:size-36 md:rounded-2xl">
        <div className="absolute left-1/2 top-0 h-full w-px bg-neutral-600/70" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-neutral-600/70" />
        <div className="absolute inset-[12.5%] border border-neutral-500/50" />
        {targetMarkers.map((marker) => (
          <div
            key={marker.id}
            className={`absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full md:h-3 md:w-3 ${
              isAnswerReveal ? 'animate-pulse bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.95)]' : 'bg-red-400'
            }`}
            style={{
              left: `${clampPercent(marker.xPercent)}%`,
              top: `${clampPercent(marker.zPercent)}%`,
            }}
          />
        ))}
        <div
          className="absolute flex items-center justify-center"
          style={{
            left: `${clampPercent(xPercent)}%`,
            top: `${clampPercent(zPercent)}%`,
            transform: `translate(-50%, -50%) rotate(${arrowRotation}rad)`,
          }}
        >
          <div className="h-0 w-0 border-x-[4px] border-b-[7px] border-x-transparent border-b-white drop-shadow md:border-x-[8px] md:border-b-[14px]" />
        </div>
      </div>

      {/* PC のみサブテキスト */}
      <p className="mt-1 hidden text-sm font-bold text-neutral-200 md:block">
        {isAnswerReveal ? 'Find the glow' : 'You are here'}
      </p>
    </aside>
  )
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value))
}
