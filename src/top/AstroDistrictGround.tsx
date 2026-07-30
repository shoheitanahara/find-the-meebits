/**
 * Astro 地区床 — 暗い月面レゴリス＋金属パネル園路＋発光ライン。
 * 共通床骨格上に宇宙基地感を載せる。
 */
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D } from 'three'
import type { ParkZoneLayout } from './parkZones'

const scratch = new Object3D()
const TILE = 1
const TILE_H = 0.12

type FloorRole = 'regolith' | 'regolithAlt' | 'metal' | 'metalEdge' | 'glow' | 'crater' | 'frame'

const ROLE_COLOR: Record<FloorRole, string> = {
  regolith: '#1a1e2e',
  regolithAlt: '#141824',
  metal: '#2a3448',
  metalEdge: '#3a4a68',
  glow: '#5ce0ff',
  crater: '#0e121c',
  frame: '#0a0e18',
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

  if (ax > 22.2 || az > 22.2) return 'frame'

  // 中央南北の発光導線
  if (ax <= 0.55) return 'glow'
  if (ax <= 1.35) {
    const stripe = Math.floor(cz + 40) % 2 === 0
    return stripe ? 'metal' : 'metalEdge'
  }

  // 東西の横断導線
  if (az <= 0.55 && ax > 1.35) return 'glow'
  if (az <= 1.25 && ax > 1.35) return Math.floor(cx + 40) % 2 === 0 ? 'metalEdge' : 'metal'

  // クレーターっぽい暗い斑
  const n = hash2(x, z)
  if (n > 0.92 && ax > 4 && az > 3) return 'crater'

  const checker = (Math.floor(cx) + Math.floor(cz)) % 2 === 0
  if (checker) return n < 0.1 ? 'metal' : 'regolith'
  return n < 0.08 ? 'regolithAlt' : 'regolithAlt'
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
      const h =
        role === 'glow'
          ? TILE_H * 1.2
          : role === 'crater'
            ? TILE_H * 0.72
            : role === 'metal' || role === 'metalEdge'
              ? TILE_H * 1.08
              : TILE_H
      scratch.position.set(pos.x + TILE * 0.5, h * 0.5, pos.z + TILE * 0.5)
      scratch.scale.set(TILE * 0.97, h, TILE * 0.97)
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [positions, role])

  if (positions.length === 0) return null

  const emissive =
    role === 'glow' ? 0.85 : role === 'metalEdge' ? 0.18 : role === 'metal' ? 0.06 : 0

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissive}
        roughness={role === 'glow' ? 0.28 : role === 'metal' || role === 'metalEdge' ? 0.42 : 0.92}
        metalness={role === 'glow' ? 0.55 : role === 'metal' || role === 'metalEdge' ? 0.62 : 0.08}
      />
    </instancedMesh>
  )
}

function AstroProp({
  position,
  kind,
}: {
  position: [number, number, number]
  kind: 'beacon' | 'crate'
}) {
  if (kind === 'beacon') {
    return (
      <group position={position}>
        <mesh position={[0, 0.35, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.28, 0.7, 10]} />
          <meshStandardMaterial color="#243048" metalness={0.65} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.18, 12, 10]} />
          <meshStandardMaterial color="#5ce0ff" emissive="#5ce0ff" emissiveIntensity={1.2} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={position}>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.7, 0.55, 0.55]} />
        <meshStandardMaterial color="#2a3448" metalness={0.55} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.58, 0]}>
        <boxGeometry args={[0.55, 0.08, 0.4]} />
        <meshStandardMaterial color="#a878ff" emissive="#a878ff" emissiveIntensity={0.35} />
      </mesh>
    </group>
  )
}

export function AstroDistrictGround({ layout }: { layout: ParkZoneLayout }) {
  const { groundZ, districtHalfX, districtHalfZ, pathEdgeX, pathEdgeLength } = layout

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

    return byRole
  }, [districtHalfX, districtHalfZ, groundZ])

  return (
    <group>
      {/* 下地レゴリス */}
      <mesh position={[0, -0.08, groundZ]} receiveShadow>
        <boxGeometry args={[districtHalfX * 2, 0.2, districtHalfZ * 2]} />
        <meshStandardMaterial color="#12161f" roughness={0.95} />
      </mesh>

      {([...batches.entries()] as Array<[FloorRole, Array<{ x: number; z: number }>]>).map(
        ([role, positions]) => (
          <FloorBatch key={role} role={role} positions={positions} />
        ),
      )}

      {/* 園路縁の発光レール */}
      {([-1, 1] as const).map((side) => (
        <mesh key={`edge-${side}`} position={[side * pathEdgeX, 0.08, groundZ]} castShadow>
          <boxGeometry args={[0.12, 0.08, pathEdgeLength]} />
          <meshStandardMaterial
            color="#5ce0ff"
            emissive="#5ce0ff"
            emissiveIntensity={0.55}
            metalness={0.4}
            roughness={0.35}
          />
        </mesh>
      ))}

      <AstroProp position={[-11.5, 0, -2.5]} kind="beacon" />
      <AstroProp position={[11.8, 0, -2.8]} kind="beacon" />
      <AstroProp position={[-8.5, 0, 4.2]} kind="crate" />
      <AstroProp position={[8.2, 0, 4.5]} kind="crate" />
      <AstroProp position={[0, 0, 9.5]} kind="beacon" />
    </group>
  )
}
