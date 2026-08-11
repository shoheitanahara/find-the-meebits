import { useEffect, useState } from 'react'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { getLocale } from '../../i18n/locale'
import { dialogueChromeDimClass } from '../../ui/dialogueChrome'
import { galleryLabel } from '../galleryLabels'
import { OPEN_SEA_MARKET } from '../config'
import { openSeaMarketPlayerWorld } from '../playerWorld'
import { useOpenSeaMarketStore, type MarketRoomIndex } from '../store'

const ROOM_ORDER: MarketRoomIndex[] = [0, 1, 2]

/**
 * 簡易ミニマップ — WEST / MAIN / EAST の並びと現在位置。
 * 上が奥(-Z)、下が入口(+Z)。
 */
export function MarketMinimap() {
  const activeRoomIndex = useOpenSeaMarketStore((s) => s.activeRoomIndex)
  const sessionGalleries = useOpenSeaMarketStore((s) => s.sessionGalleries)
  const bootPhase = useOpenSeaMarketStore((s) => s.bootPhase)
  const isDialogueOpen = useDialogueStore((s) => s.isOpen)
  const locale = getLocale()
  const [dot, setDot] = useState({ x: 0.5, y: 0.75 })

  useEffect(() => {
    if (bootPhase !== 'ready') return
    const id = window.setInterval(() => {
      if (!openSeaMarketPlayerWorld.ready) return
      const { roomHalfX, roomMinZ, roomMaxZ } = OPEN_SEA_MARKET
      const nx = (openSeaMarketPlayerWorld.x + roomHalfX) / (roomHalfX * 2)
      // CSS top=0 が奥(-Z)、bottom が入口(+Z)
      const nz = (openSeaMarketPlayerWorld.z - roomMinZ) / (roomMaxZ - roomMinZ)
      setDot({
        x: Math.min(0.92, Math.max(0.08, nx)),
        y: Math.min(0.92, Math.max(0.08, nz)),
      })
    }, 80)
    return () => window.clearInterval(id)
  }, [bootPhase])

  const {
    roomHalfX,
    roomMinZ,
    roomMaxZ,
    playerExit,
    defaultRoomIndex,
    galleryGate,
  } = OPEN_SEA_MARKET
  const exitNx = (playerExit.x + roomHalfX) / (roomHalfX * 2)
  const exitNz = (playerExit.z - roomMinZ) / (roomMaxZ - roomMinZ)
  const gateNz = Math.min(
    0.9,
    Math.max(0.12, (galleryGate.z - roomMinZ) / (roomMaxZ - roomMinZ)),
  )

  if (bootPhase !== 'ready') return null

  const filled = sessionGalleries.filter((g) => g.length > 0).length
  if (filled <= 1) return null

  return (
    <div
      className={`pointer-events-none absolute left-3 top-16 z-20 max-lg:left-2 max-lg:top-[max(4.5rem,env(safe-area-inset-top))] ${dialogueChromeDimClass(isDialogueOpen)}`}
    >
      <div className="rounded-2xl border border-sky-300/35 bg-[#0c1828]/88 px-2.5 py-2 shadow-lg backdrop-blur-md">
        <p className="mb-1.5 text-center text-[0.55rem] font-semibold uppercase tracking-[0.22em] text-sky-300/75">
          {locale === 'ja' ? 'マップ' : 'Map'}
        </p>
        <div className="flex items-stretch gap-1">
          {ROOM_ORDER.map((room) => {
            const count = sessionGalleries[room]?.length ?? 0
            const empty = count === 0
            const active = room === activeRoomIndex
            const isMain = room === defaultRoomIndex
            const hasWestGate =
              !empty &&
              room > 0 &&
              (sessionGalleries[(room - 1) as MarketRoomIndex]?.length ?? 0) > 0
            const hasEastGate =
              !empty &&
              room < OPEN_SEA_MARKET.roomCount - 1 &&
              (sessionGalleries[(room + 1) as MarketRoomIndex]?.length ?? 0) > 0
            return (
              <div
                key={room}
                className={`relative h-[4.5rem] w-[3.1rem] overflow-hidden rounded-lg border ${
                  empty
                    ? 'border-white/10 bg-white/5 opacity-35'
                    : active
                      ? 'border-sky-300/70 bg-sky-400/15'
                      : 'border-white/15 bg-[#081018]/90'
                }`}
              >
                <p
                  className={`absolute inset-x-0 top-1 text-center text-[0.55rem] font-bold tracking-wide ${
                    active ? 'text-sky-100' : 'text-sky-100/55'
                  }`}
                >
                  {galleryLabel(room, locale)}
                </p>
                {/* 左右ギャラリー接続ゲート（控えめな開口印） */}
                {hasWestGate ? (
                  <span
                    aria-hidden
                    className="absolute left-0 h-2.5 w-[3px] -translate-y-1/2 rounded-r-[1px] bg-sky-200/70"
                    style={{ top: `${gateNz * 100}%` }}
                  />
                ) : null}
                {hasEastGate ? (
                  <span
                    aria-hidden
                    className="absolute right-0 h-2.5 w-[3px] -translate-y-1/2 rounded-l-[1px] bg-sky-200/70"
                    style={{ top: `${gateNz * 100}%` }}
                  />
                ) : null}
                {/* MAIN のみ EXIT 位置 */}
                {isMain && !empty ? (
                  <span
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-[#7dd3fc] px-[3px] py-px text-[0.4rem] font-bold leading-none tracking-wide text-[#0c1828]"
                    style={{
                      left: `${Math.min(0.9, Math.max(0.1, exitNx)) * 100}%`,
                      top: `${Math.min(0.92, Math.max(0.78, exitNz)) * 100}%`,
                    }}
                  >
                    EXIT
                  </span>
                ) : null}
                {active && !empty ? (
                  <span
                    className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#fbbf24] shadow-[0_0_8px_rgba(251,191,36,0.85)]"
                    style={{ left: `${dot.x * 100}%`, top: `${dot.y * 100}%` }}
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
