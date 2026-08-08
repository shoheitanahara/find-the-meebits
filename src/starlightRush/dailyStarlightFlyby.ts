/**
 * Starlight Rush 日替わり僚機（すれ違い 3 機）。
 * UTC 日付固定。星と同じ進行（+Z）、外側レーン。
 */

import { CREATOR_MEEBIT_ID } from '../game/gameConfig'
import {
  createSeededRng,
  getUtcDateKey,
  hashStringToSeed,
  MEEBIT_ID_MAX,
} from '../top/dailyFeatured'
import { STARLIGHT_RUSH } from './config'

export type StarlightFlybyPilot = {
  meebitNumber: number
  laneX: number
  y: number
  spawnAtSec: number
  speed: number
  /** 射撃ポーズの微差（見た目用） */
  aimPitch: number
}

export type DailyStarlightFlyby = {
  dateKey: string
  pilots: StarlightFlybyPilot[]
}

let memoryCache: DailyStarlightFlyby | null = null

export function getDailyStarlightFlyby(dateKey = getUtcDateKey()): DailyStarlightFlyby {
  if (memoryCache?.dateKey === dateKey) return memoryCache

  const { flyby } = STARLIGHT_RUSH
  const rng = createSeededRng(hashStringToSeed(`meebits-starlight-flyby:${dateKey}`))
  const used = new Set<number>([CREATOR_MEEBIT_ID])
  const pilots: StarlightFlybyPilot[] = []

  for (let i = 0; i < flyby.count; i += 1) {
    let meebitNumber = 1
    for (let attempt = 0; attempt < 40; attempt += 1) {
      const id = 1 + Math.floor(rng() * MEEBIT_ID_MAX)
      if (used.has(id)) continue
      meebitNumber = id
      used.add(id)
      break
    }

    const laneX = flyby.laneX[i]! + (rng() - 0.5) * 0.45
    const y = flyby.baseY[i]! + (rng() - 0.5) * 0.28
    const spawnAtSec =
      flyby.spawnAtSec[i]! + (rng() - 0.5) * 2 * flyby.spawnJitterSec
    const speed = flyby.approachSpeed + (rng() - 0.5) * 2 * flyby.speedJitter
    const aimPitch = (rng() - 0.5) * 0.12

    pilots.push({
      meebitNumber,
      laneX,
      y,
      spawnAtSec: Math.max(4, Math.min(STARLIGHT_RUSH.gameDurationSec - 8, spawnAtSec)),
      speed: Math.max(7, speed),
      aimPitch,
    })
  }

  memoryCache = { dateKey, pilots }
  return memoryCache
}
