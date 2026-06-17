import type { ReactNode } from 'react'
import { Text } from '@react-three/drei'

const treePositions: [number, number, number][] = [
  [-22, 0, -15],
  [-16, 0, 22],
  [20, 0, -18],
  [24, 0, 20],
  [-44, 0, 3],
  [44, 0, -5],
]

const benchPositions: [number, number, number][] = [
  [-14, 0.35, 12],
  [14, 0.35, 12],
  [-28, 0.35, -22],
  [28, 0.35, 24],
]

const sculpturePositions: [number, number, number][] = [
  [-50, 0, -42],
  [-28, 0, -50],
  [18, 0, -52],
  [48, 0, -36],
  [-52, 0, 26],
  [-24, 0, 50],
  [22, 0, 52],
  [52, 0, 30],
]

const wallPanelPositions: [number, number, number][] = [
  [-54, 0.575, -10],
  [-54, 0.575, 12],
  [54, 0.575, -14],
  [54, 0.575, 10],
  [-12, 0.575, -54],
  [14, 0.575, -54],
  [-14, 0.575, 54],
  [12, 0.575, 54],
]

function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.325, 0]}>
        <boxGeometry args={[0.5, 0.65, 0.5]} />
        <meshStandardMaterial color="#111111" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[1.8, 0.9, 1.8]} />
        <meshStandardMaterial color="#d4af37" roughness={0.28} metalness={0.85} />
      </mesh>
    </group>
  )
}

function Bench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.28, 0.8]} />
        <meshStandardMaterial color="#292524" roughness={0.86} />
      </mesh>
      <mesh castShadow position={[-1.1, -0.45, 0]}>
        <boxGeometry args={[0.22, 0.9, 0.22]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh castShadow position={[1.1, -0.45, 0]}>
        <boxGeometry args={[0.22, 0.9, 0.22]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </group>
  )
}

function Sculpture({ position, index }: { position: [number, number, number]; index: number }) {
  const isDark = index % 2 === 0

  return (
    <group position={position} rotation={[0, index * 0.7, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.125, 0]}>
        <boxGeometry args={[2.4, 0.25, 2.4]} />
        <meshStandardMaterial color={isDark ? '#1c1917' : '#f5f5f4'} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 0.6, 0]}>
        <boxGeometry args={[0.65, 0.95, 0.65]} />
        <meshStandardMaterial
          color={isDark ? '#c0c0c0' : '#1c1917'}
          roughness={isDark ? 0.22 : 0.55}
          metalness={isDark ? 0.9 : 0}
        />
      </mesh>
      <mesh castShadow position={[0.58, 0.925, 0]}>
        <boxGeometry args={[1.7, 0.17, 0.34]} />
        <meshStandardMaterial color={isDark ? '#d6d3d1' : '#292524'} roughness={0.5} />
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
  const { wingWidth, offsetX } = getSplitWingOffsets(7.4, 4)

  return (
    <group position={[0, 0.9, 52]}>
      <mesh castShadow position={[-3.3, -0.425, 0]}>
        <boxGeometry args={[0.18, 1.25, 0.18]} />
        <meshStandardMaterial color="#111111" />
      </mesh>
      <mesh castShadow position={[3.3, -0.425, 0]}>
        <boxGeometry args={[0.18, 1.25, 0.18]} />
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
      {treePositions.map((position) => (
        <Tree key={position.join('-')} position={position} />
      ))}
      {benchPositions.map((position) => (
        <Bench key={position.join('-')} position={position} />
      ))}
      {sculpturePositions.map((position, index) => (
        <Sculpture key={position.join('-')} index={index} position={position} />
      ))}
      {wallPanelPositions.map((position, index) => (
        <WallPanel key={position.join('-')} index={index} position={position} />
      ))}
    </group>
  )
}
