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
import { getClimbTheme } from '../climbTheme'
import { createNeonBlockMaterial } from '../neonBlockMaterials'
import { useMountainStore } from '../store'

const scratch = new Object3D()

/** 柱インスタンスでソリッドな山を描画（meeb=マイクラ / neon=テトリス） */
export function VoxelMountain() {
  const terrainVersion = useMountainStore((state) => state.terrainVersion)
  const theme = getClimbTheme()
  const runtime = getMountainRuntime()
  const { tops, shafts } = useMemo(
    () => splitColumns(runtime.columns),
    [terrainVersion, runtime.columns],
  )
  const flag = theme.flag

  return (
    <group key={`${theme.id}-${terrainVersion}`}>
      {theme.voidMode === 'abyss' ? <NeonAbyssVoid /> : <MinecraftVoid />}
      {theme.id === 'neon' ? <NeonSparkles /> : null}

      {shafts.map((group) => (
        <TexturedColumnBatch
          key={`shaft-${group.kind}`}
          kind={group.kind}
          mode="shaft"
          positions={group.positions}
          neon={theme.id === 'neon'}
        />
      ))}
      {tops.map((group) => (
        <TexturedColumnBatch
          key={`top-${group.kind}`}
          kind={group.kind}
          mode="top"
          positions={group.positions}
          neon={theme.id === 'neon'}
        />
      ))}

      {/* ゴール旗 — 頂上平台の上 */}
      <group position={[runtime.pathCenterX(runtime.goalZ), runtime.goalY + 0.5, runtime.goalZ]}>
        <mesh position={[0, 2.4, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 4.8, 8]} />
          <meshStandardMaterial color={flag.pole} />
        </mesh>
        <mesh position={[0.65, 4.35, 0]} castShadow>
          <boxGeometry args={[1.3, 0.85, 0.08]} />
          <meshStandardMaterial
            color={flag.cloth}
            emissive={flag.clothEmissive}
            emissiveIntensity={theme.id === 'neon' ? 1.4 : 1.0}
          />
        </mesh>
        <mesh position={[0, 5.0, 0]}>
          <sphereGeometry args={[0.22, 12, 12]} />
          <meshStandardMaterial
            color={flag.tip}
            emissive={flag.tipEmissive}
            emissiveIntensity={theme.id === 'neon' ? 2.0 : 1.5}
          />
        </mesh>
        <pointLight
          position={[0, 4.8, 0]}
          color={flag.light}
          intensity={theme.id === 'neon' ? 18 : 14}
          distance={theme.id === 'neon' ? 36 : 32}
          decay={2}
        />
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

function createMeebBlockMaterial(kind: BlockKind, mode: 'top' | 'shaft'): Material | Material[] {
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
  neon,
}: {
  kind: BlockKind
  mode: 'top' | 'shaft'
  positions: BatchPos[]
  neon: boolean
}) {
  const meshRef = useRef<InstancedMesh>(null)
  const material = useMemo(
    () => (neon ? createNeonBlockMaterial(kind, mode) : createMeebBlockMaterial(kind, mode)),
    [kind, mode, neon],
  )

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
      <pointLight position={[0, -1.0, -90]} intensity={8} distance={32} color="#6a1410" />
      <pointLight position={[-5, -1.0, -120]} intensity={7} distance={30} color="#5a1010" />
      <pointLight position={[0, -1.0, -180]} intensity={6.5} distance={30} color="#4a0c0c" />
      <pointLight position={[0, -1.0, -240]} intensity={6} distance={28} color="#3a0808" />
    </group>
  )
}

/** 暗黒奈落 — マグマではなく深い虚無＋薄いネオンの亀裂 */
function NeonAbyssVoid() {
  const veilRef = useRef<Mesh>(null)

  const riftCells = useMemo(() => {
    const cells: { x: number; z: number; shade: number }[] = []
    for (let z = 22; z >= -290; z -= 3) {
      for (let x = -26; x <= 26; x += 3) {
        const n = Math.abs((x * 19 + z * 29) % 11)
        if (n > 3) continue
        cells.push({ x, z, shade: n / 11 })
      }
    }
    return cells
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (veilRef.current) {
      const mat = veilRef.current.material as { emissiveIntensity?: number; opacity?: number }
      if (mat.emissiveIntensity !== undefined) {
        mat.emissiveIntensity = 0.28 + Math.sin(t * 0.9) * 0.06
      }
      if (mat.opacity !== undefined) {
        mat.opacity = 0.34 + Math.sin(t * 0.7) * 0.05
      }
    }
  })

  return (
    <group>
      <mesh position={[0, -6.2, -120]} receiveShadow>
        <boxGeometry args={[170, 5, 390]} />
        <meshStandardMaterial color="#080414" roughness={1} />
      </mesh>
      <mesh position={[0, -3.6, -120]} receiveShadow>
        <boxGeometry args={[160, 1.6, 380]} />
        <meshStandardMaterial color="#120820" roughness={1} />
      </mesh>
      <mesh ref={veilRef} position={[0, -2.2, -120]}>
        <boxGeometry args={[156, 0.2, 376]} />
        <meshStandardMaterial
          color="#1a1030"
          emissive="#5a28b8"
          emissiveIntensity={0.28}
          transparent
          opacity={0.34}
          depthWrite={false}
          roughness={0.95}
        />
      </mesh>
      <AbyssRifts cells={riftCells} />
      {/* 奈落側の補助光 */}
      <pointLight position={[0, -1.2, 8]} intensity={9} distance={36} color="#9a68f0" />
      <pointLight position={[8, -1.2, -50]} intensity={8} distance={34} color="#68d8f8" />
      <pointLight position={[-6, -1.2, -110]} intensity={7} distance={32} color="#f068d0" />
      <pointLight position={[0, -1.2, -180]} intensity={6.5} distance={32} color="#8860e0" />
      <pointLight position={[0, -1.2, -250]} intensity={5.5} distance={30} color="#5a4890" />
      {/* コース側のキー／フィル（ブロックを照らして発色させる） */}
      <pointLight position={[0, 14, 8]} intensity={48} distance={70} color="#ffffff" />
      <pointLight position={[12, 18, -40]} intensity={38} distance={60} color="#e8d8ff" />
      <pointLight position={[-12, 18, -90]} intensity={36} distance={58} color="#d0f0ff" />
      <pointLight position={[0, 20, -150]} intensity={34} distance={60} color="#f0e0ff" />
      <pointLight position={[0, 20, -220]} intensity={30} distance={56} color="#d8c0f8" />
      <pointLight position={[0, 24, -70]} intensity={32} distance={80} color="#ffd0f8" />
      <pointLight position={[8, 12, -20]} intensity={22} distance={40} color="#a8f0ff" />
      <pointLight position={[-8, 12, -120]} intensity={20} distance={40} color="#ffb0e8" />
    </group>
  )
}

/** コース沿いの軽いきらめき（点数少なめ・1マテリアル） */
function NeonSparkles() {
  const meshRef = useRef<InstancedMesh>(null)
  const matRef = useRef<MeshStandardMaterial>(null)

  const sparks = useMemo(() => {
    const list: { x: number; y: number; z: number; s: number }[] = []
    for (let i = 0; i < 90; i += 1) {
      const z = 12 - i * 3.2
      const side = i % 2 === 0 ? 1 : -1
      const x = side * (6 + (i % 5) * 1.4) + ((i * 17) % 7) - 3
      const y = 4 + (i % 6) * 1.8 + ((i * 13) % 5) * 0.35
      list.push({
        x,
        y,
        z,
        s: 0.08 + (i % 4) * 0.04,
      })
    }
    return list
  }, [])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    sparks.forEach((spark, index) => {
      scratch.position.set(spark.x, spark.y, spark.z)
      scratch.scale.setScalar(spark.s)
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [sparks])

  useFrame((state) => {
    const mat = matRef.current
    if (!mat) return
    const t = state.clock.elapsedTime
    mat.emissiveIntensity = 0.85 + Math.sin(t * 2.4) * 0.35
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, sparks.length]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        ref={matRef}
        color="#fff0ff"
        emissive="#ffb0f0"
        emissiveIntensity={1}
        transparent
        opacity={0.85}
        depthWrite={false}
        roughness={0.35}
      />
    </instancedMesh>
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

function AbyssRifts({ cells }: { cells: { x: number; z: number; shade: number }[] }) {
  const meshRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    cells.forEach((cell, index) => {
      scratch.position.set(cell.x, -1.95, cell.z)
      scratch.scale.set(1.2 + cell.shade, 0.08, 2.4 + cell.shade * 2)
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
        color="#0a0418"
        emissive="#7a3cff"
        emissiveIntensity={0.55}
        roughness={0.7}
        transparent
        opacity={0.75}
      />
    </instancedMesh>
  )
}

export function MountainAtmosphere() {
  const theme = getClimbTheme()
  const a = theme.atmosphere
  return (
    <>
      <color attach="background" args={[a.background]} />
      <fog attach="fog" args={[a.fog, a.fogNear, a.fogFar]} />
      <ambientLight intensity={a.ambient} />
      <hemisphereLight args={[a.hemiSky, a.hemiGround, a.hemiIntensity]} />
      <directionalLight
        castShadow
        position={[42, 48, 18]}
        intensity={a.sunIntensity}
        color={a.sunColor}
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
