import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  type Material,
} from 'three'
import type { BlockKind, VoxelColumn } from '../config'
import { MOUNTAIN, MOUNTAIN_COLUMNS } from '../config'
import { getBlockTexture } from '../blockTextures'

const scratch = new Object3D()

/** 柱インスタンスでソリッドなマイクラ風の山を描画 */
export function VoxelMountain() {
  const { tops, shafts } = useMemo(() => splitColumns(MOUNTAIN_COLUMNS), [])

  return (
    <group>
      <mesh position={[0, -0.35, 14]} receiveShadow>
        <boxGeometry args={[22, 0.7, 12]} />
        <meshStandardMaterial color="#5a8f48" roughness={1} />
      </mesh>

      <MinecraftVoid />

      {shafts.map((group) => (
        <TexturedColumnBatch
          key={`shaft-${group.kind}`}
          kind={group.kind}
          mode="shaft"
          positions={group.positions}
        />
      ))}
      {tops.map((group) => (
        <TexturedColumnBatch
          key={`top-${group.kind}`}
          kind={group.kind}
          mode="top"
          positions={group.positions}
        />
      ))}

      <group position={[0, MOUNTAIN.goalY + 2.5, MOUNTAIN.goalZ]}>
        <mesh position={[0, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 2.2, 8]} />
          <meshStandardMaterial color="#d8c8a0" />
        </mesh>
        <mesh position={[0.5, 1.85, 0]} castShadow>
          <boxGeometry args={[1.0, 0.65, 0.08]} />
          <meshStandardMaterial color="#e85d4c" emissive="#e85d4c" emissiveIntensity={0.4} />
        </mesh>
      </group>
    </group>
  )
}

type BatchPos = { x: number; z: number; h: number; shaftH: number }

function splitColumns(columns: VoxelColumn[]) {
  const topMap = new Map<BlockKind, BatchPos[]>()
  const shaftMap = new Map<BlockKind, BatchPos[]>()

  for (const col of columns) {
    const shaftH = Math.max(0, col.h - 1)
    const topKind = col.kind
    const shaftKind: BlockKind =
      col.kind === 'grass' || col.kind === 'path' || col.kind === 'sand' || col.kind === 'snow'
        ? col.kind === 'snow'
          ? 'stone'
          : col.kind === 'sand'
            ? 'sand'
            : 'dirt'
        : col.kind

    const topList = topMap.get(topKind) ?? []
    topList.push({ x: col.x, z: col.z, h: col.h, shaftH })
    topMap.set(topKind, topList)

    if (shaftH > 0.05) {
      const shaftList = shaftMap.get(shaftKind) ?? []
      shaftList.push({ x: col.x, z: col.z, h: col.h, shaftH })
      shaftMap.set(shaftKind, shaftList)
    }
  }

  return {
    tops: [...topMap.entries()].map(([kind, positions]) => ({ kind, positions })),
    shafts: [...shaftMap.entries()].map(([kind, positions]) => ({ kind, positions })),
  }
}

function createBlockMaterial(kind: BlockKind, mode: 'top' | 'shaft'): Material | Material[] {
  if (kind === 'grass' && mode === 'top') {
    const top = getBlockTexture('grass', 'top')
    const side = getBlockTexture('grass', 'side')
    const dirt = getBlockTexture('dirt')
    return [
      new MeshStandardMaterial({ map: side, roughness: 0.92 }),
      new MeshStandardMaterial({ map: side, roughness: 0.92 }),
      new MeshStandardMaterial({ map: top, roughness: 0.88 }),
      new MeshStandardMaterial({ map: dirt, roughness: 0.95 }),
      new MeshStandardMaterial({ map: side, roughness: 0.92 }),
      new MeshStandardMaterial({ map: side, roughness: 0.92 }),
    ]
  }

  const face = kind === 'grass' ? 'side' : 'all'
  const map = getBlockTexture(kind === 'grass' ? 'dirt' : kind, face === 'side' ? 'side' : 'all')
  return new MeshStandardMaterial({ map, roughness: kind === 'sand' ? 0.98 : 0.9 })
}

function TexturedColumnBatch({
  kind,
  mode,
  positions,
}: {
  kind: BlockKind
  mode: 'top' | 'shaft'
  positions: BatchPos[]
}) {
  const meshRef = useRef<InstancedMesh>(null)
  const material = useMemo(() => createBlockMaterial(kind, mode), [kind, mode])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    positions.forEach((pos, index) => {
      if (mode === 'top') {
        scratch.position.set(pos.x, pos.h - 0.5, pos.z)
        scratch.scale.set(1, 1, 1)
      } else {
        scratch.position.set(pos.x, pos.shaftH / 2, pos.z)
        scratch.scale.set(1, Math.max(pos.shaftH, 0.01), 1)
      }
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
      scratch.scale.set(1, 1, 1)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [mode, positions])

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, positions.length]}
      castShadow
      receiveShadow
      material={material}
    >
      <boxGeometry args={[1, 1, 1]} />
    </instancedMesh>
  )
}

function MinecraftVoid() {
  const lavaRef = useRef<Mesh>(null)

  const magmaCells = useMemo(() => {
    const cells: { x: number; z: number; shade: number }[] = []
    for (let z = 6; z >= -148; z -= 2) {
      for (let x = -28; x <= 28; x += 2) {
        const n = Math.abs((x * 17 + z * 31) % 7)
        if (n > 4) continue
        cells.push({ x, z, shade: n / 7 })
      }
    }
    return cells
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pulse = 0.18 + Math.sin(t * 1.4) * 0.05
    if (lavaRef.current) {
      const mat = lavaRef.current.material as { emissiveIntensity?: number }
      if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = pulse
    }
  })

  return (
    <group>
      <mesh position={[0, -5.5, -65]} receiveShadow>
        <boxGeometry args={[160, 4, 220]} />
        <meshStandardMaterial color="#030204" roughness={1} />
      </mesh>
      <mesh position={[0, -3.4, -65]} receiveShadow>
        <boxGeometry args={[156, 1.4, 216]} />
        <meshStandardMaterial color="#121014" roughness={0.98} />
      </mesh>
      <mesh ref={lavaRef} position={[0, -2.45, -65]} receiveShadow>
        <boxGeometry args={[154, 1.1, 214]} />
        <meshStandardMaterial
          color="#2a0608"
          emissive="#6a1010"
          emissiveIntensity={0.2}
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>
      <mesh position={[0, -1.88, -65]}>
        <boxGeometry args={[152, 0.08, 212]} />
        <meshStandardMaterial
          color="#4a0c0c"
          emissive="#8a1810"
          emissiveIntensity={0.25}
          transparent
          opacity={0.35}
          depthWrite={false}
          roughness={0.9}
        />
      </mesh>
      <MagmaPatches cells={magmaCells} />
      <pointLight position={[0, -1.2, -40]} intensity={6} distance={28} color="#5a1010" />
      <pointLight position={[6, -1.2, -90]} intensity={5} distance={26} color="#4a0c0c" />
      <pointLight position={[-5, -1.2, -120]} intensity={4.5} distance={24} color="#3a0808" />
    </group>
  )
}

function MagmaPatches({ cells }: { cells: { x: number; z: number; shade: number }[] }) {
  const meshRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    cells.forEach((cell, index) => {
      const y = -1.82 + (cell.shade > 0.45 ? 0.08 : 0)
      scratch.position.set(cell.x, y, cell.z)
      scratch.scale.set(1.85, 0.22, 1.85)
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
      scratch.scale.set(1, 1, 1)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [cells])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cells.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color="#1e0506"
        emissive="#5a1210"
        emissiveIntensity={0.28}
        roughness={0.88}
      />
    </instancedMesh>
  )
}

export function MountainAtmosphere() {
  return (
    <>
      <color attach="background" args={['#6a90b0']} />
      <fog attach="fog" args={['#6a6064', 40, 130]} />
      <ambientLight intensity={0.62} />
      <hemisphereLight args={['#d0e0f0', '#2a1010', 0.75]} />
      <directionalLight
        castShadow
        position={[28, 55, 22]}
        intensity={1.25}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
      />
    </>
  )
}
