import { PlazaGlassWalls } from './PlazaGlassWalls'
import { PLAZA_HALF } from './plazaGlassWallConfig'

const PLAZA_SIZE = PLAZA_HALF * 2
const TILE_COUNT = 13
/** ガラス壁より内側に収める（砂へはみ出す白タイルをなくす） */
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
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[PLAZA_SIZE, PLAZA_SIZE]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.88} />
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
            <meshStandardMaterial color={(x + z) % 16 === 0 ? '#fafaf9' : '#e7e5e4'} />
          </mesh>
        )),
      )}

      <GalleryFrame />
      <PlazaGlassWalls />
    </group>
  )
}

function GalleryFrame() {
  const frameSize = 34
  const thickness = 0.5

  return (
    <group position={[0, 0.04, 0]}>
      <FrameBar position={[0, 0, -frameSize / 2]} size={[frameSize, thickness]} />
      <FrameBar position={[0, 0, frameSize / 2]} size={[frameSize, thickness]} />
      <FrameBar position={[-frameSize / 2, 0, 0]} size={[thickness, frameSize]} />
      <FrameBar position={[frameSize / 2, 0, 0]} size={[thickness, frameSize]} />
    </group>
  )
}

function FrameBar({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={size} />
      <meshStandardMaterial color="#1c1917" roughness={0.9} />
    </mesh>
  )
}
