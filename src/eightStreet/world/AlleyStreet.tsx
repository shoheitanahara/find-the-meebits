import { Text } from '@react-three/drei'
import { DoubleSide } from 'three'
import { EIGHT_STREET, NIGHT_MOOD } from '../config'
import { eightStreetUi } from '../i18n'
import { useEightStreetStore } from '../store'
import { AsphaltDeck, BrickWall, StreetDressing } from './StreetDressing'

function SignPlate({
  position,
  rotationY = 0,
}: {
  position: [number, number, number]
  rotationY?: number
}) {
  const progress = useEightStreetStore((s) => s.progress)
  const label = eightStreetUi().streetLabel(progress)

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[2.4, 1.05, 0.14]} />
        <meshStandardMaterial color="#0b1220" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[2.2, 0.88, 0.04]} />
        <meshStandardMaterial
          color="#f8fafc"
          roughness={0.55}
          emissive="#f8fafc"
          emissiveIntensity={0.35}
        />
      </mesh>
      <Text position={[0, 0.05, 0.11]} fontSize={0.28} color="#0f172a" anchorX="center" anchorY="middle" maxWidth={2} textAlign="center">
        {label}
      </Text>
      <Text position={[0, -0.28, 0.11]} fontSize={0.1} color="#64748b" anchorX="center" anchorY="middle" letterSpacing={0.08}>
        MEEBITS ALLEY
      </Text>
    </group>
  )
}

/**
 * Crank-shaped alley:
 *   straight (−Z) → right (+X) → left (−Z) → next street.
 *
 * Thick brick volumes (street feel) with openings at the two corners.
 */
export function LAlleyStreet() {
  const width = EIGHT_STREET.halfWidth * 2
  const halfWidth = EIGHT_STREET.halfWidth
  const { returnEndZ, corner1Z, corner2X, exitZ } = EIGHT_STREET
  const wallHeight = 8.5
  const wallDepth = 3
  const entranceEndZ = returnEndZ
  const exitEndZ = exitZ - 12

  const legALength = entranceEndZ - corner1Z
  const legAMidZ = (entranceEndZ + corner1Z) / 2
  const legBLength = corner2X
  const legBMidX = corner2X / 2
  const legCLength = corner1Z - exitEndZ
  const legCMidZ = (corner1Z + exitEndZ) / 2

  // Close two sky-gaps: start-left deeper past corner1, exit-right back past corner2.
  const wallExtend = halfWidth + wallDepth
  const legAWestZ0 = corner1Z - wallExtend
  const legAWestZ1 = entranceEndZ
  const legAWestLen = legAWestZ1 - legAWestZ0
  const legAWestMid = (legAWestZ0 + legAWestZ1) / 2
  const legCEastZ0 = exitEndZ
  const legCEastZ1 = corner1Z + wallExtend
  const legCEastLen = legCEastZ1 - legCEastZ0
  const legCEastMid = (legCEastZ0 + legCEastZ1) / 2

  return (
    <group>
      <AsphaltDeck w={width} l={legALength} pos={[0, 0, legAMidZ]} />
      <AsphaltDeck w={legBLength} l={width} pos={[legBMidX, 0, corner1Z]} />
      <AsphaltDeck w={width} l={legCLength} pos={[corner2X, 0, legCMidZ]} />
      <AsphaltDeck w={width} l={width} pos={[0, 0.001, corner1Z]} />
      <AsphaltDeck w={width} l={width} pos={[corner2X, 0.001, corner1Z]} />

      {/* Leg A west (start left) — extends past the first corner into the deep side. */}
      <BrickWall
        pos={[-halfWidth - wallDepth / 2, wallHeight / 2, legAWestMid]}
        size={[wallDepth, wallHeight, legAWestLen]}
      />
      {/* Leg A east — stops for the right-turn opening. */}
      <BrickWall
        pos={[
          halfWidth + wallDepth / 2,
          wallHeight / 2,
          (entranceEndZ + corner1Z + halfWidth) / 2,
        ]}
        size={[wallDepth, wallHeight, entranceEndZ - corner1Z - halfWidth]}
      />

      {/* Leg B: south wall opens at x=0; north wall opens at x=corner2X. */}
      <BrickWall
        pos={[
          (halfWidth + corner2X + halfWidth) / 2,
          wallHeight / 2,
          corner1Z + halfWidth + wallDepth / 2,
        ]}
        size={[corner2X, wallHeight, wallDepth]}
      />
      <BrickWall
        pos={[
          (-halfWidth + corner2X - halfWidth) / 2,
          wallHeight / 2,
          corner1Z - halfWidth - wallDepth / 2,
        ]}
        size={[corner2X, wallHeight, wallDepth]}
      />

      {/* Leg C west — standard span. */}
      <BrickWall
        pos={[corner2X - halfWidth - wallDepth / 2, wallHeight / 2, legCMidZ]}
        size={[wallDepth, wallHeight, legCLength]}
      />
      {/* Leg C east (exit right) — extends back past the second corner toward the player. */}
      <BrickWall
        pos={[corner2X + halfWidth + wallDepth / 2, wallHeight / 2, legCEastMid]}
        size={[wallDepth, wallHeight, legCEastLen]}
      />

      <SignPlate position={[-halfWidth + 0.12, 2.5, -6]} rotationY={Math.PI / 2} />

      <StreetLampRow />
      <StreetDressing />

      <TransitionVeil
        position={[0, 0, EIGHT_STREET.returnTransitionZ + 1.2]}
        length={10}
      />
      <TransitionVeil
        position={[corner2X, 0, EIGHT_STREET.forwardTransitionZ - 1.5]}
        length={12}
      />

      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh
          key={`w${i}`}
          position={[-halfWidth - 0.06, 2.6 + (i % 3) * 1.5, -1 - i * 3.6]}
        >
          <boxGeometry args={[0.1, 1.1, 1.2]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#fde68a' : '#93c5fd'}
            emissive={i % 2 === 0 ? '#f59e0b' : '#3b82f6'}
            emissiveIntensity={i % 2 === 0 ? 1.8 : 1.4}
          />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={`wc${i}`}
          position={[corner2X + halfWidth + 0.06, 3.2 + (i % 2) * 1.6, corner1Z - 8 - i * 5]}
        >
          <boxGeometry args={[0.1, 1.0, 1.1]} />
          <meshStandardMaterial
            color="#fde68a"
            emissive="#f59e0b"
            emissiveIntensity={1.6}
          />
        </mesh>
      ))}

      <DestinationHouse />
    </group>
  )
}

type LampMount = {
  key: string
  x: number
  z: number
  /** Wall normal pointing into the street (for fixture offset). */
  nx: number
  nz: number
}

function sampleAlong(from: number, to: number, spacing: number, margin = 2.4): number[] {
  const lo = Math.min(from, to) + margin
  const hi = Math.max(from, to) - margin
  if (hi <= lo) return [(lo + hi) / 2]
  const points: number[] = []
  for (let t = lo; t <= hi + 0.001; t += spacing) points.push(t)
  return points
}

function buildLampMounts(): LampMount[] {
  const { halfWidth, returnEndZ, corner1Z, corner2X, exitZ } = EIGHT_STREET
  const spacing = NIGHT_MOOD.lampSpacing
  const wall = halfWidth - NIGHT_MOOD.lampInset
  const mounts: LampMount[] = []

  // Leg A (−Z): alternate left / right walls
  sampleAlong(returnEndZ, corner1Z + halfWidth + 1, spacing).forEach((z, i) => {
    const left = i % 2 === 0
    mounts.push({
      key: `a-${i}`,
      x: left ? -wall : wall,
      z,
      nx: left ? 1 : -1,
      nz: 0,
    })
  })

  // Leg B (+X): alternate north / south
  sampleAlong(halfWidth + 1, corner2X - halfWidth - 1, spacing, 1.8).forEach((x, i) => {
    const south = i % 2 === 0
    mounts.push({
      key: `b-${i}`,
      x,
      z: south ? corner1Z - wall : corner1Z + wall,
      nx: 0,
      nz: south ? 1 : -1,
    })
  })

  // Leg C (−Z)
  sampleAlong(corner1Z - halfWidth - 1, exitZ - 8, spacing).forEach((z, i) => {
    const left = i % 2 === 0
    mounts.push({
      key: `c-${i}`,
      x: left ? corner2X - wall : corner2X + wall,
      z,
      nx: left ? 1 : -1,
      nz: 0,
    })
  })

  return mounts
}

function StreetLampRow() {
  const mounts = buildLampMounts()
  return (
    <group>
      {mounts.map((m) => (
        <StreetLamp key={m.key} x={m.x} z={m.z} nx={m.nx} nz={m.nz} />
      ))}
    </group>
  )
}

function StreetLamp({
  x,
  z,
  nx,
  nz,
}: {
  x: number
  z: number
  nx: number
  nz: number
}) {
  const h = NIGHT_MOOD.lampHeight
  const color = NIGHT_MOOD.lampColor

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h * 0.42, 0]}>
        <cylinderGeometry args={[0.06, 0.08, h * 0.84, 6]} />
        <meshStandardMaterial color="#1c1917" metalness={0.45} roughness={0.55} />
      </mesh>
      <mesh position={[nx * 0.35, h * 0.9, nz * 0.35]}>
        <boxGeometry args={[0.12 + Math.abs(nx) * 0.55, 0.08, 0.12 + Math.abs(nz) * 0.55]} />
        <meshStandardMaterial color="#292524" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[nx * 0.55, h, nz * 0.55]}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={4}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
      {/* One point light per lamp — spotlights × N were the main FPS sink. */}
      <pointLight
        position={[nx * 0.7, h * 0.75, nz * 0.7]}
        intensity={NIGHT_MOOD.fillIntensity}
        distance={NIGHT_MOOD.fillDistance}
        decay={NIGHT_MOOD.lampDecay}
        color={color}
      />
    </group>
  )
}

/**
 * Soft white fog / light curtain used at street wrap points.
 * Cold white only — warm sodium stays on the main street.
 */
function TransitionVeil({
  position,
  length = 10,
}: {
  position: [number, number, number]
  length?: number
}) {
  const width = EIGHT_STREET.halfWidth * 2 - 0.15
  const height = 7.2
  const layers = 7
  const color = NIGHT_MOOD.veilColor
  const peak = NIGHT_MOOD.veilPeakOpacity

  return (
    <group position={position}>
      <pointLight
        position={[0, 2.6, 0]}
        intensity={NIGHT_MOOD.veilLightIntensity}
        distance={NIGHT_MOOD.veilLightDistance}
        decay={2}
        color={color}
      />

      {Array.from({ length: layers }, (_, i) => {
        const t = i / (layers - 1)
        const z = (t - 0.35) * length
        const opacity = peak * 0.35 + Math.sin(t * Math.PI) * peak * 0.65
        return (
          <mesh key={`veil-${i}`} position={[0, height * 0.48, z]} renderOrder={20}>
            <planeGeometry args={[width, height]} />
            <meshBasicMaterial
              color={color}
              transparent
              opacity={opacity}
              depthWrite={false}
              side={DoubleSide}
            />
          </mesh>
        )
      })}

      <mesh position={[0, height * 0.48, length * 0.05]} renderOrder={19}>
        <boxGeometry args={[width * 0.98, height * 0.95, length * 0.55]} />
        <meshBasicMaterial color={color} transparent opacity={NIGHT_MOOD.veilVolumeOpacity} depthWrite={false} />
      </mesh>
      <mesh position={[0, height * 0.48, -length * 0.12]} renderOrder={19}>
        <boxGeometry args={[width * 0.98, height * 0.9, length * 0.35]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={NIGHT_MOOD.veilVolumeOpacity * 0.7}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function DestinationHouse() {
  const phase = useEightStreetStore((s) => s.phase)
  if (phase !== 'cleared') return null
  const x = EIGHT_STREET.corner2X
  const z = EIGHT_STREET.exitZ - 8

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[3.2, 2.8, 3.2]} />
        <meshStandardMaterial color="#6b5240" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.6, 1.4, 4]} />
        <meshStandardMaterial color="#4a1c10" roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.1, 1.62]}>
        <boxGeometry args={[0.9, 1.8, 0.12]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
      <pointLight position={[0, 2.2, 2.2]} intensity={2.2} distance={9} color="#ffb066" />
      <Text position={[0, 2.5, 1.7]} fontSize={0.22} color="#f8fafc" anchorX="center">
        8
      </Text>
    </group>
  )
}

export function AlleyEnvironment() {
  return (
    <>
      <fog attach="fog" args={[NIGHT_MOOD.sky, NIGHT_MOOD.fogNear, NIGHT_MOOD.fogFar]} />
      <color attach="background" args={[NIGHT_MOOD.sky]} />
      <hemisphereLight
        args={[NIGHT_MOOD.hemiSky, NIGHT_MOOD.hemiGround, NIGHT_MOOD.hemiIntensity]}
      />
      <ambientLight intensity={NIGHT_MOOD.ambient} />
      <directionalLight
        position={[-8, 22, 10]}
        intensity={NIGHT_MOOD.moonIntensity}
        color={NIGHT_MOOD.moonColor}
        castShadow={false}
      />
    </>
  )
}
