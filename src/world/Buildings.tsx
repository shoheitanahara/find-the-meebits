import {
  getShelfDecorCount,
  getShelfDecorPlacement,
  MiniSculpture,
} from './MiniSculpture'

type Building = {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  roofColor: string
}

const CENTER_CORRIDOR_GAP = 6

function createSplitWingBuildings(
  z: number,
  totalWidth: number,
  height: number,
  depth: number,
  color: string,
  roofColor: string,
  gap = CENTER_CORRIDOR_GAP,
): Building[] {
  const wingWidth = (totalWidth - gap) / 2
  const offsetX = gap / 2 + wingWidth / 2
  const y = height / 2

  return [
    { position: [-offsetX, y, z], size: [wingWidth, height, depth], color, roofColor },
    { position: [offsetX, y, z], size: [wingWidth, height, depth], color, roofColor },
  ]
}

const buildings: Building[] = [
  { position: [-32, 0.625, -27], size: [15, 1.25, 4], color: '#fafaf9', roofColor: '#1c1917' },
  { position: [32, 0.75, -26], size: [14, 1.5, 4], color: '#e7e5e4', roofColor: '#292524' },
  { position: [-36, 0.575, 29], size: [16, 1.15, 4], color: '#d6d3d1', roofColor: '#111111' },
  { position: [35, 0.675, 30], size: [15, 1.35, 4], color: '#f5f5f4', roofColor: '#44403c' },
  ...createSplitWingBuildings(-43, 28, 1.1, 3.5, '#fafaf9', '#0a0a0a'),
  ...createSplitWingBuildings(44, 28, 1.1, 3.5, '#e7e5e4', '#0a0a0a'),
]

function BuildingMesh({ building }: { building: Building }) {
  const buildingKey = building.position.join('-')
  const decorCount = getShelfDecorCount(building.size[0])
  const shelfTopY = building.size[1] / 2 + 0.12
  const halfWidth = building.size[0] / 2 - 0.55

  return (
    <group position={building.position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={building.size} />
        <meshStandardMaterial color={building.color} roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0, building.size[1] / 2 + 0.06, 0]}>
        <boxGeometry args={[building.size[0] + 0.4, 0.12, building.size[2] + 0.4]} />
        <meshStandardMaterial color={building.roofColor} roughness={0.75} />
      </mesh>
      {Array.from({ length: decorCount }, (_, index) => {
        const decor = getShelfDecorPlacement(buildingKey, index, decorCount, halfWidth)
        return (
          <group
            key={`${buildingKey}-decor-${index}`}
            position={[decor.x, shelfTopY, decor.z]}
            rotation={[0, decor.rotationY, 0]}
          >
            <MiniSculpture variant={decor.variant} tone="light" />
          </group>
        )
      })}
    </group>
  )
}

export function Buildings() {
  return (
    <group>
      {buildings.map((building) => (
        <BuildingMesh key={`${building.position.join('-')}-${building.size.join('-')}`} building={building} />
      ))}
    </group>
  )
}
