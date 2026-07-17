import { type ReactNode } from 'react'
import { WORLD_RADIUS } from '../game/gameConfig'
import { getNpcById } from '../npc/npcData'
import { getRemainingTargetNpcIds, useGameStore } from '../stores/gameStore'
import { useNpcStore } from '../stores/npcStore'
import { usePlayerStore } from '../stores/playerStore'
import type { Vector3Tuple } from '../types/game'

/** 進入可能なワールド範囲 (±WORLD_RADIUS) をマップ全体に対応させる */
function worldToMapPercent(coordinate: number) {
  return ((coordinate + WORLD_RADIUS) / (WORLD_RADIUS * 2)) * 100
}

function resolveMapPosition(position: Vector3Tuple | undefined, fallback: Vector3Tuple) {
  const source = position ?? fallback
  return {
    xPercent: worldToMapPercent(source[0]),
    zPercent: worldToMapPercent(source[2]),
  }
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value))
}

type MapMarkerProps = {
  xPercent: number
  zPercent: number
  transform?: string
  className?: string
  children: ReactNode
}

function MapMarker({ xPercent, zPercent, transform = 'translate(-50%, -50%)', className, children }: MapMarkerProps) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        left: `${clampPercent(xPercent)}%`,
        top: `${clampPercent(zPercent)}%`,
        transform,
      }}
    >
      {children}
    </div>
  )
}

/** SP版ミニマップの外枠幅（left-3 + padding + size-24）— TimeUp の横位置合わせ用 */
export const SP_MINI_MAP_BOTTOM_OFFSET = '9.5rem'
export const SP_MINI_MAP_LEFT_OFFSET = '0.75rem'
export const SP_MINI_MAP_OUTER_WIDTH = '7.5rem'

const EMPTY_NPC_POSITIONS: Record<string, Vector3Tuple> = {}

export function MiniMap() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const targetNpcIds = useGameStore((state) => state.targetNpcIds)
  const foundTargetNpcIds = useGameStore((state) => state.foundTargetNpcIds)
  const position = usePlayerStore((state) => state.position)
  const rotationY = usePlayerStore((state) => state.rotationY)
  const isAnswerReveal = gamePhase === 'timedOut'
  const npcPositions = useNpcStore((state) => (isAnswerReveal ? state.npcPositions : EMPTY_NPC_POSITIONS))

  if (gamePhase !== 'playing' && !isAnswerReveal) {
    return null
  }

  const targetMarkers = isAnswerReveal
    ? getRemainingTargetNpcIds(targetNpcIds, foundTargetNpcIds)
        .map((id) => {
          const npc = getNpcById(id)
          if (!npc) return null

          const { xPercent, zPercent } = resolveMapPosition(npcPositions[npc.id], npc.position)
          return { id: npc.id, xPercent, zPercent }
        })
        .filter((marker): marker is NonNullable<typeof marker> => marker !== null)
    : []

  const { xPercent, zPercent } = resolveMapPosition(position, position)
  const arrowRotation = -rotationY + Math.PI

  return (
    <aside
      className={`pointer-events-none absolute bottom-[9.5rem] left-3 z-30 rounded-2xl border p-3 text-white shadow-2xl backdrop-blur-md lg:bottom-5 lg:left-5 lg:rounded-3xl lg:p-4 ${
        isAnswerReveal
          ? 'border-amber-300/35 bg-amber-950/85'
          : 'border-white/20 bg-neutral-950/85'
      }`}
    >
      <div className="flex items-center justify-between gap-2 lg:gap-4">
        <p
          className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] lg:text-[0.65rem] lg:tracking-[0.3em] ${
            isAnswerReveal ? 'text-amber-200/90' : 'text-neutral-400'
          }`}
        >
          Map
        </p>
        <p className="hidden text-xs font-semibold text-neutral-400 lg:block">
          {Math.round(position[0])}, {Math.round(position[2])}
        </p>
      </div>

      <div className="relative mt-2 size-24 overflow-hidden rounded-xl border border-neutral-600 bg-neutral-800 lg:mt-3 lg:size-36 lg:rounded-2xl">
        <div className="absolute left-1/2 top-0 h-full w-px bg-neutral-600/70" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-neutral-600/70" />
        {targetMarkers.map((marker) => (
          <MapMarker key={marker.id} xPercent={marker.xPercent} zPercent={marker.zPercent}>
            <div
              className={`h-3 w-3 rounded-full lg:h-3 lg:w-3 ${
                isAnswerReveal
                  ? 'animate-pulse bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.95)]'
                  : 'bg-red-400'
              }`}
            />
          </MapMarker>
        ))}
        <MapMarker
          xPercent={xPercent}
          zPercent={zPercent}
          className="flex items-center justify-center"
          transform={`translate(-50%, -50%) rotate(${arrowRotation}rad)`}
        >
          <div className="h-0 w-0 border-x-[8px] border-b-[14px] border-x-transparent border-b-white drop-shadow lg:border-x-[8px] lg:border-b-[14px]" />
        </MapMarker>
      </div>

      <p className="mt-1 hidden text-sm font-bold text-neutral-200 lg:block">
        {isAnswerReveal ? 'Find the glow' : 'You are here'}
      </p>
    </aside>
  )
}
