/**
 * Jungle エリア床 — 草地に土の道。群れのいる場所は牧草（豚の場所は泥まじり）。
 * タイルは 1m ごとに1枚だけ置き、役割ごとに上面の高さを変える（重なりによるちらつきを防ぐ）。
 * 白い霜や黄色い花をマス単位でばらまくと浮くので置かない。
 * 冬（クリスマス期間）だけ、なめらかなノイズで雪の吹きだまりを作り、
 * 周りは「うっすら雪の草」で緑へなじませる。道は踏まれて溶けている想定。
 */
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D } from 'three'
import type { ParkZoneLayout } from './parkZones'
import { JUNGLE_HERDS, JUNGLE_PATHS } from './jungle/jungleConfig'

const scratch = new Object3D()
const TILE = 1
const TILE_H = 0.12

type FloorRole =
  | 'grass'
  | 'grassAlt'
  | 'grassLight'
  | 'pasture'
  | 'pastureAlt'
  | 'mud'
  | 'mudAlt'
  | 'path'
  | 'pathAlt'
  | 'snow'
  | 'snowShade'
  | 'snowGrass'
  | 'frame'

const ROLE_COLOR: Record<FloorRole, string> = {
  grass: '#2f5a2a',
  grassAlt: '#284f25',
  grassLight: '#3a6a32',
  pasture: '#3e6e30',
  pastureAlt: '#46783a',
  mud: '#5a4430',
  mudAlt: '#4c3a28',
  path: '#7a6448',
  pathAlt: '#6c583e',
  // 夜の雪（白すぎると浮くので少し沈める。外周の雪だまりと同じ色味）
  snow: '#b8c4d0',
  snowShade: '#a8b4c2',
  // うっすら雪がかかった草
  snowGrass: '#6e8270',
  frame: '#1e2a1c',
}

/** 役割ごとの上面の高さ（道は少し低く、牧草は少し高く） */
const ROLE_HEIGHT: Record<FloorRole, number> = {
  grass: TILE_H,
  grassAlt: TILE_H,
  grassLight: TILE_H,
  pasture: TILE_H * 1.06,
  pastureAlt: TILE_H * 1.06,
  mud: TILE_H * 0.94,
  mudAlt: TILE_H * 0.94,
  path: TILE_H * 0.88,
  pathAlt: TILE_H * 0.88,
  // 雪は少し積もって盛り上がる
  snow: TILE_H * 1.14,
  snowShade: TILE_H * 1.14,
  snowGrass: TILE_H * 1.04,
  frame: TILE_H,
}

function hash2(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/** 0〜1 の滑らかな値ノイズ（格子点ハッシュを双線形補間） */
function valueNoise(x: number, z: number) {
  const x0 = Math.floor(x)
  const z0 = Math.floor(z)
  const fx = x - x0
  const fz = z - z0
  const sx = fx * fx * (3 - 2 * fx)
  const sz = fz * fz * (3 - 2 * fz)
  const a = hash2(x0, z0)
  const b = hash2(x0 + 1, z0)
  const c = hash2(x0, z0 + 1)
  const d = hash2(x0 + 1, z0 + 1)
  return (a * (1 - sx) + b * sx) * (1 - sz) + (c * (1 - sx) + d * sx) * sz
}

/** 雪の吹きだまりの境目（これ未満が雪、次の閾値未満がうっすら雪の草） */
const SNOW_DEEP = 0.34
const SNOW_DUST = 0.46

/**
 * 冬の雪をのせる。草地・牧草はしっかり、泥浴び場は少なめ、道は縁にうっすらだけ。
 */
function applySnow(role: FloorRole, x: number, z: number): FloorRole {
  if (role === 'frame') return role
  const n = valueNoise(x * 0.16 + 7, z * 0.16 - 3) * 0.8 + hash2(x + 5, z - 13) * 0.2
  if (role === 'path' || role === 'pathAlt') {
    return n < SNOW_DEEP * 0.6 ? 'snowGrass' : role
  }
  if (role === 'mud' || role === 'mudAlt') {
    return n < SNOW_DEEP * 0.7 ? 'snowGrass' : role
  }
  if (n < SNOW_DEEP) return hash2(x * 3, z * 3) < 0.3 ? 'snowShade' : 'snow'
  if (n < SNOW_DUST) return 'snowGrass'
  return role
}

function herdAt(cx: number, cz: number) {
  return JUNGLE_HERDS.find(
    (p) => cx > p.minX && cx < p.maxX && cz > p.minZ && cz < p.maxZ,
  )
}

function roleAt(x: number, z: number, groundZ: number): FloorRole {
  const cx = x + 0.5
  const cz = z + 0.5
  const ax = Math.abs(cx)
  const az = Math.abs(cz - groundZ)
  if (ax > 22.2 || az > 22.2) return 'frame'

  const n = hash2(x, z)
  const herd = herdAt(cx, cz)
  if (herd) {
    if (herd.ground === 'mud') {
      // 泥と草のまだら
      const m = hash2(Math.floor(x / 2), Math.floor(z / 2))
      if (m < 0.55) return n < 0.5 ? 'mud' : 'mudAlt'
      return n < 0.5 ? 'pasture' : 'grassAlt'
    }
    return n < 0.35 ? 'pastureAlt' : 'pasture'
  }

  // 東西の大通りと中央の小道（縁は少し崩す）
  const onMain = Math.abs(cz - JUNGLE_PATHS.mainZ) <= JUNGLE_PATHS.mainHalf - (n < 0.2 ? 0.4 : 0)
  const onCross =
    Math.abs(cx - JUNGLE_PATHS.crossX) <= JUNGLE_PATHS.crossHalf - (n < 0.2 ? 0.4 : 0)
  if (onMain || onCross) return n < 0.4 ? 'pathAlt' : 'path'

  const patch = hash2(Math.floor(x / 3), Math.floor(z / 3))
  if (patch < 0.3) return 'grassAlt'
  if (patch > 0.75) return 'grassLight'
  return 'grass'
}

function FloorBatch({
  role,
  positions,
}: {
  role: FloorRole
  positions: Array<{ x: number; z: number }>
}) {
  const meshRef = useRef<InstancedMesh>(null)
  const color = useMemo(() => new Color(ROLE_COLOR[role]), [role])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const h = ROLE_HEIGHT[role]
    positions.forEach((pos, index) => {
      scratch.position.set(pos.x + TILE * 0.5, h * 0.5, pos.z + TILE * 0.5)
      scratch.scale.set(TILE * 0.98, h, TILE * 0.98)
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [positions, role])

  if (positions.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        roughness={role === 'mud' || role === 'mudAlt' ? 0.7 : role === 'snow' || role === 'snowShade' ? 0.85 : 0.94}
        metalness={0.02}
      />
    </instancedMesh>
  )
}

export function JungleDistrictGround({
  layout,
  christmas = false,
}: {
  layout: ParkZoneLayout
  /** 冬（クリスマス期間）は芝生に雪をのせる */
  christmas?: boolean
}) {
  const { groundZ, districtHalfX, districtHalfZ } = layout

  const batches = useMemo(() => {
    const byRole = new Map<FloorRole, Array<{ x: number; z: number }>>()
    const xMin = Math.floor(-districtHalfX)
    const xMax = Math.floor(districtHalfX) - 1
    const zMin = Math.floor(groundZ - districtHalfZ)
    const zMax = Math.floor(groundZ + districtHalfZ) - 1
    for (let x = xMin; x <= xMax; x += 1) {
      for (let z = zMin; z <= zMax; z += 1) {
        const base = roleAt(x, z, groundZ)
        const role = christmas ? applySnow(base, x, z) : base
        const list = byRole.get(role) ?? []
        list.push({ x, z })
        byRole.set(role, list)
      }
    }
    return byRole
  }, [christmas, districtHalfX, districtHalfZ, groundZ])

  return (
    <group>
      <mesh position={[0, -0.08, groundZ]} receiveShadow>
        <boxGeometry args={[districtHalfX * 2, 0.2, districtHalfZ * 2]} />
        <meshStandardMaterial color="#1c2a1a" roughness={0.95} />
      </mesh>
      {([...batches.entries()] as Array<[FloorRole, Array<{ x: number; z: number }>]>).map(
        ([role, positions]) => (
          <FloorBatch key={role} role={role} positions={positions} />
        ),
      )}
    </group>
  )
}
