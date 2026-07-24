/**
 * Mountain 地区床 — Mt. Meeb と同系の 1×1 ボクセルタイル（ニアレスト草・土・道）。
 */
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  type Texture,
} from 'three'
import { getBlockTexture, type BlockKind } from '../mountain/blockTextures'
import type { ParkZoneLayout } from './parkZones'

const scratch = new Object3D()
const TILE = 1
const TILE_H = 0.14

type FloorKind = Extract<BlockKind, 'grass' | 'dirt' | 'path' | 'stone' | 'gravel'>

function hash2(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function kindAt(x: number, z: number, groundZ: number, pathHalfX: number, pathHalfZ: number): FloorKind {
  const dx = Math.abs(x + 0.5)
  const dz = Math.abs(z + 0.5 - groundZ)
  const onPath = dx <= pathHalfX && dz <= pathHalfZ
  const onPathEdge = !onPath && dx <= pathHalfX + 1.2 && dz <= pathHalfZ + 0.8
  const n = hash2(x, z)

  if (onPath) {
    if (n < 0.12) return 'gravel'
    if (n < 0.22) return 'dirt'
    return 'path'
  }
  if (onPathEdge) {
    if (n < 0.35) return 'gravel'
    if (n < 0.55) return 'dirt'
    return 'grass'
  }
  if (n < 0.06) return 'stone'
  if (n < 0.14) return 'dirt'
  if (n < 0.2) return 'gravel'
  return 'grass'
}

function FloorBatch({
  kind,
  positions,
}: {
  kind: FloorKind
  positions: Array<{ x: number; z: number }>
}) {
  const meshRef = useRef<InstancedMesh>(null)
  const material = useMemo(() => {
    const face: 'top' | 'all' = kind === 'grass' ? 'top' : 'all'
    const map = getBlockTexture(kind, face) as Texture
    return new MeshStandardMaterial({
      map,
      roughness: kind === 'path' ? 0.92 : 0.96,
      metalness: 0.02,
    })
  }, [kind])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    positions.forEach((pos, index) => {
      scratch.position.set(pos.x + TILE * 0.5, TILE_H * 0.5, pos.z + TILE * 0.5)
      scratch.scale.set(TILE * 0.98, TILE_H, TILE * 0.98)
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [positions])

  if (positions.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} receiveShadow castShadow={false}>
      <boxGeometry args={[1, 1, 1]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  )
}

export function MountainVoxelGround({ layout }: { layout: ParkZoneLayout }) {
  const { groundZ, districtHalfX, districtHalfZ } = layout
  const pathHalfX = 3.5
  const pathHalfZ = Math.min(districtHalfZ - 1, layout.pathSizeZ * 0.42)

  const batches = useMemo(() => {
    const byKind = new Map<FloorKind, Array<{ x: number; z: number }>>()
    const push = (kind: FloorKind, x: number, z: number) => {
      const list = byKind.get(kind) ?? []
      list.push({ x, z })
      byKind.set(kind, list)
    }

    const xMin = -Math.floor(districtHalfX)
    const xMax = Math.floor(districtHalfX) - 1
    const zMin = Math.floor(groundZ - districtHalfZ)
    const zMax = Math.floor(groundZ + districtHalfZ) - 1

    for (let x = xMin; x <= xMax; x += 1) {
      for (let z = zMin; z <= zMax; z += 1) {
        push(kindAt(x, z, groundZ, pathHalfX, pathHalfZ), x, z)
      }
    }

    return (['grass', 'dirt', 'path', 'stone', 'gravel'] as const).map((kind) => ({
      kind,
      positions: byKind.get(kind) ?? [],
    }))
  }, [districtHalfX, districtHalfZ, groundZ, pathHalfX, pathHalfZ])

  return (
    <group>
      {/* 下地の暗い土盤（タイルの隙間を埋める） */}
      <mesh position={[0, -0.06, groundZ]} receiveShadow>
        <boxGeometry args={[districtHalfX * 2 + 0.5, 0.22, districtHalfZ * 2 + 0.5]} />
        <meshStandardMaterial color="#3a2a18" roughness={1} />
      </mesh>
      {batches.map((batch) => (
        <FloorBatch key={batch.kind} kind={batch.kind} positions={batch.positions} />
      ))}
    </group>
  )
}
