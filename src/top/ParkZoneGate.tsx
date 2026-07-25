import { Text } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh, Object3D } from 'three'
import type { ParkGateDef } from './parkZones'
import {
  blockKindFromTint,
  createBlockMaterial,
  VoxelBlockMat,
  type BlockKind,
} from './VoxelBlockMat'

const MOSS = '#6a7a58'
const MOSS_DARK = '#556348'
const STONE = '#7a7e78'
const STONE_LIGHT = '#8d918a'
const GRAVEL = '#6b6f68'
const DIRT = '#8b6914'
const DIRT_DARK = '#6e5210'
const SNOW = '#e8eef4'
const SNOW_BLUE = '#d5dee8'
const ACCENT = '#c4a060'
const WOOD = '#5a4030'
const GOLD = '#c9a24a'

/** マイクラ調の基本ボクセル辺長 */
const VOX = 0.5

const scratch = new Object3D()

type VoxelCell = {
  x: number
  y: number
  z: number
  color: string
}

/** ゾーン間ゲート（門柱＋アーチ＋看板） */
export function ParkZoneGate({
  gate,
  locale,
  onEnter,
}: {
  gate: ParkGateDef
  locale: 'en' | 'ja'
  onEnter: () => void
}) {
  const yaw = gate.yaw ?? 0

  return (
    <group
      position={[gate.x, 0, gate.z]}
      rotation={[0, yaw, 0]}
      onClick={(event) => {
        event.stopPropagation()
        onEnter()
      }}
    >
      {gate.theme === 'mountain' ? (
        <MountainPortalGate gate={gate} locale={locale} />
      ) : gate.theme === 'culture' ? (
        <CulturePortalGate gate={gate} locale={locale} />
      ) : (
        <PlazaReturnGate gate={gate} locale={locale} />
      )}
    </group>
  )
}

/**
 * プラザ側：マウンテンへの入口。
 * 単位ボクセルの積み上げ＋斜め向きで、入口だと直感できる。
 */
function MountainPortalGate({
  gate,
  locale,
}: {
  gate: ParkGateDef
  locale: 'en' | 'ja'
}) {
  // ローカル −X = 広場（接近）側、+X = 地区側
  const faceSign = -1
  const corridorHalf = gate.halfWidth * 0.52
  const rockZ = gate.halfWidth * 0.98

  return (
    <group>
      <ApproachPath faceSign={faceSign} length={1.1} width={corridorHalf * 2.05} />

      {/* 左右のボクセル岩塔 */}
      <VoxelRockTower position={[0.2 * faceSign, 0, -rockZ]} mirror={-1} />
      <VoxelRockTower position={[0.2 * faceSign, 0, rockZ]} mirror={1} />

      {/* アーチ梁（単位ボクセル） */}
      <VoxelArch halfSpan={gate.halfWidth * 0.72} height={3.35} />

      {/* ポータル面 */}
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[0.1, 3.1, corridorHalf * 2]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.55}
          transparent
          opacity={0.3}
        />
      </mesh>
      <pointLight
        position={[faceSign * 0.7, 2.1, 0]}
        color="#ffe2a8"
        intensity={1.4}
        distance={9}
        decay={2}
      />

      {/* 旗竿 */}
      {([-1, 1] as const).map((side) => (
        <group key={`flag-${side}`} position={[faceSign * 0.9, 0, side * (corridorHalf + 0.45)]}>
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 5.0, 8]} />
            <meshStandardMaterial color={GOLD} metalness={0.45} roughness={0.4} />
          </mesh>
          <mesh position={[faceSign * 0.55, 4.55, 0]} castShadow>
            <boxGeometry args={[1.05, 0.65, 0.06]} />
            <meshStandardMaterial
              color="#e85d4c"
              emissive="#e85d4c"
              emissiveIntensity={0.25}
              roughness={0.55}
            />
          </mesh>
        </group>
      ))}

      {([-1, 1] as const).map((side) => (
        <PortalLantern
          key={`lantern-${side}`}
          position={[faceSign * 1.55, 0, side * (corridorHalf + 0.1)]}
        />
      ))}

      {/* 看板（広場から読めるよう −X 向き） */}
      <group position={[faceSign * 0.55, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 5.15, 0]} castShadow>
          <boxGeometry args={[3.5, 0.95, 0.14]} />
          <meshStandardMaterial color="#1a1510" roughness={0.72} />
        </mesh>
        <mesh position={[0, 5.15, 0.09]}>
          <boxGeometry args={[3.25, 0.75, 0.04]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.14} roughness={0.5} />
        </mesh>
        <Text position={[0, 5.28, 0.14]} fontSize={0.26} color="#1a1208" anchorX="center" anchorY="middle">
          {gate.label[locale]}
        </Text>
        <Text position={[0, 4.98, 0.14]} fontSize={0.16} color="#3a2a10" anchorX="center" anchorY="middle">
          {gate.subtitle[locale]}
        </Text>
      </group>

      {/* 背後の尾根シルエット（地区側） */}
      <VoxelRidge position={[-faceSign * 1.35, 0, 0]} />
    </group>
  )
}

/** 単位ボクセルの山塔（段差・欠け・色むら） */
function VoxelRockTower({
  position,
  mirror,
}: {
  position: [number, number, number]
  mirror: -1 | 1
}) {
  const cells = buildRockTowerCells(mirror)
  return (
    <group position={position}>
      <VoxelMesh cells={cells} />
    </group>
  )
}

function buildRockTowerCells(mirror: -1 | 1): VoxelCell[] {
  const cells: VoxelCell[] = []
  const push = (ix: number, iy: number, iz: number, color: string) => {
    cells.push({
      x: (ix + 0.5) * VOX * mirror,
      y: (iy + 0.5) * VOX,
      z: (iz + 0.5) * VOX,
      color,
    })
  }

  // 層ごとの占有（粗いグリッド）。上が細い山型。
  const layers: Array<{ y: number; footprint: Array<[number, number, string]> }> = [
    {
      y: 0,
      footprint: [
        [-2, -2, DIRT], [-2, -1, DIRT_DARK], [-2, 0, DIRT], [-2, 1, DIRT],
        [-1, -2, DIRT], [-1, -1, DIRT], [-1, 0, DIRT_DARK], [-1, 1, DIRT], [-1, 2, GRAVEL],
        [0, -2, DIRT_DARK], [0, -1, DIRT], [0, 0, DIRT], [0, 1, DIRT], [0, 2, DIRT],
        [1, -1, DIRT], [1, 0, DIRT_DARK], [1, 1, DIRT], [1, 2, DIRT],
        [2, 0, GRAVEL], [2, 1, DIRT],
      ],
    },
    {
      y: 1,
      footprint: [
        [-2, -1, MOSS_DARK], [-2, 0, MOSS], [-2, 1, MOSS],
        [-1, -2, MOSS], [-1, -1, MOSS], [-1, 0, MOSS_DARK], [-1, 1, MOSS], [-1, 2, MOSS],
        [0, -2, MOSS_DARK], [0, -1, MOSS], [0, 0, MOSS], [0, 1, MOSS_DARK], [0, 2, GRAVEL],
        [1, -1, MOSS], [1, 0, MOSS], [1, 1, MOSS], [1, 2, MOSS_DARK],
        [2, 0, MOSS], [2, 1, MOSS],
      ],
    },
    {
      y: 2,
      footprint: [
        [-2, -1, MOSS], [-2, 0, STONE], [-2, 1, MOSS_DARK],
        [-1, -1, STONE], [-1, 0, MOSS], [-1, 1, STONE], [-1, 2, MOSS],
        [0, -1, MOSS_DARK], [0, 0, STONE], [0, 1, MOSS], [0, 2, STONE],
        [1, -1, STONE], [1, 0, MOSS], [1, 1, STONE_LIGHT],
        [2, 0, MOSS_DARK], [2, 1, STONE],
      ],
    },
    {
      y: 3,
      footprint: [
        [-1, -1, STONE], [-1, 0, STONE_LIGHT], [-1, 1, STONE],
        [0, -1, GRAVEL], [0, 0, STONE], [0, 1, STONE], [0, 2, STONE],
        [1, 0, STONE], [1, 1, GRAVEL], [1, 2, STONE_LIGHT],
        [2, 1, STONE],
      ],
    },
    {
      y: 4,
      footprint: [
        [-1, 0, STONE], [-1, 1, STONE_LIGHT],
        [0, 0, STONE], [0, 1, STONE], [0, 2, GRAVEL],
        [1, 0, STONE_LIGHT], [1, 1, STONE],
      ],
    },
    {
      y: 5,
      footprint: [
        [-1, 0, STONE],
        [0, 0, STONE_LIGHT], [0, 1, STONE],
        [1, 1, STONE],
      ],
    },
    {
      y: 6,
      footprint: [
        [0, 0, SNOW], [0, 1, SNOW_BLUE],
        [1, 0, SNOW],
      ],
    },
    {
      y: 7,
      footprint: [[0, 0, SNOW], [0, 1, SNOW]],
    },
  ]

  for (const layer of layers) {
    for (const [ix, iz, color] of layer.footprint) {
      push(ix, layer.y, iz, color)
    }
  }

  // 脇の小岩（足元のボリューム）
  const rubble: Array<[number, number, number, string]> = [
    [3, 0, 0, STONE],
    [3, 0, 1, GRAVEL],
    [3, 1, 0, STONE_LIGHT],
    [2, 0, -2, DIRT],
    [2, 1, -2, STONE],
    [-3, 0, 1, GRAVEL],
    [-3, 0, 0, STONE],
    [-3, 1, 1, MOSS_DARK],
  ]
  for (const [ix, iy, iz, color] of rubble) {
    push(ix, iy, iz, color)
  }

  return cells
}

function VoxelArch({ halfSpan, height }: { halfSpan: number; height: number }) {
  const cells: VoxelCell[] = []
  const zCount = Math.max(3, Math.round((halfSpan * 2) / VOX))
  const baseY = Math.round(height / VOX)
  const colors = [STONE, STONE_LIGHT, GRAVEL, MOSS_DARK]

  for (let iz = -Math.floor(zCount / 2); iz <= Math.floor(zCount / 2); iz++) {
    const color = colors[(iz + 20) % colors.length]
    cells.push({
      x: 0,
      y: (baseY + 0.5) * VOX,
      z: (iz + 0.5) * VOX,
      color,
    })
    cells.push({
      x: VOX * (iz % 2 === 0 ? 0.15 : -0.1),
      y: (baseY + 1.5) * VOX,
      z: (iz + 0.5) * VOX,
      color: iz % 3 === 0 ? MOSS : STONE,
    })
  }

  // アーチ上の雪帽
  for (let iz = -1; iz <= 1; iz++) {
    cells.push({
      x: 0,
      y: (baseY + 2.5) * VOX,
      z: (iz + 0.5) * VOX,
      color: iz === 0 ? SNOW : SNOW_BLUE,
    })
  }

  return <VoxelMesh cells={cells} />
}

function VoxelRidge({ position }: { position: [number, number, number] }) {
  const cells: VoxelCell[] = []
  const push = (ix: number, iy: number, iz: number, color: string) => {
    cells.push({
      x: (ix + 0.5) * VOX,
      y: (iy + 0.5) * VOX,
      z: (iz + 0.5) * VOX,
      color,
    })
  }

  for (let iz = -5; iz <= 5; iz++) {
    const peak = 4 + (Math.abs(iz) < 2 ? 2 : Math.abs(iz) < 4 ? 1 : 0)
    for (let iy = 0; iy < peak; iy++) {
      const color =
        iy >= peak - 1 ? SNOW : iy >= peak - 2 ? STONE_LIGHT : iy < 2 ? DIRT_DARK : STONE
      push(0, iy, iz, color)
      if (Math.abs(iz) < 4 && iy < peak - 1) {
        push(1, iy, iz, iy < 2 ? DIRT : GRAVEL)
      }
      if (Math.abs(iz) < 3 && iy < 3) {
        push(-1, iy, iz, MOSS_DARK)
      }
    }
  }

  return (
    <group position={position}>
      <VoxelMesh cells={cells} />
    </group>
  )
}

function VoxelMesh({ cells }: { cells: VoxelCell[] }) {
  const batches = useMemo(() => {
    const byKind = new Map<BlockKind, VoxelCell[]>()
    for (const cell of cells) {
      const kind = blockKindFromTint(cell.color)
      const list = byKind.get(kind) ?? []
      list.push(cell)
      byKind.set(kind, list)
    }
    return [...byKind.entries()].map(([kind, group]) => ({ kind, cells: group }))
  }, [cells])

  return (
    <group>
      {batches.map((batch) => (
        <VoxelKindBatch key={batch.kind} kind={batch.kind} cells={batch.cells} scale={VOX * 0.98} />
      ))}
    </group>
  )
}

function VoxelKindBatch({
  kind,
  cells,
  scale,
  thinY,
}: {
  kind: BlockKind
  cells: VoxelCell[]
  scale: number
  thinY?: number
}) {
  const meshRef = useRef<InstancedMesh>(null)
  const material = useMemo(() => {
    if (kind === 'grass') return createBlockMaterial('grass', 'top')
    return createBlockMaterial(kind)
  }, [kind])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const sy = thinY ?? scale
    cells.forEach((cell, index) => {
      scratch.position.set(cell.x, cell.y, cell.z)
      scratch.scale.set(scale, sy, scale)
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [cells, scale, thinY])

  if (cells.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, cells.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  )
}

function ApproachPath({
  faceSign,
  length,
  width,
}: {
  faceSign: number
  length: number
  width: number
}) {
  const batches = useMemo(() => {
    const tilesX = Math.round(length / VOX)
    const tilesZ = Math.max(3, Math.round(width / VOX))
    const cells: VoxelCell[] = []

    for (let ix = 0; ix < tilesX; ix++) {
      for (let iz = -Math.floor(tilesZ / 2); iz <= Math.floor(tilesZ / 2); iz++) {
        const checker = (ix + iz + 20) % 2 === 0
        cells.push({
          x: faceSign * (0.4 + (ix + 0.5) * VOX),
          y: VOX * 0.12,
          z: (iz + 0.5) * VOX * 0.92,
          color: checker ? '#7a7264' : '#635c50',
        })
      }
    }

    const byKind = new Map<BlockKind, VoxelCell[]>()
    for (const cell of cells) {
      const kind = blockKindFromTint(cell.color)
      const list = byKind.get(kind) ?? []
      list.push(cell)
      byKind.set(kind, list)
    }
    return [...byKind.entries()].map(([kind, group]) => ({ kind, cells: group }))
  }, [faceSign, length, width])

  return (
    <group>
      {batches.map((batch) => (
        <VoxelKindBatch
          key={batch.kind}
          kind={batch.kind}
          cells={batch.cells}
          scale={VOX * 0.96}
          thinY={VOX * 0.22}
        />
      ))}
    </group>
  )
}

function PortalLantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 2.1, 8]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.25, 0]} castShadow>
        <boxGeometry args={[0.42, 0.55, 0.42]} />
        <meshStandardMaterial
          color="#f0c878"
          emissive="#f0c878"
          emissiveIntensity={0.65}
          roughness={0.4}
        />
      </mesh>
      <pointLight position={[0, 2.25, 0]} color="#ffd9a0" intensity={0.85} distance={5} decay={2} />
    </group>
  )
}

/** プラザ側：カルチャー地区への入口（ギャラリーアーチ） */
function CulturePortalGate({
  gate,
  locale,
}: {
  gate: ParkGateDef
  locale: 'en' | 'ja'
}) {
  const faceSign = -1
  const pillarZ = gate.halfWidth * 0.88
  const accent = '#6a9ee8'
  const marble = '#2a4068'
  const marbleDark = '#152038'
  const highlight = '#8eb4e8'

  return (
    <group>
      <ApproachPath faceSign={faceSign} length={1.05} width={gate.halfWidth * 1.0} />

      {[-pillarZ, pillarZ].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 1.85, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.7, 3.7, 0.7]} />
            <meshStandardMaterial color={marbleDark} roughness={0.55} metalness={0.12} />
          </mesh>
          <mesh position={[0, 0.12, faceSign * 0.08]} castShadow>
            <boxGeometry args={[0.92, 0.24, 0.92]} />
            <meshStandardMaterial color={marble} roughness={0.45} />
          </mesh>
          <mesh position={[0, 3.85, 0]} castShadow>
            <boxGeometry args={[0.88, 0.28, 0.88]} />
            <meshStandardMaterial color={highlight} metalness={0.45} roughness={0.35} />
          </mesh>
          <mesh position={[0, 4.25, 0]} castShadow>
            <sphereGeometry args={[0.18, 12, 12]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.55}
              roughness={0.35}
            />
          </mesh>
        </group>
      ))}

      {/* アーチ梁 */}
      <mesh position={[0, 3.55, 0]} castShadow>
        <boxGeometry args={[0.5, 0.38, gate.halfWidth * 2.05]} />
        <meshStandardMaterial color="#0c1528" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.82, 0]} castShadow>
        <boxGeometry args={[0.36, 0.16, gate.halfWidth * 1.9]} />
        <meshStandardMaterial color={highlight} metalness={0.4} roughness={0.38} />
      </mesh>

      {/* ソフトなポータル光 */}
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[0.1, 3.2, gate.halfWidth * 1.5]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.5}
          transparent
          opacity={0.28}
        />
      </mesh>
      <pointLight
        position={[faceSign * 0.7, 2.2, 0]}
        color="#a8c8f0"
        intensity={1.55}
        distance={10}
        decay={2}
      />

      {([-1, 1] as const).map((side) => (
        <group key={side} position={[faceSign * 1.15, 0, side * (gate.halfWidth * 0.52)]}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 2.2, 8]} />
            <meshStandardMaterial color={marbleDark} roughness={0.6} />
          </mesh>
          <mesh position={[0, 2.35, 0]} castShadow>
            <boxGeometry args={[0.38, 0.48, 0.38]} />
            <meshStandardMaterial
              color="#d0e4ff"
              emissive={accent}
              emissiveIntensity={0.7}
              roughness={0.35}
            />
          </mesh>
          <pointLight position={[0, 2.35, 0]} color="#a8c8f0" intensity={0.7} distance={5} decay={2} />
        </group>
      ))}

      {/* 看板（広場から読めるよう −X 向き） */}
      <group position={[faceSign * 0.45, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <Text position={[0, 4.35, 0]} fontSize={0.24} color="#e8f0ff" anchorX="center" anchorY="middle">
          {gate.label[locale]}
        </Text>
        <Text position={[0, 4.0, 0]} fontSize={0.15} color={highlight} anchorX="center" anchorY="middle">
          {gate.subtitle[locale]}
        </Text>
      </group>
    </group>
  )
}

/** マウンテン側：広場へ戻る門 */
function PlazaReturnGate({
  gate,
  locale,
}: {
  gate: ParkGateDef
  locale: 'en' | 'ja'
}) {
  // ローカル +X = 現ゾーン（マウンテン）側。プレイヤーはこちらから近づく
  const faceSign = 1
  const pillarZ = gate.halfWidth * 0.85

  return (
    <group>
      {/* 門の足元だけ。長いアプローチは外周の橋に任せる */}
      <ApproachPath faceSign={faceSign} length={1.0} width={gate.halfWidth * 0.95} />

      {[-pillarZ, pillarZ].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 1.75, 0]} castShadow>
            <boxGeometry args={[0.65, 3.5, 0.65]} />
            <meshStandardMaterial color="#3a3530" roughness={0.82} />
          </mesh>
          <mesh position={[0, 3.65, 0]} castShadow>
            <boxGeometry args={[0.82, 0.32, 0.82]} />
            <meshStandardMaterial color={ACCENT} metalness={0.35} roughness={0.45} />
          </mesh>
          <mesh position={[0, 4.0, 0]} castShadow>
            <coneGeometry args={[0.22, 0.45, 8]} />
            <meshStandardMaterial color={GOLD} metalness={0.55} roughness={0.35} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 3.45, 0]} castShadow>
        <boxGeometry args={[0.55, 0.4, gate.halfWidth * 2.05]} />
        <meshStandardMaterial color="#2a2520" roughness={0.75} />
      </mesh>
      <mesh position={[0, 3.75, 0]} castShadow>
        <boxGeometry args={[0.4, 0.18, gate.halfWidth * 1.85]} />
        <meshStandardMaterial color={GOLD} metalness={0.4} roughness={0.4} />
      </mesh>

      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[0.1, 3.1, gate.halfWidth * 1.45]} />
        <meshStandardMaterial
          color={ACCENT}
          emissive={ACCENT}
          emissiveIntensity={0.4}
          transparent
          opacity={0.26}
        />
      </mesh>

      {([-1, 1] as const).map((side) => (
        <PortalLantern
          key={side}
          position={[faceSign * 1.2, 0, side * (gate.halfWidth * 0.55)]}
        />
      ))}

      <group
        position={[faceSign * 0.45, 0, 0]}
        rotation={[0, gate.id === 'culture-to-plaza' ? -Math.PI / 2 : Math.PI / 2, 0]}
      >
        <Text position={[0, 4.25, 0]} fontSize={0.26} color="#f5e6c8" anchorX="center" anchorY="middle">
          {gate.label[locale]}
        </Text>
        <Text position={[0, 3.9, 0]} fontSize={0.17} color={GOLD} anchorX="center" anchorY="middle">
          {gate.subtitle[locale]}
        </Text>
      </group>
    </group>
  )
}

/** 建設予定のランドマーク棟（足場・未完成躯体・看板） */
export function ComingSoonPad({
  position,
  locale,
  theme = 'mountain',
  title,
  subtitle,
}: {
  position: [number, number, number]
  locale: 'en' | 'ja'
  theme?: 'classic' | 'mountain' | 'culture'
  title?: { en: string; ja: string }
  subtitle?: { en: string; ja: string }
}) {
  const heading = locale === 'ja' ? '工事中' : 'UNDER CONSTRUCTION'
  const mountain = theme === 'mountain'
  const culture = theme === 'culture'
  const titleText = title?.[locale]
  const subtitleText = subtitle?.[locale]

  return (
    <group position={position}>
      {mountain ? (
        <MountainComingSoonShell />
      ) : culture ? (
        <CultureComingSoonShell />
      ) : (
        <ClassicComingSoonShell />
      )}
      <ComingSoonBarricade mountain={mountain} culture={culture} />
      <ComingSoonSignboard
        heading={heading}
        mountain={mountain}
        culture={culture}
        title={titleText}
        subtitle={subtitleText}
      />
      <pointLight
        position={[0, 3.2, 2.8]}
        intensity={culture ? 11 : mountain ? 8 : 10}
        distance={11}
        color={culture ? '#a8c8f0' : mountain ? '#ffb060' : '#ffd080'}
      />
    </group>
  )
}

function MountainComingSoonShell() {
  return (
    <group>
      {/* 石基壇 */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.36, 5.8]} />
        <VoxelBlockMat kind="dirt" />
      </mesh>
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <boxGeometry args={[5.8, 0.12, 5.2]} />
        <VoxelBlockMat kind="grass" face="top" />
      </mesh>

      {/* 未完成のボクセル躯体（高さムラ） */}
      {[
        { x: -1.6, z: -0.4, w: 2.6, h: 2.8, d: 2.4, kind: 'stone' as const },
        { x: 1.5, z: -0.6, w: 2.4, h: 3.6, d: 2.2, kind: 'darkStone' as const },
        { x: 0.1, z: -1.6, w: 2.0, h: 1.8, d: 1.6, kind: 'stone' as const },
        { x: -2.2, z: 1.0, w: 1.5, h: 1.4, d: 1.5, kind: 'grass' as const },
      ].map((b) => (
        <mesh key={`${b.x}-${b.z}`} position={[b.x, 0.45 + b.h * 0.5, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <VoxelBlockMat kind={b.kind} face={b.kind === 'grass' ? 'top' : 'all'} />
        </mesh>
      ))}
      {/* 雪っぽい頂部ブロック */}
      <mesh position={[1.5, 4.25, -0.6]} castShadow>
        <boxGeometry args={[1.6, 0.45, 1.4]} />
        <VoxelBlockMat kind="snow" />
      </mesh>

      {/* 足場 */}
      {[-2.6, 2.6].map((x) => (
        <group key={`scaffold-${x}`}>
          <mesh position={[x, 1.6, 1.6]} castShadow>
            <boxGeometry args={[0.14, 3.2, 0.14]} />
            <VoxelBlockMat kind="path" />
          </mesh>
          <mesh position={[x, 1.6, -1.8]} castShadow>
            <boxGeometry args={[0.14, 3.2, 0.14]} />
            <VoxelBlockMat kind="path" />
          </mesh>
          <mesh position={[x, 2.4, -0.1]} castShadow>
            <boxGeometry args={[0.12, 0.12, 3.5]} />
            <VoxelBlockMat kind="path" />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.45, 1.6]} castShadow>
        <boxGeometry args={[5.3, 0.1, 0.7]} />
        <VoxelBlockMat kind="path" />
      </mesh>
      {/* 青シートはそのまま（非ボクセル小物） */}
      <mesh position={[0.2, 3.1, 0.4]} rotation={[0.08, 0.2, -0.12]} castShadow>
        <boxGeometry args={[3.4, 0.06, 2.6]} />
        <meshStandardMaterial color="#3a6a9a" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* 資材箱 */}
      <mesh position={[-2.4, 0.55, 2.0]} castShadow>
        <boxGeometry args={[1.1, 0.7, 0.9]} />
        <VoxelBlockMat kind="dirt" />
      </mesh>
      <mesh position={[2.3, 0.45, 2.1]} castShadow>
        <boxGeometry args={[0.9, 0.55, 0.7]} />
        <VoxelBlockMat kind="dirt" />
      </mesh>
    </group>
  )
}

function ClassicComingSoonShell() {
  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.2, 0.32, 5.6]} />
        <meshStandardMaterial color="#8a8278" roughness={0.9} />
      </mesh>
      {/* 未完成の石壁 */}
      <mesh position={[-1.4, 1.6, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 2.8, 2.2]} />
        <meshStandardMaterial color="#6a6570" roughness={0.88} />
      </mesh>
      <mesh position={[1.6, 1.2, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 2.0, 2.4]} />
        <meshStandardMaterial color="#4a4552" roughness={0.86} />
      </mesh>
      <mesh position={[0, 2.85, -0.6]} castShadow>
        <boxGeometry args={[2.2, 0.35, 2.0]} />
        <meshStandardMaterial color="#c4a060" metalness={0.35} roughness={0.45} />
      </mesh>
      {/* 柱の足場 */}
      {[-2.5, 2.5].flatMap((x) =>
        [-2.0, 1.8].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 1.7, z]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 3.2, 8]} />
            <meshStandardMaterial color="#8a7050" roughness={0.8} />
          </mesh>
        )),
      )}
      <mesh position={[0, 2.6, 1.8]} castShadow>
        <boxGeometry args={[5.2, 0.12, 0.55]} />
        <meshStandardMaterial color="#c4a060" metalness={0.25} roughness={0.55} />
      </mesh>
      <mesh position={[0.3, 3.2, 0.2]} rotation={[0.05, -0.15, 0.08]} castShadow>
        <boxGeometry args={[3.2, 0.05, 2.4]} />
        <meshStandardMaterial color="#7a4538" roughness={0.75} />
      </mesh>
    </group>
  )
}

/** カルチャー地区の工事棟（濃紺ギャラリー躯体＋ランウェイ基壇） */
function CultureComingSoonShell() {
  const marble = '#2a4068'
  const accent = '#6a9ee8'
  const highlight = '#8eb4e8'
  const scaffold = '#3a5070'

  return (
    <group>
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.28, 5.8]} />
        <meshStandardMaterial color="#152038" roughness={0.85} />
      </mesh>
      {/* ランウェイ風の細い基壇 */}
      <mesh position={[0, 0.32, 1.4]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.18, 4.2]} />
        <meshStandardMaterial color={marble} roughness={0.4} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.42, 1.4]} receiveShadow>
        <boxGeometry args={[1.7, 0.06, 3.8]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.22}
          roughness={0.45}
        />
      </mesh>

      {/* 未完成ギャラリー壁 */}
      <mesh position={[-1.5, 1.7, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 3.0, 2.0]} />
        <meshStandardMaterial color="#1a2a48" roughness={0.72} />
      </mesh>
      <mesh position={[1.6, 1.35, -0.6]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.3, 2.2]} />
        <meshStandardMaterial color="#0e1a30" roughness={0.78} />
      </mesh>
      <mesh position={[0.1, 3.05, -0.7]} castShadow>
        <boxGeometry args={[2.0, 0.28, 1.8]} />
        <meshStandardMaterial color={highlight} metalness={0.4} roughness={0.4} />
      </mesh>

      {/* 足場 */}
      {[-2.55, 2.55].flatMap((x) =>
        [-1.9, 1.7].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 1.75, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 3.3, 8]} />
            <meshStandardMaterial color={scaffold} roughness={0.75} />
          </mesh>
        )),
      )}
      <mesh position={[0, 2.7, 1.7]} castShadow>
        <boxGeometry args={[5.2, 0.1, 0.5]} />
        <meshStandardMaterial color={highlight} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0.2, 3.3, 0.15]} rotation={[0.06, 0.12, -0.08]} castShadow>
        <boxGeometry args={[3.3, 0.05, 2.5]} />
        <meshStandardMaterial color="#1a3858" roughness={0.7} />
      </mesh>
      {/* 資材箱 */}
      <mesh position={[-2.3, 0.5, 2.1]} castShadow>
        <boxGeometry args={[1.0, 0.65, 0.8]} />
        <meshStandardMaterial color="#1e304c" roughness={0.85} />
      </mesh>
      <mesh position={[2.2, 0.42, 2.15]} castShadow>
        <boxGeometry args={[0.85, 0.5, 0.7]} />
        <meshStandardMaterial color="#152848" roughness={0.85} />
      </mesh>
    </group>
  )
}

function ComingSoonBarricade({
  mountain,
  culture = false,
}: {
  mountain: boolean
  culture?: boolean
}) {
  const stripe = culture ? '#6a9ee8' : mountain ? '#c4a060' : '#c9a24a'
  const post = culture ? '#1a2a48' : mountain ? '#5a4030' : '#3a3530'
  return (
    <group position={[0, 0, 2.85]}>
      {[-2.4, -0.8, 0.8, 2.4].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]} castShadow>
          <boxGeometry args={[0.12, 1.1, 0.12]} />
          <meshStandardMaterial color={post} roughness={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[5.2, 0.22, 0.1]} />
        <meshStandardMaterial color={stripe} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[5.2, 0.22, 0.1]} />
        <meshStandardMaterial color="#1a1510" roughness={0.75} />
      </mesh>
    </group>
  )
}

function ComingSoonSignboard({
  heading,
  mountain,
  culture = false,
  title,
  subtitle,
}: {
  heading: string
  mountain: boolean
  culture?: boolean
  title?: string
  subtitle?: string
}) {
  const accent = culture ? '#6a9ee8' : mountain ? '#c4a060' : '#c9a24a'
  const hasDetail = Boolean(title)
  return (
    <group position={[0, 0, 3.35]}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 2.2, 8]} />
        <meshStandardMaterial color="#8a7050" roughness={0.85} />
      </mesh>
      <mesh position={[0, hasDetail ? 2.65 : 2.45, 0.05]} castShadow>
        <boxGeometry args={[2.9, hasDetail ? 2.15 : 1.55, 0.14]} />
        <meshStandardMaterial color="#1a1510" roughness={0.7} />
      </mesh>
      <mesh position={[0, hasDetail ? 2.65 : 2.45, 0.13]}>
        <boxGeometry args={[2.65, hasDetail ? 1.9 : 1.3, 0.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.14} roughness={0.52} />
      </mesh>
      <Text
        position={[0, hasDetail ? 3.2 : 2.45, 0.18]}
        fontSize={0.24}
        color="#1a1208"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.4}
        textAlign="center"
      >
        {heading}
      </Text>
      {title ? (
        <Text
          position={[0, 2.7, 0.18]}
          fontSize={0.18}
          color="#1a1208"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.4}
          textAlign="center"
        >
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text
          position={[0, 2.35, 0.18]}
          fontSize={0.13}
          color="#2a2018"
          anchorX="center"
          anchorY="middle"
          maxWidth={2.45}
          textAlign="center"
        >
          {subtitle}
        </Text>
      ) : null}
    </group>
  )
}
