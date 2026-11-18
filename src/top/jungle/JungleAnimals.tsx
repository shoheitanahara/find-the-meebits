/**
 * Jungle の動物たち。柵はなく、エリア全体のランダムな場所に現れて「止まる → 歩く → 止まる」で自由に歩き回る。
 * - 木・街灯・門などパークの障害物は避ける（当たりそうなら別の行き先を選ぶ）
 * - 他の動物が前にいたら立ち止まる
 * - 胴体は VoxelModelMesh（1体あたり1ドローコール）、脚は腰を支点に前後へ振る
 * 更新は1つの useFrame でまとめて行う。
 */
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import type { Group } from 'three'
import { collidesWithParkObstacles } from '../topCollisions'
import { VoxelModelMesh } from '../voxel/VoxelModelMesh'
import { buildAnimalModel, type AnimalLeg, type AnimalModel } from './jungleAnimalModels'
import { JUNGLE_HERDS, JUNGLE_ROAM_BOUNDS, type AnimalSpecies } from './jungleConfig'

/** 向きを変える速さ（rad/s） */
const TURN_RATE = 2.2
/** 目的地に着いたとみなす距離 */
const ARRIVE_DISTANCE = 0.18
/** 脚の振り幅（rad） */
const LEG_SWING = 0.55
/** 歩くときの胴の上下 */
const BODY_BOB = 0.035
/** 床タイルの上面（足元をここに合わせる） */
const GROUND_Y = 0.12
/** 1回に歩く距離の範囲 */
const WALK_MIN = 2
const WALK_MAX = 8

/** 種類ごとの体の半径（障害物・他の動物との間隔） */
const BODY_RADIUS: Record<AnimalSpecies, number> = {
  pig: 0.45,
  cow: 0.75,
  sheep: 0.55,
}

type AnimalSpawn = {
  key: string
  species: AnimalSpecies
  variant: number
  x: number
  z: number
  yaw: number
}

type AnimalState = {
  x: number
  z: number
  yaw: number
  radius: number
  mode: 'idle' | 'walk'
  timer: number
  targetX: number
  targetZ: number
  /** 歩行サイクルの位相 */
  phase: number
  /** 0 = 止まっている / 1 = 歩いている（脚の振りを滑らかに出し入れ） */
  gait: number
}

function randomIn(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/** エリア全体からランダムな1点 */
function randomRoamPoint() {
  const b = JUNGLE_ROAM_BOUNDS
  return { x: randomIn(b.minX + 1, b.maxX - 1), z: randomIn(b.minZ + 1, b.maxZ - 1) }
}

function insideRoamBounds(x: number, z: number, radius: number) {
  const b = JUNGLE_ROAM_BOUNDS
  return x > b.minX + radius && x < b.maxX - radius && z > b.minZ + radius && z < b.maxZ - radius
}

function isFree(x: number, z: number, radius: number) {
  return insideRoamBounds(x, z, radius) && !collidesWithParkObstacles(x, z, radius)
}

/** 角度差を -π〜π に */
function wrapAngle(a: number) {
  return Math.atan2(Math.sin(a), Math.cos(a))
}

/** 東門から入ってきたプレイヤーのすぐ前には出さない */
const ENTRY_CLEAR = { x: 19.5, z: 1, radius: 3 } as const

/** 種類と頭数は群れの定義から。出現位置はエリア全体からランダムに選ぶ */
function createSpawns(): AnimalSpawn[] {
  const spawns: AnimalSpawn[] = []
  for (const herd of JUNGLE_HERDS) {
    for (const { species, count } of herd.animals) {
      for (let i = 0; i < count; i += 1) {
        const radius = BODY_RADIUS[species]
        let point = randomRoamPoint()
        for (let attempt = 0; attempt < 40; attempt += 1) {
          const crowded = spawns.some((s) => Math.hypot(s.x - point.x, s.z - point.z) < 1.8)
          const nearEntry =
            Math.hypot(point.x - ENTRY_CLEAR.x, point.z - ENTRY_CLEAR.z) < ENTRY_CLEAR.radius
          if (!crowded && !nearEntry && isFree(point.x, point.z, radius)) break
          point = randomRoamPoint()
        }
        spawns.push({
          key: `${herd.id}-${species}-${i}`,
          species,
          variant: i,
          x: point.x,
          z: point.z,
          yaw: Math.random() * Math.PI * 2,
        })
      }
    }
  }
  return spawns
}

/** 今いる場所から、障害物に当たらずに行ける次の目的地 */
function pickTarget(state: AnimalState) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const angle = Math.random() * Math.PI * 2
    const distance = randomIn(WALK_MIN, WALK_MAX)
    const x = state.x + Math.sin(angle) * distance
    const z = state.z + Math.cos(angle) * distance
    if (!isFree(x, z, state.radius)) continue
    // 途中も障害物に当たらないか（数点だけ確認）
    let clear = true
    for (const t of [0.33, 0.66]) {
      if (!isFree(state.x + (x - state.x) * t, state.z + (z - state.z) * t, state.radius)) {
        clear = false
        break
      }
    }
    if (clear) return { x, z }
  }
  return null
}

export function JungleAnimals() {
  const spawns = useMemo(createSpawns, [])
  const models = useMemo(
    () => spawns.map((spawn) => buildAnimalModel(spawn.species, spawn.variant)),
    [spawns],
  )
  const states = useRef<AnimalState[]>(
    spawns.map((spawn) => ({
      x: spawn.x,
      z: spawn.z,
      yaw: spawn.yaw,
      radius: BODY_RADIUS[spawn.species],
      mode: 'idle',
      // 最初は全員ばらばらのタイミングで歩き出す
      timer: randomIn(0.3, 4),
      targetX: spawn.x,
      targetZ: spawn.z,
      phase: Math.random() * Math.PI * 2,
      gait: 0,
    })),
  )
  const rootRefs = useRef<Array<Group | null>>([])
  const bodyRefs = useRef<Array<Group | null>>([])
  const legRefs = useRef<Array<Array<Group | null>>>(spawns.map(() => []))

  useFrame((_, rawDelta) => {
    // タブ復帰時などの大きな dt でワープしないように
    const delta = Math.min(rawDelta, 0.1)
    const all = states.current
    for (let index = 0; index < all.length; index += 1) {
      const state = all[index]
      updateAnimal(state, models[index], delta, all)

      const root = rootRefs.current[index]
      if (root) {
        root.position.set(state.x, GROUND_Y, state.z)
        root.rotation.y = state.yaw
      }
      const body = bodyRefs.current[index]
      if (body) {
        body.position.y = Math.abs(Math.sin(state.phase)) * BODY_BOB * state.gait
      }
      const legs = legRefs.current[index]
      for (let i = 0; i < legs.length; i += 1) {
        const leg = legs[i]
        if (!leg) continue
        // 左後ろと右前、左前と右後ろが同じ向きに振れる
        const diagonal = i === 0 || i === 3 ? 1 : -1
        leg.rotation.x = Math.sin(state.phase) * LEG_SWING * state.gait * diagonal
      }
    }
  })

  return (
    <group>
      {spawns.map((spawn, index) => (
        <group
          key={spawn.key}
          ref={(el) => {
            rootRefs.current[index] = el
          }}
          position={[spawn.x, GROUND_Y, spawn.z]}
          rotation={[0, spawn.yaw, 0]}
        >
          <group
            ref={(el) => {
              bodyRefs.current[index] = el
            }}
          >
            <VoxelModelMesh model={models[index].body} />
          </group>
          {models[index].legs.map((leg, legIndex) => (
            <AnimalLegMesh
              key={legIndex}
              leg={leg}
              legRef={(el) => {
                legRefs.current[index][legIndex] = el
              }}
            />
          ))}
        </group>
      ))}
    </group>
  )
}

/** 進む方向のすぐ先に他の動物がいるか */
function blockedByOther(state: AnimalState, nextX: number, nextZ: number, all: AnimalState[]) {
  for (const other of all) {
    if (other === state) continue
    const gap = state.radius + other.radius + 0.15
    const before = Math.hypot(other.x - state.x, other.z - state.z)
    const after = Math.hypot(other.x - nextX, other.z - nextZ)
    // 近づく向きのときだけ止まる（離れる動きは邪魔しない）
    if (after < gap && after < before) return true
  }
  return false
}

function updateAnimal(state: AnimalState, model: AnimalModel, delta: number, all: AnimalState[]) {
  state.timer -= delta

  if (state.mode === 'idle') {
    state.gait = Math.max(0, state.gait - delta * 4)
    if (state.timer <= 0) {
      const target = pickTarget(state)
      if (!target) {
        state.timer = randomIn(1, 2.5)
        return
      }
      state.targetX = target.x
      state.targetZ = target.z
      state.mode = 'walk'
      // 迷ったまま歩き続けないよう上限時間
      state.timer = 20
    }
    return
  }

  const dx = state.targetX - state.x
  const dz = state.targetZ - state.z
  const distance = Math.hypot(dx, dz)
  if (distance < ARRIVE_DISTANCE || state.timer <= 0) {
    state.mode = 'idle'
    state.timer = randomIn(1.5, 6)
    return
  }

  // 目的地の方へ向きを変えながら、向きが合ってきたら前へ進む
  const desiredYaw = Math.atan2(dx, dz)
  const turn = wrapAngle(desiredYaw - state.yaw)
  const maxTurn = TURN_RATE * delta
  state.yaw = wrapAngle(state.yaw + Math.max(-maxTurn, Math.min(maxTurn, turn)))

  const facing = Math.max(0, Math.cos(turn))
  const step = Math.min(model.walkSpeed * delta * facing, distance)
  const nextX = state.x + Math.sin(state.yaw) * step
  const nextZ = state.z + Math.cos(state.yaw) * step

  // 障害物や他の動物にぶつかりそうなら、そこで立ち止まる。
  // 万一いま障害物に重なっていたら（出現時など）、抜け出せるよう障害物では止めない
  const stuck = !isFree(state.x, state.z, state.radius)
  const hitsObstacle = !stuck && !isFree(nextX, nextZ, state.radius)
  if (hitsObstacle || blockedByOther(state, nextX, nextZ, all)) {
    state.mode = 'idle'
    state.timer = randomIn(0.8, 2.5)
    return
  }
  state.x = nextX
  state.z = nextZ

  state.gait = Math.min(1, state.gait + delta * 4)
  state.phase += delta * model.strideRate * Math.max(0.35, facing)
}

/** 腰を支点に振る脚（脚本体＋ひづめ） */
function AnimalLegMesh({
  leg,
  legRef,
}: {
  leg: AnimalLeg
  legRef: (el: Group | null) => void
}) {
  const hoofHeight = Math.min(0.08, leg.length * 0.18)
  return (
    <group ref={legRef} position={leg.hip}>
      <mesh position={[0, -(leg.length - hoofHeight) / 2, 0]} castShadow>
        <boxGeometry args={[leg.width, leg.length - hoofHeight, leg.width]} />
        <meshStandardMaterial color={leg.color} roughness={0.88} metalness={0.04} />
      </mesh>
      <mesh position={[0, -leg.length + hoofHeight / 2, 0]} castShadow>
        <boxGeometry args={[leg.width + 0.01, hoofHeight, leg.width + 0.01]} />
        <meshStandardMaterial color={leg.hoofColor} roughness={0.8} metalness={0.04} />
      </mesh>
    </group>
  )
}
