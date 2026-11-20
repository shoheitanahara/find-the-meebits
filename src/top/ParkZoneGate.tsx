import { Text } from '../world/WorldText'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh, Object3D } from 'three'
import { PARK_GROUND_Z, type ParkGateDef } from './parkZones'
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

/**
 * 看板を裏返す（ローカル +X 向きにする）か。
 * 既定の看板はローカル −X を向く。読ませたい向きは
 * - 東西の門: エリアの内側（プレイヤーが近づいてくる側）
 * - 手前・奥の門: カメラ側（+Z）
 * 門の位置と yaw から判定するので、新しい門を足しても個別指定は要らない。
 */
export function shouldFlipGateSign(gate: Pick<ParkGateDef, 'x' | 'z' | 'yaw'>) {
  const yaw = gate.yaw ?? 0
  // ローカル −X をワールドへ（Three.js の Y 回転）
  const faceX = -Math.cos(yaw)
  const faceZ = Math.sin(yaw)
  const isSideGate = Math.abs(gate.x) > Math.abs(gate.z - PARK_GROUND_Z)
  const wantX = isSideGate ? -Math.sign(gate.x) : 0
  const wantZ = isSideGate ? 0 : 1
  return faceX * wantX + faceZ * wantZ < 0
}

/** ゾーン間ゲート（門柱＋アーチ＋看板） */
export function ParkZoneGate({
  gate,
  locale,
}: {
  gate: ParkGateDef
  locale: 'en' | 'ja'
}) {
  const yaw = gate.yaw ?? 0

  return (
    <group position={[gate.x, 0, gate.z]} rotation={[0, yaw, 0]}>
      {gate.theme === 'mountain' ? (
        <MountainPortalGate gate={gate} locale={locale} />
      ) : gate.theme === 'culture' ? (
        <CulturePortalGate gate={gate} locale={locale} />
      ) : gate.theme === 'sea' ? (
        <SeaPortalGate gate={gate} locale={locale} />
      ) : gate.theme === 'astro' ? (
        <AstroPortalGate gate={gate} locale={locale} />
      ) : gate.theme === 'musicArt' ? (
        <MusicArtPortalGate gate={gate} locale={locale} />
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
  // ローカル −X = 広場（接近）側、+X = エリア側
  const faceSign = -1
  const corridorHalf = gate.halfWidth * 0.52
  const rockZ = gate.halfWidth * 0.98
  const flipSign = shouldFlipGateSign(gate)
  const signFaceSign = flipSign ? -faceSign : faceSign
  const signRotationY = flipSign ? Math.PI / 2 : -Math.PI / 2

  return (
    <group>
      <ApproachPath faceSign={faceSign} length={1.1} width={corridorHalf * 2.05} />

      {/* 左右のボクセル岩塔 */}
      <VoxelRockTower position={[0.2 * faceSign, 0, -rockZ]} mirror={-1} />
      <VoxelRockTower position={[0.2 * faceSign, 0, rockZ]} mirror={1} />

      {/* アーチ梁（単位ボクセル） */}
      <VoxelArch halfSpan={gate.halfWidth * 0.72} height={3.35} />

      {/* 通路の先が見通せるよう、門の中に膜（半透明の板）は張らない */}
      <pointLight
        position={[faceSign * 0.7, 2.1, 0]}
        color="#ffe2a8"
        intensity={1.4}
        distance={9}
        decay={2}
      />

      {/* Astro帰還門は本体だけ反転し、既存看板のワールド向き・位置を維持する。 */}
      <group position={[signFaceSign * 0.55, 0, 0]} rotation={[0, signRotationY, 0]}>
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

      {/* 背後の尾根シルエット（エリア側）。通路の幅だけ谷にして先を見通せるようにする */}
      <VoxelRidge position={[-faceSign * 1.35, 0, 0]} gapHalf={corridorHalf + 0.15} />
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

/**
 * 門の背後の尾根。gapHalf（m）より内側は空けて、通路の先が見える谷間にする。
 * 谷の縁がいちばん高く、外へ行くほど低くなる。
 */
function VoxelRidge({
  position,
  gapHalf,
}: {
  position: [number, number, number]
  gapHalf: number
}) {
  const cells: VoxelCell[] = []
  const push = (ix: number, iy: number, iz: number, color: string) => {
    cells.push({
      x: (ix + 0.5) * VOX,
      y: (iy + 0.5) * VOX,
      z: (iz + 0.5) * VOX,
      color,
    })
  }

  for (let iz = -6; iz <= 5; iz++) {
    const z = Math.abs((iz + 0.5) * VOX)
    if (z < gapHalf) continue
    const fromGap = z - gapHalf
    const peak = 4 + (fromGap < 0.5 ? 2 : fromGap < 1.0 ? 1 : 0)
    for (let iy = 0; iy < peak; iy++) {
      const color =
        iy >= peak - 1 ? SNOW : iy >= peak - 2 ? STONE_LIGHT : iy < 2 ? DIRT_DARK : STONE
      push(0, iy, iz, color)
      // 谷の縁ほど厚く
      if (fromGap < 1.0 && iy < peak - 1) {
        push(1, iy, iz, iy < 2 ? DIRT : GRAVEL)
      }
      if (fromGap < 0.5 && iy < 3) {
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

/** プラザ側：カルチャーエリアへの入口（ギャラリーアーチ） */
function CulturePortalGate({
  gate,
  locale,
}: {
  gate: ParkGateDef
  locale: 'en' | 'ja'
}) {
  const faceSign = -1
  // 看板の向きは門の位置と yaw から自動で決める
  const flipSign = shouldFlipGateSign(gate)
  const signFaceSign = flipSign ? -faceSign : faceSign
  const signRotationY = flipSign ? Math.PI / 2 : -Math.PI / 2
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

      {/* 看板：通常は −X（接近側）。一部門は +X（エリア内側からの接近）向き */}
      <group position={[signFaceSign * 0.45, 0, 0]} rotation={[0, signRotationY, 0]}>
        <Text position={[0, 4.85, 0]} fontSize={0.24} color="#e8f0ff" anchorX="center" anchorY="middle">
          {gate.label[locale]}
        </Text>
        <Text position={[0, 4.45, 0]} fontSize={0.15} color={highlight} anchorX="center" anchorY="middle">
          {gate.subtitle[locale]}
        </Text>
      </group>
    </group>
  )
}

/** プラザ側：シーエリアへの入口（木の桟橋門） */
function SeaPortalGate({
  gate,
  locale,
}: {
  gate: ParkGateDef
  locale: 'en' | 'ja'
}) {
  const faceSign = -1
  const pillarZ = gate.halfWidth * 0.88
  const wood = '#8a6a48'
  const woodDark = '#5a4030'
  const sand = '#d2b48c'
  const accent = '#f0c878'
  const foam = '#a8d8e8'

  return (
    <group>
      <ApproachPath faceSign={faceSign} length={1.05} width={gate.halfWidth * 1.0} />

      {[-pillarZ, pillarZ].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.6, 3.4, 0.6]} />
            <meshStandardMaterial color={woodDark} roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.12, faceSign * 0.08]} castShadow>
            <boxGeometry args={[0.85, 0.24, 0.85]} />
            <meshStandardMaterial color={sand} roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.55, 0]} castShadow>
            <boxGeometry args={[0.78, 0.28, 0.78]} />
            <meshStandardMaterial color={wood} roughness={0.8} />
          </mesh>
          <mesh position={[0, 3.95, 0]} castShadow>
            <sphereGeometry args={[0.16, 10, 10]} />
            <meshStandardMaterial color={foam} emissive={foam} emissiveIntensity={0.35} roughness={0.4} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 3.4, 0]} castShadow>
        <boxGeometry args={[0.45, 0.32, gate.halfWidth * 2.05]} />
        <meshStandardMaterial color={woodDark} roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.65, 0]} castShadow>
        <boxGeometry args={[0.32, 0.14, gate.halfWidth * 1.9]} />
        <meshStandardMaterial color={accent} metalness={0.25} roughness={0.45} />
      </mesh>

      <mesh position={[0, 1.7, 0]}>
        <boxGeometry args={[0.1, 3.1, gate.halfWidth * 1.45]} />
        <meshStandardMaterial
          color={foam}
          emissive={foam}
          emissiveIntensity={0.4}
          transparent
          opacity={0.26}
        />
      </mesh>
      <pointLight
        position={[faceSign * 0.7, 2.1, 0]}
        color="#c8e8f8"
        intensity={1.35}
        distance={10}
        decay={2}
      />

      <group position={[faceSign * 0.45, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <Text position={[0, 4.25, 0]} fontSize={0.24} color="#f5e6c8" anchorX="center" anchorY="middle">
          {gate.label[locale]}
        </Text>
        <Text position={[0, 3.9, 0]} fontSize={0.15} color={accent} anchorX="center" anchorY="middle">
          {gate.subtitle[locale]}
        </Text>
      </group>
    </group>
  )
}

/** Astro エリアへの入口（エアロック風ポータル） */
function AstroPortalGate({
  gate,
  locale,
}: {
  gate: ParkGateDef
  locale: 'en' | 'ja'
}) {
  const faceSign = -1
  const pillarZ = gate.halfWidth * 0.88
  const accent = '#5ce0ff'
  const purple = '#a878ff'
  const hull = '#1a2234'
  const hullDark = '#0e1422'
  const panel = '#2a3448'

  return (
    <group>
      <ApproachPath faceSign={faceSign} length={1.05} width={gate.halfWidth * 1.05} />

      {[-pillarZ, pillarZ].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 1.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.68, 3.8, 0.68]} />
            <meshStandardMaterial color={hullDark} roughness={0.42} metalness={0.62} />
          </mesh>
          <mesh position={[0, 0.14, faceSign * 0.06]} castShadow>
            <boxGeometry args={[0.9, 0.28, 0.9]} />
            <meshStandardMaterial color={panel} roughness={0.4} metalness={0.55} />
          </mesh>
          <mesh position={[0, 3.95, 0]} castShadow>
            <boxGeometry args={[0.82, 0.24, 0.82]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.4}
              metalness={0.55}
              roughness={0.32}
            />
          </mesh>
          <mesh position={[0, 4.35, 0]} castShadow>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial
              color={purple}
              emissive={purple}
              emissiveIntensity={0.75}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 3.6, 0]} castShadow>
        <boxGeometry args={[0.48, 0.34, gate.halfWidth * 2.05]} />
        <meshStandardMaterial color={hull} roughness={0.45} metalness={0.58} />
      </mesh>
      <mesh position={[0, 3.88, 0]} castShadow>
        <boxGeometry args={[0.32, 0.14, gate.halfWidth * 1.9]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.45}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[0.12, 3.3, gate.halfWidth * 1.55]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.65}
          transparent
          opacity={0.32}
        />
      </mesh>
      <pointLight
        position={[faceSign * 0.7, 2.2, 0]}
        color="#7ae8ff"
        intensity={1.5}
        distance={9}
        decay={2}
      />

      <group position={[faceSign * 0.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 5.05, 0]} castShadow>
          <boxGeometry args={[3.5, 0.95, 0.14]} />
          <meshStandardMaterial color="#0a101c" roughness={0.7} />
        </mesh>
        <mesh position={[0, 5.05, 0.09]}>
          <boxGeometry args={[3.25, 0.75, 0.04]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.2}
            roughness={0.45}
          />
        </mesh>
        <Text position={[0, 5.18, 0.14]} fontSize={0.24} color="#061018" anchorX="center" anchorY="middle">
          {gate.label[locale]}
        </Text>
        <Text position={[0, 4.88, 0.14]} fontSize={0.15} color="#102030" anchorX="center" anchorY="middle">
          {gate.subtitle[locale]}
        </Text>
      </group>
    </group>
  )
}

/** Music & Art 側：マゼンタのアーチ＋アンバー球 */
function MusicArtPortalGate({
  gate,
  locale,
}: {
  gate: ParkGateDef
  locale: 'en' | 'ja'
}) {
  const faceSign = -1
  const pillarZ = gate.halfWidth * 0.88
  const accent = '#e85cff'
  const amber = '#ffc46a'
  const hull = '#241830'
  const hullDark = '#140818'
  const panel = '#3a2448'

  return (
    <group>
      <ApproachPath faceSign={faceSign} length={1.05} width={gate.halfWidth * 1.05} />

      {[-pillarZ, pillarZ].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <mesh position={[0, 1.9, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.68, 3.8, 0.68]} />
            <meshStandardMaterial color={hullDark} roughness={0.55} metalness={0.35} />
          </mesh>
          <mesh position={[0, 0.14, faceSign * 0.06]} castShadow>
            <boxGeometry args={[0.9, 0.28, 0.9]} />
            <meshStandardMaterial color={panel} roughness={0.5} metalness={0.3} />
          </mesh>
          <mesh position={[0, 3.95, 0]} castShadow>
            <boxGeometry args={[0.82, 0.24, 0.82]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.45}
              metalness={0.4}
              roughness={0.35}
            />
          </mesh>
          <mesh position={[0, 4.35, 0]} castShadow>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshStandardMaterial
              color={amber}
              emissive={amber}
              emissiveIntensity={0.85}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 3.6, 0]} castShadow>
        <boxGeometry args={[0.48, 0.34, gate.halfWidth * 2.05]} />
        <meshStandardMaterial color={hull} roughness={0.5} metalness={0.35} />
      </mesh>
      <mesh position={[0, 3.88, 0]} castShadow>
        <boxGeometry args={[0.32, 0.14, gate.halfWidth * 1.9]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.5}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[0.12, 3.3, gate.halfWidth * 1.55]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.7}
          transparent
          opacity={0.34}
        />
      </mesh>
      <pointLight
        position={[faceSign * 0.7, 2.2, 0]}
        color="#ff9ae0"
        intensity={1.45}
        distance={9}
        decay={2}
      />

      <group position={[faceSign * 0.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 5.05, 0]} castShadow>
          <boxGeometry args={[3.5, 0.95, 0.14]} />
          <meshStandardMaterial color="#120814" roughness={0.7} />
        </mesh>
        <mesh position={[0, 5.05, 0.09]}>
          <boxGeometry args={[3.25, 0.75, 0.04]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.22}
            roughness={0.45}
          />
        </mesh>
        <Text position={[0, 5.18, 0.14]} fontSize={0.22} color="#180818" anchorX="center" anchorY="middle">
          {gate.label[locale]}
        </Text>
        <Text position={[0, 4.88, 0.14]} fontSize={0.14} color="#2a1020" anchorX="center" anchorY="middle">
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

      <group
        position={[faceSign * 0.45, 0, 0]}
        // 看板の向きは門の位置と yaw から自動で決める（東西＝エリア内側、手前・奥＝カメラ側）
        rotation={[0, shouldFlipGateSign(gate) ? Math.PI / 2 : -Math.PI / 2, 0]}
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
  theme?: 'classic' | 'mountain' | 'culture' | 'sea' | 'astro' | 'musicArt'
  title?: { en: string; ja: string }
  subtitle?: { en: string; ja: string }
}) {
  const heading = locale === 'ja' ? '工事中' : 'UNDER CONSTRUCTION'
  const mountain = theme === 'mountain'
  const culture = theme === 'culture'
  const sea = theme === 'sea'
  const astro = theme === 'astro'
  const musicArt = theme === 'musicArt'
  const titleText = title?.[locale]
  const subtitleText = subtitle?.[locale]
  const variant =
    title?.en === 'LUNAR LAB' ? 'lab' : title?.en === 'ORBITAL PORT' ? 'port' : 'dome'

  return (
    <group position={position}>
      {mountain ? (
        <MountainComingSoonShell />
      ) : culture ? (
        <CultureComingSoonShell />
      ) : sea ? (
        <SeaComingSoonShell />
      ) : astro ? (
        <AstroComingSoonShell variant={variant} />
      ) : musicArt ? (
        <MusicArtComingSoonShell />
      ) : (
        <ClassicComingSoonShell />
      )}
      <ComingSoonBarricade
        mountain={mountain}
        culture={culture}
        sea={sea}
        astro={astro}
        musicArt={musicArt}
      />
      <ComingSoonSignboard
        heading={heading}
        mountain={mountain}
        culture={culture}
        sea={sea}
        astro={astro}
        musicArt={musicArt}
        title={titleText}
        subtitle={subtitleText}
      />
      {astro ? null : (
        <pointLight
          position={[0, 3.2, 2.8]}
          intensity={sea ? 10 : culture || musicArt ? 11 : mountain ? 8 : 10}
          distance={11}
          color={
            sea
              ? '#c8e8f8'
              : musicArt
                ? '#ff9ae0'
                : culture
                  ? '#a8c8f0'
                  : mountain
                    ? '#ffb060'
                    : '#ffd080'
          }
        />
      )}
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

/** カルチャーエリアの工事棟（濃紺ギャラリー躯体＋ランウェイ基壇） */
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

/** シーエリアの工事棟（砂の基壇＋木の躯体） */
function SeaComingSoonShell() {
  const sand = '#d2b48c'
  const wood = '#8a6a48'
  const woodDark = '#5a4030'
  const foam = '#a8d8e8'

  return (
    <group>
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.28, 5.8]} />
        <meshStandardMaterial color="#b89868" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.32, 1.2]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.16, 3.8]} />
        <meshStandardMaterial color={wood} roughness={0.82} />
      </mesh>
      <mesh position={[-1.5, 1.55, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 2.7, 2.0]} />
        <meshStandardMaterial color={woodDark} roughness={0.85} />
      </mesh>
      <mesh position={[1.55, 1.2, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 2.0, 2.2]} />
        <meshStandardMaterial color="#6e5238" roughness={0.86} />
      </mesh>
      <mesh position={[0.1, 2.85, -0.6]} castShadow>
        <boxGeometry args={[2.0, 0.26, 1.8]} />
        <meshStandardMaterial color={sand} roughness={0.9} />
      </mesh>
      {[-2.5, 2.5].flatMap((x) =>
        [-1.9, 1.7].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 1.7, z]} castShadow>
            <cylinderGeometry args={[0.08, 0.1, 3.2, 8]} />
            <meshStandardMaterial color={wood} roughness={0.8} />
          </mesh>
        )),
      )}
      <mesh position={[0, 2.6, 1.7]} castShadow>
        <boxGeometry args={[5.2, 0.1, 0.5]} />
        <meshStandardMaterial color={foam} emissive={foam} emissiveIntensity={0.12} roughness={0.55} />
      </mesh>
      <mesh position={[0.2, 3.2, 0.2]} rotation={[0.05, -0.12, 0.06]} castShadow>
        <boxGeometry args={[3.2, 0.05, 2.4]} />
        <meshStandardMaterial color="#3a6a88" roughness={0.7} />
      </mesh>
    </group>
  )
}

/** Astro 工事中シェル。中央ドーム / 西ラボ / 東ポートでシルエットを変える。 */
function AstroComingSoonShell({ variant }: { variant: 'dome' | 'lab' | 'port' }) {
  const hull = '#1a2234'
  const hullDark = '#0e1422'
  const panel = '#2a3448'
  const accent = '#5ce0ff'
  const purple = '#a878ff'

  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 0.32, 5.8]} />
        <meshStandardMaterial color={hullDark} roughness={0.55} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.38, 0]} receiveShadow>
        <boxGeometry args={[5.8, 0.1, 5.2]} />
        <meshStandardMaterial color={panel} roughness={0.45} metalness={0.55} />
      </mesh>

      {variant === 'dome' ? (
        <>
          <mesh position={[0, 1.6, -0.4]} castShadow receiveShadow>
            <cylinderGeometry args={[2.2, 2.4, 2.4, 16]} />
            <meshStandardMaterial color={hull} roughness={0.42} metalness={0.62} />
          </mesh>
          <mesh position={[0, 3.15, -0.4]} castShadow>
            <sphereGeometry args={[1.55, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.25}
              transparent
              opacity={0.55}
              roughness={0.25}
              metalness={0.4}
            />
          </mesh>
          <mesh position={[0, 0.85, 1.5]} castShadow>
            <boxGeometry args={[2.4, 1.2, 1.4]} />
            <meshStandardMaterial color={panel} roughness={0.4} metalness={0.58} />
          </mesh>
        </>
      ) : variant === 'lab' ? (
        <>
          <mesh position={[-0.8, 1.7, -0.3]} castShadow receiveShadow>
            <boxGeometry args={[3.2, 2.8, 2.6]} />
            <meshStandardMaterial color={hull} roughness={0.42} metalness={0.6} />
          </mesh>
          <mesh position={[1.5, 1.2, -0.6]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 1.8, 2.2]} />
            <meshStandardMaterial color={panel} roughness={0.4} metalness={0.55} />
          </mesh>
          <mesh position={[-0.8, 3.4, -0.3]} castShadow>
            <cylinderGeometry args={[0.15, 0.2, 1.4, 8]} />
            <meshStandardMaterial color={hullDark} metalness={0.7} roughness={0.35} />
          </mesh>
          <mesh position={[-0.8, 4.2, -0.3]}>
            <sphereGeometry args={[0.28, 12, 10]} />
            <meshStandardMaterial color={purple} emissive={purple} emissiveIntensity={0.7} />
          </mesh>
        </>
      ) : (
        <>
          <mesh position={[0, 1.3, -0.5]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <torusGeometry args={[1.9, 0.35, 10, 24]} />
            <meshStandardMaterial color={hull} roughness={0.4} metalness={0.65} />
          </mesh>
          <mesh position={[0, 1.3, -0.5]} castShadow>
            <cylinderGeometry args={[1.2, 1.4, 1.6, 16]} />
            <meshStandardMaterial color={panel} roughness={0.42} metalness={0.58} />
          </mesh>
          <mesh position={[0, 2.4, -0.5]}>
            <torusGeometry args={[1.35, 0.08, 8, 24]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} />
          </mesh>
          <mesh position={[1.8, 0.9, 0.8]} castShadow>
            <boxGeometry args={[1.5, 1.2, 1.3]} />
            <meshStandardMaterial color={hullDark} roughness={0.45} metalness={0.55} />
          </mesh>
        </>
      )}

      {[-2.7, 2.7].map((x) => (
        <group key={`astro-scaffold-${x}`}>
          <mesh position={[x, 1.7, 1.5]} castShadow>
            <boxGeometry args={[0.12, 3.4, 0.12]} />
            <meshStandardMaterial color={panel} metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[x, 1.7, -1.7]} castShadow>
            <boxGeometry args={[0.12, 3.4, 0.12]} />
            <meshStandardMaterial color={panel} metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[x, 2.6, -0.1]} castShadow>
            <boxGeometry args={[0.1, 0.1, 3.3]} />
            <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.65, 1.5]} castShadow>
        <boxGeometry args={[5.4, 0.1, 0.65]} />
        <meshStandardMaterial color={hull} metalness={0.55} roughness={0.42} />
      </mesh>
      <mesh position={[-2.5, 0.55, 2.1]} castShadow>
        <boxGeometry args={[1.0, 0.7, 0.85]} />
        <meshStandardMaterial color={panel} metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[2.4, 0.48, 2.0]} castShadow>
        <cylinderGeometry args={[0.35, 0.35, 0.7, 12]} />
        <meshStandardMaterial color={hullDark} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0.8, 0.42, 2.2]} castShadow>
        <boxGeometry args={[0.9, 0.5, 0.6]} />
        <meshStandardMaterial color={purple} emissive={purple} emissiveIntensity={0.2} />
      </mesh>
    </group>
  )
}

function MusicArtComingSoonShell() {
  const hull = '#1c1228'
  const panel = '#3a2448'
  const accent = '#e85cff'
  const amber = '#ffc46a'
  return (
    <group>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.2, 0.32, 5.6]} />
        <meshStandardMaterial color="#120818" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.55, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 2.8, 4.2]} />
        <meshStandardMaterial color={hull} roughness={0.78} />
      </mesh>
      {/* スクリーン枠 */}
      <mesh position={[0, 2.15, 1.85]} castShadow>
        <boxGeometry args={[3.4, 1.9, 0.18]} />
        <meshStandardMaterial color={panel} roughness={0.45} metalness={0.35} />
      </mesh>
      <mesh position={[0, 2.15, 1.96]}>
        <planeGeometry args={[2.9, 1.45]} />
        <meshStandardMaterial color="#2a1030" emissive={accent} emissiveIntensity={0.28} />
      </mesh>
      {/* 波形バー（静的シルエット） */}
      {[-1.0, -0.6, -0.2, 0.2, 0.6, 1.0].map((x, i) => (
        <mesh key={x} position={[x, 1.05 + (i % 3) * 0.12, 2.05]}>
          <boxGeometry args={[0.22, 0.35 + (i % 4) * 0.18, 0.08]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* 屋上ライト */}
      <mesh position={[0, 3.2, -0.2]} castShadow>
        <boxGeometry args={[5.1, 0.28, 4.5]} />
        <meshStandardMaterial color="#241830" roughness={0.7} />
      </mesh>
      {[-1.6, 1.6].map((x) => (
        <mesh key={`bulb-${x}`} position={[x, 3.55, 1.4]}>
          <sphereGeometry args={[0.14, 10, 10]} />
          <meshStandardMaterial color={amber} emissive={amber} emissiveIntensity={1.0} />
        </mesh>
      ))}
    </group>
  )
}

function ComingSoonBarricade({
  mountain,
  culture = false,
  sea = false,
  astro = false,
  musicArt = false,
}: {
  mountain: boolean
  culture?: boolean
  sea?: boolean
  astro?: boolean
  musicArt?: boolean
}) {
  const stripe = musicArt
    ? '#e85cff'
    : astro
      ? '#5ce0ff'
      : sea
        ? '#f0c878'
        : culture
          ? '#6a9ee8'
          : mountain
            ? '#c4a060'
            : '#c9a24a'
  const post = musicArt
    ? '#1c1228'
    : astro
      ? '#1a2234'
      : sea
        ? '#5a4030'
        : culture
          ? '#1a2a48'
          : mountain
            ? '#5a4030'
            : '#3a3530'
  return (
    <group position={[0, 0, 2.85]}>
      {[-2.4, -0.8, 0.8, 2.4].map((x) => (
        <mesh key={x} position={[x, 0.55, 0]} castShadow>
          <boxGeometry args={[0.12, 1.1, 0.12]} />
          <meshStandardMaterial
            color={post}
            roughness={astro || musicArt ? 0.45 : 0.85}
            metalness={astro || musicArt ? 0.55 : 0}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[5.2, 0.22, 0.1]} />
        <meshStandardMaterial
          color={stripe}
          emissive={astro || musicArt ? stripe : '#000000'}
          emissiveIntensity={astro || musicArt ? 0.25 : 0}
          roughness={0.7}
        />
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
  sea = false,
  astro = false,
  musicArt = false,
  title,
  subtitle,
}: {
  heading: string
  mountain: boolean
  culture?: boolean
  sea?: boolean
  astro?: boolean
  musicArt?: boolean
  title?: string
  subtitle?: string
}) {
  const accent = musicArt
    ? '#e85cff'
    : astro
      ? '#5ce0ff'
      : sea
        ? '#f0c878'
        : culture
          ? '#6a9ee8'
          : mountain
            ? '#c4a060'
            : '#c9a24a'
  const hasDetail = Boolean(title)
  return (
    <group position={[0, 0, 3.35]}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 2.2, 8]} />
        <meshStandardMaterial
          color={musicArt ? '#1c1228' : astro ? '#1a2234' : '#8a7050'}
          roughness={astro || musicArt ? 0.45 : 0.85}
          metalness={astro || musicArt ? 0.55 : 0}
        />
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
