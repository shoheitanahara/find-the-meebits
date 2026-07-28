import { MEET_SERGITO } from '../config'
import { WORKSHOP_SHELF } from './workshopFigureLayout'

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
      <group position={[-roomHalfX + WALL_T * 0.6, 2.5, 0]}>
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
    <group position={position}>
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

      <group position={[-6.8, 0, 4.5]}>
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.15, 0.44, 0.95]} />
          <meshStandardMaterial color="#b8a888" roughness={0.92} />
        </mesh>
      </group>

      <group position={[7.8, 0, 5.2]}>
        <mesh position={[0, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 1.3, 10]} />
          <meshStandardMaterial color="#2a2828" roughness={0.45} metalness={0.55} />
        </mesh>
        <mesh position={[0, 1.35, 0]}>
          <coneGeometry args={[0.28, 0.32, 12, 1, true]} />
          <meshStandardMaterial
            color="#fff4e0"
            emissive="#ffc870"
            emissiveIntensity={0.45}
            roughness={0.4}
            side={2}
          />
        </mesh>
        <pointLight position={[0, 1.2, 0]} intensity={10} distance={7} decay={2} color="#ffd8a0" />
      </group>
    </>
  )
}

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
  const backX = intoRoom * -0.04
  const boardX = intoRoom * (shelfDepth / 2 + 0.06)
  const midY = boardTopY[1]

  return (
    <group position={[wallX, 0, 0]}>
      {boardTopY.map((y) => (
        <mesh key={y} position={[boardX, y - 0.025, 0]} castShadow receiveShadow>
          <boxGeometry args={[shelfDepth, 0.05, shelfSpanZ]} />
          <meshStandardMaterial color={colors.wood} roughness={0.72} metalness={0.04} />
        </mesh>
      ))}
      <mesh position={[backX, midY, 0]} castShadow>
        <boxGeometry args={[0.08, 3.6, shelfSpanZ]} />
        <meshStandardMaterial color={colors.woodDark} roughness={0.82} />
      </mesh>
      {[-shelfSpanZ / 2 + 0.06, shelfSpanZ / 2 - 0.06].map((z) => (
        <mesh key={z} position={[boardX * 0.6, midY, z]} castShadow>
          <boxGeometry args={[0.08, 3.6, 0.08]} />
          <meshStandardMaterial color={colors.woodDark} roughness={0.82} />
        </mesh>
      ))}
    </group>
  )
}
