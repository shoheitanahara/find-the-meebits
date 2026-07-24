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
import { getMountainRuntime } from '../config'
import { getBlockTexture } from '../blockTextures'
import { useMountainStore } from '../store'

const scratch = new Object3D()

/** 柱インスタンスでソリッドなマイクラ風の山を描画 */
export function VoxelMountain() {
  const terrainVersion = useMountainStore((state) => state.terrainVersion)
  const runtime = getMountainRuntime()
  const { tops, shafts } = useMemo(
    () => splitColumns(runtime.columns),
    [terrainVersion, runtime.columns],
  )
  return (
    <group key={terrainVersion}>
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

      {/* ゴール旗 — 頂上平台の上。大きく発光させて見失いにくくする */}
      <group position={[runtime.pathCenterX(runtime.goalZ), runtime.goalY + 0.5, runtime.goalZ]}>
        <mesh position={[0, 4.5, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.16, 9, 8]} />
          <meshStandardMaterial color="#f0e4c8" />
        </mesh>
        <mesh position={[1.2, 8.2, 0]} castShadow>
          <boxGeometry args={[2.4, 1.6, 0.12]} />
          <meshStandardMaterial color="#ff3a28" emissive="#ff2a18" emissiveIntensity={1.1} />
        </mesh>
        <mesh position={[0, 9.4, 0]}>
          <sphereGeometry args={[0.45, 12, 12]} />
          <meshStandardMaterial color="#ffe08a" emissive="#ffcc55" emissiveIntensity={1.8} />
        </mesh>
        <pointLight position={[0, 9, 0]} color="#ff8855" intensity={28} distance={55} decay={2} />
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
    // スタート周辺（z≈16）までマグマパッチを伸ばし、落下ポイントを緑ではなく溶岩に
    for (let z = 22; z >= -290; z -= 2) {
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
    const pulse = 0.32 + Math.sin(t * 1.4) * 0.08
    if (lavaRef.current) {
      const mat = lavaRef.current.material as { emissiveIntensity?: number }
      if (mat.emissiveIntensity !== undefined) mat.emissiveIntensity = pulse
    }
  })

  return (
    <group>
      {/* 中心をスタート寄りにずらし、落下床がスタート地点まで続く */}
      <mesh position={[0, -5.5, -120]} receiveShadow>
        <boxGeometry args={[160, 4, 380]} />
        <meshStandardMaterial color="#030204" roughness={1} />
      </mesh>
      <mesh position={[0, -3.4, -120]} receiveShadow>
        <boxGeometry args={[156, 1.4, 376]} />
        <meshStandardMaterial color="#121014" roughness={0.98} />
      </mesh>
      <mesh ref={lavaRef} position={[0, -2.45, -120]} receiveShadow>
        <boxGeometry args={[154, 1.1, 374]} />
        <meshStandardMaterial
          color="#2a0608"
          emissive="#8a1818"
          emissiveIntensity={0.34}
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>
      <mesh position={[0, -1.88, -120]}>
        <boxGeometry args={[152, 0.08, 372]} />
        <meshStandardMaterial
          color="#5a1010"
          emissive="#a02018"
          emissiveIntensity={0.4}
          transparent
          opacity={0.42}
          depthWrite={false}
          roughness={0.9}
        />
      </mesh>
      <MagmaPatches cells={magmaCells} />
      <pointLight position={[0, -1.0, 10]} intensity={11} distance={36} color="#8a2018" />
      <pointLight position={[0, -1.0, -40]} intensity={9} distance={34} color="#7a1810" />
      <pointLight position={[6, -1.0, -90]} intensity={8} distance={32} color="#6a1410" />
      <pointLight position={[-5, -1.0, -120]} intensity={7} distance={30} color="#5a1010" />
      <pointLight position={[0, -1.0, -180]} intensity={6.5} distance={30} color="#4a0c0c" />
      <pointLight position={[0, -1.0, -240]} intensity={6} distance={28} color="#3a0808" />
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
        emissive="#7a1810"
        emissiveIntensity={0.42}
        roughness={0.88}
      />
    </instancedMesh>
  )
}

export function MountainAtmosphere() {
  return (
    <>
      <color attach="background" args={['#5a7a98']} />
      {/* far を伸ばし、約50層コース先のゴール旗が中盤からも見えるようにする */}
      <fog attach="fog" args={['#5a7a98', 55, 300]} />
      {/* 環境光を抑え、斜光で崖・穴の立体感を出す */}
      <ambientLight intensity={0.34} />
      <hemisphereLight args={['#c8d8ea', '#1a0808', 0.48]} />
      <directionalLight
        castShadow
        position={[42, 48, 18]}
        intensity={1.65}
        shadow-mapSize={[1536, 1536]}
        shadow-bias={-0.00035}
        shadow-normalBias={0.04}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-near={10}
        shadow-camera-far={220}
      />
    </>
  )
}
