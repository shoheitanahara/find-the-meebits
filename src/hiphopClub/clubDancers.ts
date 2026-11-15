/**
 * クラブ NPC。人数は Podcast 客席と同じ（総席数 × 占有率）。
 * 位置は訪問ごとに、歩きやすい床へランダム配置する。
 */
import { MathUtils } from 'three'
import { PODCAST_OCCUPANCY, PODCAST } from '../podcast/config'
import { isClubPositionWalkable } from './collisions'
import { CLUB } from './config'

/** Podcast と同じ総席数（ベンチ数 × 2） */
export const CLUB_TOTAL_NPC_SLOTS = PODCAST.benches.length * 2

export type ClubNpcSpawn = {
  meebitNumber: number
  x: number
  z: number
  rotationY: number
  walkPattern: 0 | 1 | 2
}

/** Podcast と同じ目標占有率で、本日の NPC 人数を決める */
export function pickDailyNpcCount(rng: () => number): number {
  const targetEmpty = Math.round(CLUB_TOTAL_NPC_SLOTS * (1 - PODCAST_OCCUPANCY))
  const jitter = Math.floor(rng() * 3) - 1
  const emptyCount = Math.max(2, Math.min(CLUB_TOTAL_NPC_SLOTS - 2, targetEmpty + jitter))
  return CLUB_TOTAL_NPC_SLOTS - emptyCount
}

/**
 * パーク群衆と同じく、歩きやすい床に散らしてスポーンする。
 * 入口 EXIT・スクリーン前は避ける。
 */
export function createClubNpcSpawns(audienceIds: readonly number[]): ClubNpcSpawn[] {
  const spawns: ClubNpcSpawn[] = []
  const maxAttempts = audienceIds.length * 80
  let attempts = 0

  const { roomHalfX, roomMinZ, roomMaxZ, playerExit, screen } = CLUB
  const minX = -roomHalfX + 1.6
  const maxX = roomHalfX - 1.6
  // スクリーン手前〜入口手前
  const minZ = roomMinZ + 2.8
  const maxZ = roomMaxZ - 2.2

  while (spawns.length < audienceIds.length && attempts < maxAttempts) {
    attempts += 1
    const x = MathUtils.randFloat(minX, maxX)
    const z = MathUtils.randFloat(minZ, maxZ)

    if (!isClubPositionWalkable(x, z)) continue
    // EXIT パッド周りを空ける
    if (Math.hypot(x - playerExit.x, z - playerExit.z) < 2.4) continue
    // スクリーン真前を少し空ける
    if (Math.abs(x - screen.x) < screen.width * 0.35 && z < screen.z + 3.2) continue
    if (spawns.some((spawn) => Math.hypot(spawn.x - x, spawn.z - z) < 1.45)) continue

    const meebitNumber = audienceIds[spawns.length]
    if (meebitNumber === undefined) break

    spawns.push({
      meebitNumber,
      x,
      z,
      rotationY: Math.random() * Math.PI * 2,
      walkPattern: (spawns.length % 3) as 0 | 1 | 2,
    })
  }

  // 余りは円配置フォールバック
  while (spawns.length < audienceIds.length) {
    const meebitNumber = audienceIds[spawns.length]
    if (meebitNumber === undefined) break
    const fallbackIndex = spawns.length
    const angle = (fallbackIndex / audienceIds.length) * Math.PI * 2 + Math.random() * 0.4
    const radius = 3.5 + (fallbackIndex % 5) * 1.1 + MathUtils.randFloat(-0.5, 0.5)
    let x = Math.cos(angle) * radius
    let z = CLUB.danceFloor.z + Math.sin(angle) * radius * 0.7
    if (!isClubPositionWalkable(x, z)) {
      x = MathUtils.clamp(x, minX, maxX)
      z = MathUtils.clamp(z, minZ, maxZ)
    }
    spawns.push({
      meebitNumber,
      x,
      z,
      rotationY: Math.random() * Math.PI * 2,
      walkPattern: (fallbackIndex % 3) as 0 | 1 | 2,
    })
  }

  return spawns
}
