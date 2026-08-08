import type { FishKindId, FishShadowSize } from '../config'
import { getFishKind } from '../config'

type Voxel = { x: number; y: number; z: number; sx: number; sy: number; sz: number; color?: string }

const UNIT = 0.12

function scaleFor(shadow: FishShadowSize) {
  if (shadow === 'tiny') return 0.55
  if (shadow === 'small') return 0.75
  if (shadow === 'medium') return 1
  if (shadow === 'large') return 1.35
  return 1.75
}

/** 普通の魚シルエット（体・尾・ヒレ・目） */
function fishVoxels(body: string, fin: string): Voxel[] {
  return [
    { x: 0, y: 0, z: 0, sx: 3, sy: 2, sz: 5, color: body },
    { x: 0, y: 0.1, z: -2.6, sx: 1.2, sy: 1.6, sz: 1.4, color: body },
    { x: 0, y: 0, z: 2.8, sx: 0.6, sy: 2.2, sz: 1.6, color: fin },
    { x: 0, y: 1.3, z: 0.2, sx: 0.4, sy: 1.2, sz: 1.6, color: fin },
    { x: 0, y: -1.1, z: 0.4, sx: 0.4, sy: 0.8, sz: 1.2, color: fin },
    { x: 0.9, y: 0.45, z: -1.6, sx: 0.35, sy: 0.35, sz: 0.35, color: '#101820' },
    { x: -0.9, y: 0.45, z: -1.6, sx: 0.35, sy: 0.35, sz: 0.35, color: '#101820' },
  ]
}

/** エイ */
function rayVoxels(body: string): Voxel[] {
  return [
    { x: 0, y: 0, z: 0, sx: 6, sy: 0.7, sz: 5, color: body },
    { x: 0, y: 0, z: 3.2, sx: 0.7, sy: 0.5, sz: 3, color: body },
    { x: 0, y: 0.35, z: -1.4, sx: 1.2, sy: 0.5, sz: 1.2, color: '#2a2030' },
  ]
}

/** シュモク */
function hammerVoxels(body: string): Voxel[] {
  return [
    { x: 0, y: 0, z: 0.4, sx: 2.4, sy: 2.2, sz: 6, color: body },
    { x: 0, y: 0.3, z: -3.2, sx: 5.2, sy: 1.2, sz: 1.4, color: body },
    { x: 0, y: 0, z: 3.6, sx: 0.8, sy: 2.4, sz: 1.8, color: '#4a5868' },
    { x: 0, y: 1.5, z: 0, sx: 0.5, sy: 1.4, sz: 2, color: '#4a5868' },
    { x: 2.2, y: 0.35, z: -3.2, sx: 0.4, sy: 0.4, sz: 0.4, color: '#101820' },
    { x: -2.2, y: 0.35, z: -3.2, sx: 0.4, sy: 0.4, sz: 0.4, color: '#101820' },
  ]
}

/** ホオジロ */
function whiteVoxels(body: string): Voxel[] {
  return [
    { x: 0, y: 0, z: 0, sx: 3.2, sy: 2.6, sz: 7, color: body },
    { x: 0, y: -0.4, z: -0.2, sx: 2.6, sy: 1.4, sz: 5, color: '#f4f0e8' },
    { x: 0, y: 0, z: 4, sx: 0.9, sy: 2.8, sz: 2, color: '#9aa8b8' },
    { x: 0, y: 1.8, z: 0.5, sx: 0.5, sy: 1.8, sz: 2.4, color: '#9aa8b8' },
    { x: 1.2, y: 0.5, z: -2.4, sx: 0.4, sy: 0.4, sz: 0.4, color: '#101820' },
    { x: -1.2, y: 0.5, z: -2.4, sx: 0.4, sy: 0.4, sz: 0.4, color: '#101820' },
  ]
}

function voxelsFor(id: FishKindId, color: string): Voxel[] {
  if (id === 'ray') return rayVoxels(color)
  if (id === 'hammerhead') return hammerVoxels(color)
  if (id === 'greatWhite') return whiteVoxels(color)
  const fin = '#2a3848'
  return fishVoxels(color, fin)
}

type VoxelFishProps = {
  fishId: FishKindId
  /** 追加スケール */
  scale?: number
}

/**
 * 箱積みのボクセル魚。種類でシルエットを変える（サメは別型）。
 */
export function VoxelFish({ fishId, scale = 1 }: VoxelFishProps) {
  const kind = getFishKind(fishId)
  const voxels = voxelsFor(fishId, kind.color)
  const s = UNIT * scaleFor(kind.shadow) * scale

  return (
    <group>
      {voxels.map((v, i) => (
        <mesh
          key={i}
          position={[v.x * s, v.y * s, v.z * s]}
          castShadow
        >
          <boxGeometry args={[v.sx * s, v.sy * s, v.sz * s]} />
          <meshStandardMaterial
            color={v.color ?? kind.color}
            roughness={0.55}
            metalness={0.08}
          />
        </mesh>
      ))}
    </group>
  )
}
