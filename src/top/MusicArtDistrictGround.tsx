/**
 * Music & Art エリア床 — 深紫のラウンジ床＋波形センター帯＋ステージパッド。
 * 音楽と映像作品を楽しむ AV ラウンジの世界観。
 */
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D } from 'three'
import type { ParkZoneLayout } from './parkZones'

const scratch = new Object3D()
const TILE = 1
const TILE_H = 0.12

type FloorRole =
  | 'velvet'
  | 'velvetAlt'
  | 'stage'
  | 'stageEdge'
  | 'wave'
  | 'accent'
  | 'frame'
  | 'frost'

const ROLE_COLOR: Record<FloorRole, string> = {
  velvet: '#1c1228',
  velvetAlt: '#160e20',
  stage: '#3a2448',
  stageEdge: '#e85cff',
  wave: '#ff7ad9',
  accent: '#6a3a88',
  frame: '#0e0814',
  frost: '#e8d8f4',
}

function hash2(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function roleAt(x: number, z: number, groundZ: number, christmas: boolean): FloorRole {
  const cx = x + 0.5
  const cz = z + 0.5 - groundZ
  const ax = Math.abs(cx)
  const az = Math.abs(cz)

  if (ax > 22.2 || az > 22.2) return 'frame'

  // 中央の波形導線（NS）— 音楽のビート帯
  if (ax <= 0.55) return 'wave'
  if (ax <= 1.35) {
    const stripe = Math.floor(cz + 40) % 2 === 0
    return stripe ? 'stage' : 'stageEdge'
  }

  // 奥寄りに円形ステージパッド（聴取・上映の象徴）
  const stageR = Math.hypot(cx, cz + 4.5)
  if (stageR < 3.2) return stageR < 2.2 ? 'stage' : 'stageEdge'

  // 東西の横断通路
  if (az <= 0.55 && ax > 1.35) return 'wave'
  if (az <= 1.25 && ax > 1.35) {
    const frostEdge = hash2(x + 17, z - 9)
    if (christmas && frostEdge < 0.18) return 'frost'
    return Math.floor(cx + 40) % 2 === 0 ? 'accent' : 'stage'
  }

  const n = hash2(x, z)
  const frostPatch = hash2(x + 17, z - 9)
  if (christmas && frostPatch < 0.55 && ax > 1.6) return 'frost'

  const checker = (Math.floor(cx) + Math.floor(cz)) % 2 === 0
  if (checker) return n < 0.1 ? 'accent' : 'velvet'
  return n < 0.08 ? 'velvetAlt' : 'velvetAlt'
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
        role === 'wave'
          ? TILE_H * 1.22
          : role === 'stage' || role === 'stageEdge'
            ? TILE_H * 1.1
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
    role === 'wave' ? 0.75 : role === 'stageEdge' ? 0.35 : role === 'stage' ? 0.08 : 0

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissive}
        roughness={
          role === 'frost'
            ? 0.88
            : role === 'wave'
              ? 0.3
              : role === 'stage' || role === 'stageEdge'
                ? 0.42
                : 0.92
        }
        metalness={
          role === 'frost'
            ? 0.05
            : role === 'wave'
              ? 0.48
              : role === 'stage' || role === 'stageEdge'
                ? 0.35
                : 0.08
        }
      />
    </instancedMesh>
  )
}

/** スピーカー／ライトスタンドの簡易シルエット */
function MusicArtProp({
  position,
  kind,
}: {
  position: [number, number, number]
  kind: 'speaker' | 'stand'
}) {
  if (kind === 'speaker') {
    return (
      <group position={position}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.7, 1.1, 0.55]} />
          <meshStandardMaterial color="#1a1018" roughness={0.82} />
        </mesh>
        <mesh position={[0, 0.75, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 12]} />
          <meshStandardMaterial color="#2a1a28" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.4, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
          <meshStandardMaterial color="#2a1a28" roughness={0.7} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <boxGeometry args={[0.55, 0.08, 0.4]} />
          <meshStandardMaterial color="#e85cff" emissive="#e85cff" emissiveIntensity={0.45} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 1.4, 8]} />
        <meshStandardMaterial color="#2a1a28" metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color="#ffc46a" emissive="#ffc46a" emissiveIntensity={1.1} />
      </mesh>
    </group>
  )
}

export function MusicArtDistrictGround({
  layout,
  christmas = false,
}: {
  layout: ParkZoneLayout
  christmas?: boolean
}) {
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
        push(roleAt(x, z, groundZ, christmas), x, z)
      }
    }

    return byRole
  }, [christmas, districtHalfX, districtHalfZ, groundZ])

  return (
    <group>
      <mesh position={[0, -0.08, groundZ]} receiveShadow>
        <boxGeometry args={[districtHalfX * 2, 0.2, districtHalfZ * 2]} />
        <meshStandardMaterial color={christmas ? '#241830' : '#120a18'} roughness={0.95} />
      </mesh>

      {([...batches.entries()] as Array<[FloorRole, Array<{ x: number; z: number }>]>).map(
        ([role, positions]) => (
          <FloorBatch key={role} role={role} positions={positions} />
        ),
      )}

      {/* 園路縁のマゼンタレール */}
      {([-1, 1] as const).map((side) => (
        <mesh key={`edge-${side}`} position={[side * pathEdgeX, 0.08, groundZ]} castShadow>
          <boxGeometry args={[0.12, 0.08, pathEdgeLength]} />
          <meshStandardMaterial
            color="#e85cff"
            emissive="#e85cff"
            emissiveIntensity={0.55}
            metalness={0.4}
            roughness={0.35}
          />
        </mesh>
      ))}

      <MusicArtProp position={[-11.2, 0, -3.2]} kind="speaker" />
      <MusicArtProp position={[10.5, 0, 3.8]} kind="stand" />
      <MusicArtProp position={[9.8, 0, -5.5]} kind="speaker" />
    </group>
  )
}
