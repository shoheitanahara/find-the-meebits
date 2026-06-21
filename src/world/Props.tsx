import type { ReactNode } from 'react'
import { Text } from '@react-three/drei'
import {
  BENCH_POSITIONS,
  SCULPTURE_POSITIONS,
  VRM_SCULPTURE_PLACEMENTS,
  WALL_PANEL_POSITIONS,
} from './worldLandmarks'
import { VrmSculpture } from './VrmSculpture'

const benchPositions = BENCH_POSITIONS
const sculpturePositions = SCULPTURE_POSITIONS
const wallPanelPositions = WALL_PANEL_POSITIONS

function Bench({ position }: { position: [number, number, number] }) {
  const seatMaterial = <meshStandardMaterial color="#4a3f35" roughness={0.86} />
  const legMaterial = <meshStandardMaterial color="#141414" roughness={0.72} metalness={0.12} />

  const seatW = 3.2
  const seatD = 0.82
  const seatH = 0.14
  const legH = 3.6
  const legSize = 0.18
  const legInsetX = seatW / 2 - 0.26
  const legInsetZ = seatD / 2 - 0.14
  const legY = -seatH / 2 - legH / 2

  const legPositions: Array<[number, number]> = [
    [-legInsetX, legInsetZ],
    [legInsetX, legInsetZ],
    [-legInsetX, -legInsetZ],
    [legInsetX, -legInsetZ],
  ]

  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[seatW, seatH, seatD]} />
        {seatMaterial}
      </mesh>

      {legPositions.map(([lx, lz]) => (
        <mesh key={`${lx}-${lz}`} castShadow position={[lx, legY, lz]}>
          <boxGeometry args={[legSize, legH, legSize]} />
          {legMaterial}
        </mesh>
      ))}

      <mesh castShadow position={[0, legY + legH * 0.32, legInsetZ - 0.02]}>
        <boxGeometry args={[seatW - 0.55, 0.1, 0.1]} />
        {legMaterial}
      </mesh>
      <mesh castShadow position={[0, legY + legH * 0.32, -legInsetZ + 0.02]}>
        <boxGeometry args={[seatW - 0.55, 0.1, 0.1]} />
        {legMaterial}
      </mesh>
    </group>
  )
}

function getSculptureFacing(position: [number, number, number]) {
  const [x, , z] = position
  return Math.atan2(-x, -z)
}

function MonochromeSculpture({
  position,
  index,
}: {
  position: [number, number, number]
  index: number
}) {
  const isDark = index % 2 === 0
  const variant = index % 3

  const pedestalMaterial = (
    <meshStandardMaterial
      color={isDark ? '#1c1917' : '#ffffff'}
      roughness={isDark ? 0.72 : 0.48}
    />
  )
  const plinthMaterial = (
    <meshStandardMaterial
      color={isDark ? '#292524' : '#ffffff'}
      roughness={isDark ? 0.68 : 0.44}
    />
  )
  const statueMaterial = (
    <meshStandardMaterial
      color={isDark ? '#0a0a0a' : '#ffffff'}
      roughness={isDark ? 0.42 : 0.42}
      metalness={0}
    />
  )
  const statueAccentMaterial = (
    <meshStandardMaterial
      color={isDark ? '#000000' : '#ffffff'}
      roughness={isDark ? 0.38 : 0.38}
      metalness={0}
    />
  )

  return (
    <group position={position} rotation={[0, getSculptureFacing(position), 0]}>
      <mesh castShadow receiveShadow position={[0, 0.09, 0]}>
        <boxGeometry args={[2.6, 0.18, 2.6]} />
        {pedestalMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.24, 0]}>
        <boxGeometry args={[1.85, 0.16, 1.85]} />
        {plinthMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
        <boxGeometry args={[1.15, 0.12, 1.15]} />
        {plinthMaterial}
      </mesh>

      {variant === 0 ? (
        <StandingFigureSculpture
          statueMaterial={statueMaterial}
          statueAccentMaterial={statueAccentMaterial}
        />
      ) : null}
      {variant === 1 ? (
        <SpiralColumnSculpture
          statueMaterial={statueMaterial}
          statueAccentMaterial={statueAccentMaterial}
        />
      ) : null}
      {variant === 2 ? (
        <ArchSculpture statueMaterial={statueMaterial} statueAccentMaterial={statueAccentMaterial} />
      ) : null}
    </group>
  )
}

function StandingFigureSculpture({
  statueMaterial,
  statueAccentMaterial,
}: {
  statueMaterial: ReactNode
  statueAccentMaterial: ReactNode
}) {
  return (
    <group position={[0, 0.44, 0]}>
      <mesh castShadow receiveShadow position={[-0.22, 0.18, 0]}>
        <boxGeometry args={[0.28, 0.42, 0.32]} />
        {statueMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0.22, 0.18, 0]}>
        <boxGeometry args={[0.28, 0.42, 0.32]} />
        {statueMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.62, 0]}>
        <boxGeometry args={[0.62, 0.58, 0.38]} />
        {statueMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.08, 0]}>
        <boxGeometry args={[0.48, 0.52, 0.34]} />
        {statueAccentMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.48, 0]}>
        <boxGeometry args={[0.38, 0.36, 0.32]} />
        {statueAccentMaterial}
      </mesh>
      <mesh castShadow position={[0.46, 0.78, 0]}>
        <boxGeometry args={[0.72, 0.14, 0.22]} />
        {statueMaterial}
      </mesh>
      <mesh castShadow position={[-0.42, 1.02, 0.08]}>
        <boxGeometry args={[0.18, 0.14, 0.18]} />
        {statueAccentMaterial}
      </mesh>
    </group>
  )
}

function SpiralColumnSculpture({
  statueMaterial,
  statueAccentMaterial,
}: {
  statueMaterial: ReactNode
  statueAccentMaterial: ReactNode
}) {
  return (
    <group position={[0, 0.48, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
        <boxGeometry args={[0.72, 0.32, 0.72]} />
        {statueMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0.18, 0.48, 0.12]}>
        <boxGeometry args={[0.58, 0.28, 0.58]} />
        {statueAccentMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[-0.14, 0.76, -0.1]}>
        <boxGeometry args={[0.5, 0.26, 0.5]} />
        {statueMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0.1, 1.02, 0.14]}>
        <boxGeometry args={[0.42, 0.24, 0.42]} />
        {statueAccentMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[-0.08, 1.26, -0.08]}>
        <boxGeometry args={[0.34, 0.22, 0.34]} />
        {statueMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 1.48, 0]}>
        <boxGeometry args={[0.24, 0.18, 0.24]} />
        {statueAccentMaterial}
      </mesh>
    </group>
  )
}

function ArchSculpture({
  statueMaterial,
  statueAccentMaterial,
}: {
  statueMaterial: ReactNode
  statueAccentMaterial: ReactNode
}) {
  return (
    <group position={[0, 0.44, 0]}>
      <mesh castShadow receiveShadow position={[-0.52, 0.42, 0]}>
        <boxGeometry args={[0.34, 0.88, 0.34]} />
        {statueMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0.52, 0.42, 0]}>
        <boxGeometry args={[0.34, 0.88, 0.34]} />
        {statueMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.92, 0]}>
        <boxGeometry args={[1.55, 0.22, 0.38]} />
        {statueAccentMaterial}
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[1.35, 0.18, 0.42]} />
        {statueMaterial}
      </mesh>
      <mesh castShadow position={[0, 1.12, 0]}>
        <boxGeometry args={[0.28, 0.28, 0.28]} />
        {statueAccentMaterial}
      </mesh>
    </group>
  )
}

const CENTER_CORRIDOR_GAP = 6

function getSplitWingOffsets(totalWidth: number, gap = CENTER_CORRIDOR_GAP) {
  const wingWidth = (totalWidth - gap) / 2
  const offsetX = gap / 2 + wingWidth / 2

  return { wingWidth, offsetX }
}

function SplitWingMeshes({
  totalWidth,
  height,
  depth,
  gap = CENTER_CORRIDOR_GAP,
  material,
}: {
  totalWidth: number
  height: number
  depth: number
  gap?: number
  material: ReactNode
}) {
  const { wingWidth, offsetX } = getSplitWingOffsets(totalWidth, gap)

  return (
    <>
      <mesh castShadow receiveShadow position={[-offsetX, 0, 0]}>
        <boxGeometry args={[wingWidth, height, depth]} />
        {material}
      </mesh>
      <mesh castShadow receiveShadow position={[offsetX, 0, 0]}>
        <boxGeometry args={[wingWidth, height, depth]} />
        {material}
      </mesh>
    </>
  )
}

function WallPanel({ position, index }: { position: [number, number, number]; index: number }) {
  const isSideWall = Math.abs(position[0]) > Math.abs(position[2])
  const rotationY = isSideWall ? Math.PI / 2 : 0

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[5.2, 1.15, 0.18]} />
        <meshStandardMaterial
          color={index % 2 === 0 ? '#c0c0c0' : '#292524'}
          roughness={index % 2 === 0 ? 0.25 : 0.78}
          metalness={index % 2 === 0 ? 0.85 : 0}
        />
      </mesh>
      <mesh position={[0, -0.61, 0.08]} castShadow>
        <boxGeometry args={[5.6, 0.09, 0.22]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.7} />
      </mesh>
    </group>
  )
}

function Stage() {
  const platformMaterial = <meshStandardMaterial color="#1c1917" roughness={0.78} />
  const backdropMaterial = <meshStandardMaterial color="#f5f5f4" roughness={0.72} />
  const { wingWidth: backdropWingWidth, offsetX: backdropOffsetX } = getSplitWingOffsets(14.4, 5)

  return (
    <group position={[0, 0.175, -22]}>
      <SplitWingMeshes totalWidth={14} height={0.35} depth={5} gap={5} material={platformMaterial} />
      <mesh castShadow position={[-backdropOffsetX, 0.525, -1.2]}>
        <boxGeometry args={[backdropWingWidth, 1.05, 0.35]} />
        {backdropMaterial}
      </mesh>
      <mesh castShadow position={[backdropOffsetX, 0.525, -1.2]}>
        <boxGeometry args={[backdropWingWidth, 1.05, 0.35]} />
        {backdropMaterial}
      </mesh>
      <Text
        color="#111111"
        fontSize={0.28}
        maxWidth={4.5}
        position={[0, 0.55, -1.42]}
        rotation={[0, 0, 0]}
        textAlign="center"
      >
        FIND THE{'\n'}MEEBIT
      </Text>
    </group>
  )
}

function Signboard() {
  return (
    <group position={[-15, 0.75, -15]} rotation={[0, 0.45, 0]}>
      <mesh castShadow position={[-1.6, -0.325, 0]}>
        <boxGeometry args={[0.18, 0.9, 0.18]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh castShadow position={[1.6, -0.325, 0]}>
        <boxGeometry args={[0.18, 0.9, 0.18]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 0.8, 0.22]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.8} />
      </mesh>
      <Text color="#111111" fontSize={0.16} maxWidth={3.4} position={[0, 0, 0.14]} textAlign="center">
        Find the target.{'\n'}No labels in the gallery.{'\n'}Inspect with E.
      </Text>
    </group>
  )
}

function RuleBoard() {
  const totalWidth = 7.4
  const gap = 4
  const boardHeight = 1.2
  const legHeight = 1.25
  const legSize = 0.18
  const { wingWidth, offsetX } = getSplitWingOffsets(totalWidth, gap)
  const legX = offsetX + wingWidth / 2 - legSize / 2
  const boardBottomY = -boardHeight / 2
  const legCenterY = boardBottomY - legHeight / 2

  return (
    <group position={[0, 0.9, 52]}>
      <mesh castShadow position={[-legX, legCenterY, 0]}>
        <boxGeometry args={[legSize, legHeight, legSize]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh castShadow position={[legX, legCenterY, 0]}>
        <boxGeometry args={[legSize, legHeight, legSize]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh castShadow receiveShadow position={[-offsetX, 0, 0]}>
        <boxGeometry args={[wingWidth, 1.2, 0.22]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.76} />
      </mesh>
      <mesh castShadow receiveShadow position={[offsetX, 0, 0]}>
        <boxGeometry args={[wingWidth, 1.2, 0.22]} />
        <meshStandardMaterial color="#fafaf9" roughness={0.76} />
      </mesh>
      <Text
        color="#111111"
        fontSize={0.15}
        maxWidth={2.8}
        position={[-offsetX, 0.11, 0.14]}
        textAlign="center"
      >
        FIND THE{'\n'}TARGET{'\n'}MEEBIT
      </Text>
      <Text
        color="#111111"
        fontSize={0.13}
        maxWidth={2.8}
        position={[offsetX, 0.11, 0.14]}
        textAlign="center"
      >
        1. Remember target{'\n'}2. Run the museum{'\n'}3. Press E on red dot
      </Text>
    </group>
  )
}

export function Props() {
  return (
    <group>
      <Stage />
      <Signboard />
      <RuleBoard />
      {benchPositions.map((position) => (
        <Bench key={position.join('-')} position={position} />
      ))}
      {sculpturePositions.map((position, index) => (
        <MonochromeSculpture key={position.join('-')} index={index} position={position} />
      ))}
      {VRM_SCULPTURE_PLACEMENTS.map((placement) => (
        <VrmSculpture
          key={`vrm-${placement.meebitId}-${placement.position.join('-')}`}
          meebitId={placement.meebitId}
          pedestal={placement.pedestal}
          position={[placement.position[0], placement.position[1], placement.position[2]]}
        />
      ))}
      {wallPanelPositions.map((position, index) => (
        <WallPanel key={position.join('-')} index={index} position={position} />
      ))}
    </group>
  )
}
