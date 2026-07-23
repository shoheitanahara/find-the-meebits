import { Text } from '@react-three/drei'
import type { ParkGateDef } from './parkZones'

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
  return (
    <group>
      {cells.map((cell, index) => (
        <mesh
          key={index}
          position={[cell.x, cell.y, cell.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[VOX * 0.98, VOX * 0.98, VOX * 0.98]} />
          <meshStandardMaterial color={cell.color} roughness={0.94} />
        </mesh>
      ))}
    </group>
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

  return (
    <group>
      {cells.map((cell, index) => (
        <mesh key={index} position={[cell.x, cell.y, cell.z]} receiveShadow>
          <boxGeometry args={[VOX * 0.96, VOX * 0.22, VOX * 0.9]} />
          <meshStandardMaterial color={cell.color} roughness={0.95} />
        </mesh>
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

      <group position={[faceSign * 0.45, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
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
  theme?: 'classic' | 'mountain'
  title?: { en: string; ja: string }
  subtitle?: { en: string; ja: string }
}) {
  const heading = title?.[locale] ?? (locale === 'ja' ? '新アトラクション' : 'NEW ATTRACTION')
  const sub = subtitle?.[locale] ?? (locale === 'ja' ? '建設中' : 'UNDER CONSTRUCTION')
  const mountain = theme === 'mountain'

  return (
    <group position={position}>
      {mountain ? <MountainComingSoonShell /> : <ClassicComingSoonShell />}
      <ComingSoonBarricade mountain={mountain} />
      <ComingSoonSignboard heading={heading} sub={sub} mountain={mountain} />
      <pointLight
        position={[0, 3.2, 2.8]}
        intensity={mountain ? 8 : 10}
        distance={11}
        color={mountain ? '#ffb060' : '#ffd080'}
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
        <meshStandardMaterial color="#5a4a38" roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.4, 0]} receiveShadow>
        <boxGeometry args={[5.8, 0.12, 5.2]} />
        <meshStandardMaterial color="#6a7a58" roughness={0.9} />
      </mesh>

      {/* 未完成のボクセル躯体（高さムラ） */}
      {[
        { x: -1.6, z: -0.4, w: 2.6, h: 2.8, d: 2.4, c: '#6a6e68' },
        { x: 1.5, z: -0.6, w: 2.4, h: 3.6, d: 2.2, c: '#4a4e48' },
        { x: 0.1, z: -1.6, w: 2.0, h: 1.8, d: 1.6, c: '#8a8e82' },
        { x: -2.2, z: 1.0, w: 1.5, h: 1.4, d: 1.5, c: '#5a8a48' },
      ].map((b) => (
        <mesh key={`${b.x}-${b.z}`} position={[b.x, 0.45 + b.h * 0.5, b.z]} castShadow receiveShadow>
          <boxGeometry args={[b.w, b.h, b.d]} />
          <meshStandardMaterial color={b.c} roughness={0.95} />
        </mesh>
      ))}
      {/* 雪っぽい頂部ブロック */}
      <mesh position={[1.5, 4.25, -0.6]} castShadow>
        <boxGeometry args={[1.6, 0.45, 1.4]} />
        <meshStandardMaterial color="#e8eef4" roughness={0.85} />
      </mesh>

      {/* 足場 */}
      {[-2.6, 2.6].map((x) => (
        <group key={`scaffold-${x}`}>
          <mesh position={[x, 1.6, 1.6]} castShadow>
            <boxGeometry args={[0.14, 3.2, 0.14]} />
            <meshStandardMaterial color="#7a5a38" roughness={0.88} />
          </mesh>
          <mesh position={[x, 1.6, -1.8]} castShadow>
            <boxGeometry args={[0.14, 3.2, 0.14]} />
            <meshStandardMaterial color="#7a5a38" roughness={0.88} />
          </mesh>
          <mesh position={[x, 2.4, -0.1]} castShadow>
            <boxGeometry args={[0.12, 0.12, 3.5]} />
            <meshStandardMaterial color="#6a4a30" roughness={0.85} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 2.45, 1.6]} castShadow>
        <boxGeometry args={[5.3, 0.1, 0.7]} />
        <meshStandardMaterial color="#8a6a42" roughness={0.86} />
      </mesh>
      {/* 青シート */}
      <mesh position={[0.2, 3.1, 0.4]} rotation={[0.08, 0.2, -0.12]} castShadow>
        <boxGeometry args={[3.4, 0.06, 2.6]} />
        <meshStandardMaterial color="#3a6a9a" roughness={0.7} metalness={0.05} />
      </mesh>
      {/* 資材箱 */}
      <mesh position={[-2.4, 0.55, 2.0]} castShadow>
        <boxGeometry args={[1.1, 0.7, 0.9]} />
        <meshStandardMaterial color="#6a4a28" roughness={0.9} />
      </mesh>
      <mesh position={[2.3, 0.45, 2.1]} castShadow>
        <boxGeometry args={[0.9, 0.55, 0.7]} />
        <meshStandardMaterial color="#5a3a20" roughness={0.9} />
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

function ComingSoonBarricade({ mountain }: { mountain: boolean }) {
  const stripe = mountain ? '#c4a060' : '#c9a24a'
  const post = mountain ? '#5a4030' : '#3a3530'
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
  sub,
  mountain,
}: {
  heading: string
  sub: string
  mountain: boolean
}) {
  const accent = mountain ? '#c4a060' : '#c9a24a'
  return (
    <group position={[0, 0, 3.35]}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 2.2, 8]} />
        <meshStandardMaterial color="#8a7050" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.45, 0.05]} castShadow>
        <boxGeometry args={[2.9, 1.55, 0.14]} />
        <meshStandardMaterial color="#1a1510" roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.45, 0.13]}>
        <boxGeometry args={[2.65, 1.3, 0.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.14} roughness={0.52} />
      </mesh>
      <Text position={[0, 2.68, 0.18]} fontSize={0.2} color="#1a1208" anchorX="center" anchorY="middle" maxWidth={2.4} textAlign="center">
        {heading}
      </Text>
      <Text position={[0, 2.28, 0.18]} fontSize={0.15} color="#3a2a10" anchorX="center" anchorY="middle">
        {sub}
      </Text>
    </group>
  )
}
