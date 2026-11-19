import { MEET_SERGITO } from '../config'
import { WORKSHOP_SHELF } from './workshopFigureLayout'
import { OCCLUDER_USER_DATA } from '../../world/CameraOcclusionFader'

const WALL_T = 0.28

/** 木造工房の床・壁・天井（壁はシンプルな板張り） */
export function WorkshopWoodShell() {
  const { roomHalfX, roomMinZ, roomMaxZ, wallHeight, ceilingY, entranceHalf, colors } =
    MEET_SERGITO
  const roomDepth = roomMaxZ - roomMinZ
  const roomCenterZ = (roomMinZ + roomMaxZ) / 2
  const innerW = roomHalfX * 2 - WALL_T * 2
  const innerD = roomDepth - WALL_T * 2

  return (
    <group>
      {/* 床 */}
      <mesh position={[0, 0.01, roomCenterZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[innerW, innerD]} />
        <meshStandardMaterial color={colors.floorLight} roughness={0.8} metalness={0.02} />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const z = roomMinZ + 1.5 + i * 3.2
        return (
          <mesh key={`floor-seam-${i}`} position={[0, 0.011, z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[innerW, 0.04]} />
            <meshStandardMaterial color={colors.floorDark} roughness={0.85} />
          </mesh>
        )
      })}

      {/* 壁 — 単板 + 縦見え際（ぐちゃつき防止） */}
      <SimpleWall
        position={[0, wallHeight / 2, roomMinZ + WALL_T / 2]}
        size={[innerW + WALL_T * 2, wallHeight, WALL_T]}
        battenAxis="x"
      />
      <SimpleWall
        position={[-(roomHalfX + entranceHalf) / 2, wallHeight / 2, roomMaxZ - WALL_T / 2]}
        size={[roomHalfX - entranceHalf, wallHeight, WALL_T]}
        battenAxis="x"
      />
      <SimpleWall
        position={[(roomHalfX + entranceHalf) / 2, wallHeight / 2, roomMaxZ - WALL_T / 2]}
        size={[roomHalfX - entranceHalf, wallHeight, WALL_T]}
        battenAxis="x"
      />
      <SimpleWall
        position={[-roomHalfX + WALL_T / 2, wallHeight / 2, roomCenterZ]}
        size={[WALL_T, wallHeight, innerD + WALL_T * 2]}
        battenAxis="z"
        windowCutout
      />
      <SimpleWall
        position={[roomHalfX - WALL_T / 2, wallHeight / 2, roomCenterZ]}
        size={[WALL_T, wallHeight, innerD + WALL_T * 2]}
        battenAxis="z"
      />

      {/* 左壁窓 */}
      <group position={[-roomHalfX + WALL_T * 0.6, 2.5, 0]} userData={OCCLUDER_USER_DATA}>
        <mesh>
          <boxGeometry args={[0.05, 1.9, 2.8]} />
          <meshStandardMaterial
            color="#fff4e8"
            emissive="#ffe0b0"
            emissiveIntensity={0.38}
            roughness={0.25}
          />
        </mesh>
        <mesh position={[0.03, 0, 0]}>
          <boxGeometry args={[0.015, 1.75, 2.6]} />
          <meshStandardMaterial color="#b8d0e0" roughness={0.12} transparent opacity={0.72} />
        </mesh>
      </group>

      {/* 天井 */}
      <mesh position={[0, ceilingY, roomCenterZ]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[innerW, innerD]} />
        <meshStandardMaterial color={colors.ceilingPlank} roughness={0.92} />
      </mesh>
      {[-4, 0, 4].map((z) => (
        <mesh key={z} position={[0, ceilingY - 0.06, z]} castShadow>
          <boxGeometry args={[innerW, 0.12, 0.18]} />
          <meshStandardMaterial color={colors.beam} roughness={0.82} />
        </mesh>
      ))}

      {/* 巾木 */}
      <mesh position={[0, 0.11, roomMinZ + 0.08]} receiveShadow>
        <boxGeometry args={[innerW, 0.12, 0.08]} />
        <meshStandardMaterial color={colors.beam} roughness={0.75} />
      </mesh>
      <mesh position={[-roomHalfX + 0.08, 0.11, roomCenterZ]} receiveShadow>
        <boxGeometry args={[0.08, 0.12, innerD]} />
        <meshStandardMaterial color={colors.beam} roughness={0.75} />
      </mesh>
      <mesh position={[roomHalfX - 0.08, 0.11, roomCenterZ]} receiveShadow>
        <boxGeometry args={[0.08, 0.12, innerD]} />
        <meshStandardMaterial color={colors.beam} roughness={0.75} />
      </mesh>
    </group>
  )
}

function SimpleWall({
  position,
  size,
  battenAxis,
  windowCutout = false,
}: {
  position: [number, number, number]
  size: [number, number, number]
  battenAxis: 'x' | 'z'
  windowCutout?: boolean
}) {
  const { colors } = MEET_SERGITO
  const [w, h, d] = size
  const battenCount = battenAxis === 'x' ? 5 : 4
  const span = battenAxis === 'x' ? w : d

  return (
    <group position={position} userData={OCCLUDER_USER_DATA}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={colors.wallPlank} roughness={0.88} metalness={0.02} />
      </mesh>
      {!windowCutout
        ? Array.from({ length: battenCount }, (_, i) => {
            const t = -span / 2 + span * ((i + 1) / (battenCount + 1))
            const pos: [number, number, number] = battenAxis === 'x' ? [t, 0, d / 2 + 0.01] : [w / 2 + 0.01, 0, t]
            const args: [number, number, number] =
              battenAxis === 'x' ? [0.06, h * 0.98, 0.02] : [0.02, h * 0.98, 0.06]

            return (
              <mesh key={i} position={pos}>
                <boxGeometry args={args} />
                <meshStandardMaterial color={colors.wallPlankDark} roughness={0.9} />
              </mesh>
            )
          })
        : null}
    </group>
  )
}

export function WorkshopShelves() {
  const { colors } = MEET_SERGITO
  const { leftCenterX, rightCenterX, boardTopY } = WORKSHOP_SHELF
  const shelfDepth = 0.95
  const shelfSpanZ = WORKSHOP_SHELF.spanZ

  return (
    <>
      <WallShelfUnit
        wallX={leftCenterX}
        side="left"
        boardTopY={boardTopY}
        shelfDepth={shelfDepth}
        shelfSpanZ={shelfSpanZ}
        colors={colors}
      />
      <WallShelfUnit
        wallX={rightCenterX}
        side="right"
        boardTopY={boardTopY}
        shelfDepth={shelfDepth}
        shelfSpanZ={shelfSpanZ}
        colors={colors}
      />
    </>
  )
}

/**
 * 壁付けのフィギュア棚。
 * 両端は奥行きいっぱいの側板、上に天板・下に台輪を付けて家具としてまとめる。
 * 各段の前縁に見切り、棚板の裏にフィギュアを照らす静かな照明帯。
 */
function WallShelfUnit({
  wallX,
  side,
  boardTopY,
  shelfDepth,
  shelfSpanZ,
  colors,
}: {
  wallX: number
  side: 'left' | 'right'
  boardTopY: readonly number[]
  shelfDepth: number
  shelfSpanZ: number
  colors: (typeof MEET_SERGITO)['colors']
}) {
  const intoRoom = side === 'left' ? 1 : -1
  const boardX = intoRoom * (shelfDepth / 2 + 0.06)
  const frontX = intoRoom * (shelfDepth + 0.06)
  const topBoardY = boardTopY[boardTopY.length - 1]
  /** 一番上の段のフィギュアの頭上まで */
  const unitHeight = topBoardY + 0.75
  const sideT = 0.07
  const halfSpan = shelfSpanZ / 2 + sideT / 2

  return (
    <group position={[wallX, 0, 0]}>
      {/* 背板 */}
      <mesh position={[intoRoom * 0.05, unitHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.06, unitHeight, shelfSpanZ + sideT * 2]} />
        <meshStandardMaterial color={colors.woodDark} roughness={0.82} />
      </mesh>
      {/* 両端の側板（奥行きいっぱい） */}
      {[-halfSpan, halfSpan].map((z) => (
        <mesh key={z} position={[boardX, unitHeight / 2, z]} castShadow receiveShadow>
          <boxGeometry args={[shelfDepth + 0.06, unitHeight, sideT]} />
          <meshStandardMaterial color={colors.wood} roughness={0.7} metalness={0.04} />
        </mesh>
      ))}
      {/* 天板と台輪 */}
      <mesh position={[boardX, unitHeight + 0.03, 0]} castShadow>
        <boxGeometry args={[shelfDepth + 0.14, 0.06, shelfSpanZ + sideT * 2 + 0.1]} />
        <meshStandardMaterial color={colors.wood} roughness={0.7} metalness={0.04} />
      </mesh>
      <mesh position={[boardX, 0.06, 0]} receiveShadow>
        <boxGeometry args={[shelfDepth + 0.02, 0.12, shelfSpanZ]} />
        <meshStandardMaterial color={colors.woodDark} roughness={0.85} />
      </mesh>
      {boardTopY.map((y) => (
        <group key={y}>
          {/* 棚板 */}
          <mesh position={[boardX, y - 0.025, 0]} castShadow receiveShadow>
            <boxGeometry args={[shelfDepth, 0.05, shelfSpanZ]} />
            <meshStandardMaterial color={colors.wood} roughness={0.72} metalness={0.04} />
          </mesh>
          {/* 前縁の見切り */}
          <mesh position={[frontX, y - 0.035, 0]}>
            <boxGeometry args={[0.03, 0.07, shelfSpanZ]} />
            <meshStandardMaterial color={colors.woodDark} roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* 棚板の裏の照明帯（下の段のフィギュアを照らす。点滅なし） */}
      {boardTopY.slice(1).map((y) => (
        <mesh key={`led-${y}`} position={[intoRoom * (shelfDepth * 0.75), y - 0.055, 0]}>
          <boxGeometry args={[0.04, 0.01, shelfSpanZ - 0.2]} />
          <meshBasicMaterial color="#ffe2b0" toneMapped={false} />
        </mesh>
      ))}
      <mesh position={[intoRoom * (shelfDepth * 0.75), unitHeight - 0.005, 0]}>
        <boxGeometry args={[0.04, 0.01, shelfSpanZ - 0.2]} />
        <meshBasicMaterial color="#ffe2b0" toneMapped={false} />
      </mesh>
    </group>
  )
}
