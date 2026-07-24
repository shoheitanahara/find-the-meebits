import { MOUNTAIN, getMountainRuntime } from './config'
import type { VoxelBlock } from './config'

export type PlayerBody = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  onGround: boolean
}

function activeBlocks(): VoxelBlock[] {
  return getMountainRuntime().blocks
}

function blockTop(block: VoxelBlock) {
  return block.y + block.h
}

function overlapsXZ(body: PlayerBody, block: VoxelBlock, radius: number) {
  const minX = block.x - block.w / 2 - radius
  const maxX = block.x + block.w / 2 + radius
  const minZ = block.z - block.d / 2 - radius
  const maxZ = block.z + block.d / 2 + radius
  return body.x >= minX && body.x <= maxX && body.z >= minZ && body.z <= maxZ
}

/** 水平移動後にブロック側面から押し出す（段差のオートステップなし＝全部ジャンプ）。 */
export function resolveHorizontal(body: PlayerBody, blocks: VoxelBlock[] = activeBlocks()) {
  const r = MOUNTAIN.playerRadius
  const feet = body.y
  const head = body.y + MOUNTAIN.playerHeight

  for (const block of blocks) {
    const top = blockTop(block)
    const bottom = block.y
    if (head <= bottom + 0.05 || feet >= top - 0.05) continue
    if (!overlapsXZ(body, block, r)) continue

    const minX = block.x - block.w / 2
    const maxX = block.x + block.w / 2
    const minZ = block.z - block.d / 2
    const maxZ = block.z + block.d / 2

    const pushLeft = body.x - (minX - r)
    const pushRight = maxX + r - body.x
    const pushNear = body.z - (minZ - r)
    const pushFar = maxZ + r - body.z
    const minPush = Math.min(pushLeft, pushRight, pushNear, pushFar)

    if (minPush === pushLeft) {
      body.x = minX - r
      body.vx = Math.min(body.vx, 0)
    } else if (minPush === pushRight) {
      body.x = maxX + r
      body.vx = Math.max(body.vx, 0)
    } else if (minPush === pushNear) {
      body.z = minZ - r
      body.vz = Math.min(body.vz, 0)
    } else {
      body.z = maxZ + r
      body.vz = Math.max(body.vz, 0)
    }
  }
}

/** 落下・着地。上からブロック上面に乗ったときだけ接地。 */
export function resolveVertical(body: PlayerBody, dt: number, blocks: VoxelBlock[] = activeBlocks()) {
  body.vy -= MOUNTAIN.gravity * dt
  body.y += body.vy * dt
  body.onGround = false

  const r = MOUNTAIN.playerRadius
  const runtime = getMountainRuntime()

  if (body.vy <= 0) {
    for (const block of blocks) {
      if (!overlapsXZ(body, block, r * 0.92)) continue
      const top = blockTop(block)
      const prevFeet = body.y - body.vy * dt
      if (prevFeet >= top - 0.12 && body.y <= top + 0.05) {
        body.y = top
        body.vy = 0
        body.onGround = true
        break
      }
    }
  } else {
    const head = body.y + MOUNTAIN.playerHeight
    for (const block of blocks) {
      if (!overlapsXZ(body, block, r * 0.85)) continue
      const bottom = block.y
      if (head > bottom && body.y < bottom) {
        body.y = bottom - MOUNTAIN.playerHeight
        body.vy = 0
        break
      }
    }
  }

  if (body.y < MOUNTAIN.fallY) {
    body.x = runtime.start.x
    body.y = runtime.start.y
    body.z = runtime.start.z
    body.vx = 0
    body.vy = 0
    body.vz = 0
    body.onGround = true
  }
}

export function isAtGoal(body: PlayerBody) {
  const runtime = getMountainRuntime()
  const dx = body.x - runtime.pathCenterX(runtime.goalZ)
  const plateauDeep = MOUNTAIN.summitPlateau
  // 頂点平台のどこに乗ってもクリア（手前斜面では誤クリアしない）
  return (
    body.y >= runtime.goalY - 1.25 &&
    body.z <= runtime.goalZ + 1.6 &&
    body.z >= runtime.goalZ - plateauDeep - 0.5 &&
    Math.abs(dx) <= runtime.goalRadius + 2.5
  )
}

/** ステージ開始位置へボディをリセット */
export function resetBodyToStageStart(body: PlayerBody) {
  const runtime = getMountainRuntime()
  body.x = runtime.start.x
  body.y = runtime.start.y
  body.z = runtime.start.z
  body.vx = 0
  body.vy = 0
  body.vz = 0
  body.onGround = true
}
