/**
 * Culture 地区床 — 濃紺ベースのギャラリー／ランウェイ模様。
 * 中央帯はキャットウォーク風ストライプ、周囲はダイヤ格子。
 */
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D } from 'three'
import type { ParkZoneLayout } from './parkZones'

const scratch = new Object3D()
const TILE = 1
const TILE_H = 0.12

/** 床タイルの役割 */
type FloorRole = 'base' | 'baseAlt' | 'diamond' | 'runway' | 'runwayEdge' | 'accent' | 'frame'

const ROLE_COLOR: Record<FloorRole, string> = {
  base: '#1a2744',
  baseAlt: '#152038',
  diamond: '#243656',
  runway: '#3a5a88',
  runwayEdge: '#8eb4e8',
  accent: '#4a7ab8',
  frame: '#0e182c',
}

function hash2(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function roleAt(x: number, z: number, groundZ: number): FloorRole {
  const cx = x + 0.5
  const cz = z + 0.5 - groundZ
  const ax = Math.abs(cx)
  const az = Math.abs(cz)

  // 外周フレーム
  if (ax > 22.2 || az > 22.2) return 'frame'

  // 中央ランウェイ（NS）
  if (ax <= 1.15) {
    const stripe = Math.floor(cz + 40) % 2 === 0
    return stripe ? 'runway' : 'runwayEdge'
  }
  // ランウェイ縁取り
  if (ax <= 1.85) return 'runwayEdge'

  // 東西のギャラリー通路（やや明るい帯）
  if (az <= 1.4 && ax > 1.85) {
    return Math.floor(cx + 40) % 2 === 0 ? 'accent' : 'diamond'
  }

  // ダイヤ格子（市松＋斜め強調）
  const checker = (Math.floor(cx) + Math.floor(cz)) % 2 === 0
  const diamond = (Math.floor(cx + cz) + Math.floor(cx - cz)) % 4 === 0
  const n = hash2(x, z)

  if (diamond && n > 0.35) return 'diamond'
  if (checker) return n < 0.12 ? 'accent' : 'base'
  return n < 0.08 ? 'diamond' : 'baseAlt'
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
    positions.forEach((pos, index) => {
      scratch.position.set(pos.x + TILE * 0.5, TILE_H * 0.5, pos.z + TILE * 0.5)
      // ランウェイ帯はわずかに高く
      const h = role === 'runway' || role === 'runwayEdge' ? TILE_H * 1.15 : TILE_H
      scratch.scale.set(TILE * 0.97, h, TILE * 0.97)
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [positions, role])

  if (positions.length === 0) return null

  const emissive =
    role === 'runwayEdge' ? 0.22 : role === 'accent' ? 0.08 : role === 'runway' ? 0.06 : 0

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissive}
        roughness={role === 'runwayEdge' ? 0.45 : 0.88}
        metalness={role === 'runwayEdge' ? 0.35 : 0.12}
      />
    </instancedMesh>
  )
}

export function CultureDistrictGround({ layout }: { layout: ParkZoneLayout }) {
  const { groundZ, districtHalfX, districtHalfZ } = layout

  const batches = useMemo(() => {
    const byRole = new Map<FloorRole, Array<{ x: number; z: number }>>()
    const push = (role: FloorRole, x: number, z: number) => {
      const list = byRole.get(role) ?? []
      list.push({ x, z })
      byRole.set(role, list)
    }

    const xMin = Math.floor(-districtHalfX)
    const xMax = Math.floor(districtHalfX) - 1
    const zMin = Math.floor(groundZ - districtHalfZ)
    const zMax = Math.floor(groundZ + districtHalfZ) - 1

    for (let x = xMin; x <= xMax; x += 1) {
      for (let z = zMin; z <= zMax; z += 1) {
        push(roleAt(x, z, groundZ), x, z)
      }
    }

    return [...byRole.entries()].map(([role, positions]) => ({ role, positions }))
  }, [districtHalfX, districtHalfZ, groundZ])

  return (
    <group>
      {/* 下地の濃紺スラブ */}
      <mesh position={[0, -0.06, groundZ]} receiveShadow>
        <boxGeometry args={[districtHalfX * 2 + 0.4, 0.16, districtHalfZ * 2 + 0.4]} />
        <meshStandardMaterial color="#0c1424" roughness={0.95} />
      </mesh>
      {batches.map((batch) => (
        <FloorBatch key={batch.role} role={batch.role} positions={batch.positions} />
      ))}
      {/* ランウェイ中央の細い発光ライン */}
      <mesh position={[0, 0.14, groundZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, districtHalfZ * 1.7]} />
        <meshStandardMaterial
          color="#b8d4f8"
          emissive="#7ab0f0"
          emissiveIntensity={0.55}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>
    </group>
  )
}
