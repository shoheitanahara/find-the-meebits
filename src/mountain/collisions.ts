import { MOUNTAIN, pathCenterX } from './config'
import type { VoxelBlock } from './config'
import { MOUNTAIN_BLOCKS } from './config'

export type PlayerBody = {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  onGround: boolean
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
export function resolveHorizontal(body: PlayerBody, blocks: VoxelBlock[] = MOUNTAIN_BLOCKS) {
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
export function resolveVertical(body: PlayerBody, dt: number, blocks: VoxelBlock[] = MOUNTAIN_BLOCKS) {
  body.vy -= MOUNTAIN.gravity * dt
  body.y += body.vy * dt
  body.onGround = false

  const r = MOUNTAIN.playerRadius

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
    body.x = MOUNTAIN.start.x
    body.y = MOUNTAIN.start.y
    body.z = MOUNTAIN.start.z
    body.vx = 0
    body.vy = 0
    body.vz = 0
    body.onGround = true
  }
}

export function isAtGoal(body: PlayerBody) {
  const dx = body.x - pathCenterX(MOUNTAIN.goalZ)
  const dz = body.z - MOUNTAIN.goalZ
  return body.y >= MOUNTAIN.goalY - 2 && Math.hypot(dx, dz) <= MOUNTAIN.goalRadius
}
