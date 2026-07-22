import { getMuseumSurfaceLook, isMatchHallVenue } from '../game/venueConfig'
import { PlazaGlassWalls } from './PlazaGlassWalls'
import { PLAZA_HALF } from './plazaGlassWallConfig'

const PLAZA_SIZE = PLAZA_HALF * 2
const TILE_COUNT = 13
/** ガラス壁より内側に収める */
const TILE_INSET = 0.4
const TILE_GAP = 0.4

const tileStep = (PLAZA_SIZE - TILE_INSET * 2) / TILE_COUNT
const tileSize = tileStep - TILE_GAP
const firstTileCenter = -PLAZA_HALF + TILE_INSET + tileStep / 2
const tilePositions = Array.from(
  { length: TILE_COUNT },
  (_, index) => firstTileCenter + index * tileStep,
)

export function Plaza() {
  const look = getMuseumSurfaceLook()

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[PLAZA_SIZE, PLAZA_SIZE]} />
        <meshStandardMaterial color={look.plazaBaseColor} roughness={0.88} />
      </mesh>

      {tilePositions.map((x) =>
        tilePositions.map((z) => (
          <mesh
            key={`${x}-${z}`}
            receiveShadow
            rotation={[-Math.PI / 2, 0, 0]}
            position={[x, 0.025, z]}
          >
            <planeGeometry args={[tileSize, tileSize]} />
            <meshStandardMaterial
              color={(x + z) % 16 === 0 ? look.plazaTileA : look.plazaTileB}
              roughness={0.9}
            />
          </mesh>
        )),
      )}

      <GalleryFrame color={look.plazaFrameColor} neon={isMatchHallVenue()} />
      <PlazaGlassWalls />
    </group>
  )
}

function GalleryFrame({ color, neon }: { color: string; neon: boolean }) {
  const frameSize = 34
  const thickness = 0.5

  return (
    <group position={[0, 0.04, 0]}>
      <FrameBar
        position={[0, 0, -frameSize / 2]}
        size={[frameSize, thickness]}
        color={color}
        emissive={neon}
      />
      <FrameBar
        position={[0, 0, frameSize / 2]}
        size={[frameSize, thickness]}
        color={color}
        emissive={neon}
      />
      <FrameBar
        position={[-frameSize / 2, 0, 0]}
        size={[thickness, frameSize]}
        color={color}
        emissive={neon}
      />
      <FrameBar
        position={[frameSize / 2, 0, 0]}
        size={[thickness, frameSize]}
        color={color}
        emissive={neon}
      />
    </group>
  )
}

function FrameBar({
  position,
  size,
  color,
  emissive,
}: {
  position: [number, number, number]
  size: [number, number]
  color: string
  emissive: boolean
}) {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={size} />
      <meshStandardMaterial
        color={emissive ? '#0d1822' : '#1c1917'}
        emissive={emissive ? color : '#000000'}
        emissiveIntensity={emissive ? 0.55 : 0}
        roughness={0.9}
      />
    </mesh>
  )
}
