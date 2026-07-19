import { DoubleSide, Quaternion, Vector3 } from 'three'
import { EIGHT_STREET, NIGHT_MOOD } from '../config'
import { eightStreetUi } from '../i18n'
import { useEightStreetStore } from '../store'
import { AsphaltDeck, BrickWall, StreetDressing } from './StreetDressing'
import {
  drawRulesPoster,
  drawStreetSign,
  rulesPosterPixelSize,
  usePosterTexture,
} from './posterTextures'

const _rodUp = new Vector3(0, 1, 0)
const _rodDir = new Vector3()
const _rodQuat = new Quaternion()

function LampRod({
  from,
  to,
  radius = 0.03,
  color,
  metalness = 0.72,
  roughness = 0.38,
}: {
  from: [number, number, number]
  to: [number, number, number]
  radius?: number
  color: string
  metalness?: number
  roughness?: number
}) {
  const [ax, ay, az] = from
  const [bx, by, bz] = to
  const dx = bx - ax
  const dy = by - ay
  const dz = bz - az
  const len = Math.hypot(dx, dy, dz)
  if (len < 1e-4) return null

  const mid: [number, number, number] = [(ax + bx) / 2, (ay + by) / 2, (az + bz) / 2]
  _rodDir.set(dx, dy, dz).normalize()
  _rodQuat.setFromUnitVectors(_rodUp, _rodDir)

  return (
    <mesh position={mid} quaternion={_rodQuat.clone()}>
      <cylinderGeometry args={[radius, radius, len, 10]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  )
}

function SignPlate({
  position,
  rotationY = 0,
}: {
  position: [number, number, number]
  rotationY?: number
}) {
  const progress = useEightStreetStore((s) => s.progress)
  const label = eightStreetUi().streetLabel(progress)
  const map = usePosterTexture(
    (ctx, w, h) => drawStreetSign(ctx, w, h, label),
    512,
    220,
    [label],
  )

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[2.4, 1.05, 0.14]} />
        <meshStandardMaterial color="#0b1220" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[2.2, 0.88, 0.04]} />
        <meshStandardMaterial
          map={map}
          color="#ffffff"
          roughness={0.55}
          emissiveMap={map}
          emissive="#ffffff"
          emissiveIntensity={0.28}
        />
      </mesh>
    </group>
  )
}

/** Rules poster beside the street-number sign (locale-switched copy). */
function RulesPlate({
  position,
  rotationY = 0,
}: {
  position: [number, number, number]
  rotationY?: number
}) {
  const progress = useEightStreetStore((s) => s.progress)
  const copy = eightStreetUi()
  const { width: texW, height: texH } = rulesPosterPixelSize(copy.wallRulesTitle, copy.wallRules)
  const map = usePosterTexture(
    (ctx, w, h) => drawRulesPoster(ctx, w, h, copy.wallRulesTitle, copy.wallRules),
    texW,
    texH,
    [copy.wallRulesTitle, ...copy.wallRules, texW, texH],
  )

  // 0th Street is the warm-up beat — show rules from 1st Street onward.
  if (progress <= 0) return null

  // World size from texture aspect — compact board, little empty foot.
  const faceW = 2.05
  const faceH = faceW * (texH / texW)
  const frameW = faceW + 0.12
  const frameH = faceH + 0.12

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[frameW, frameH, 0.1]} />
        <meshStandardMaterial color="#78716c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[faceW, faceH, 0.03]} />
        <meshStandardMaterial
          map={map}
          color="#ffffff"
          roughness={0.72}
          emissiveMap={map}
          emissive="#ffffff"
          emissiveIntensity={0.1}
        />
      </mesh>
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

      <SignPlate position={[-halfWidth + 0.12, 2.55, -6]} rotationY={Math.PI / 2} />
      {/* Compact rules board tucked beside the street number, eye-level. */}
      <RulesPlate position={[-halfWidth + 0.12, 2.35, -3.55]} rotationY={Math.PI / 2} />

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
          position={[-halfWidth - 0.06, 2.6 + (i % 3) * 1.5, -10 - i * 3.6]}
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

function LampJoint({
  position,
  radius = 0.034,
  color,
}: {
  position: [number, number, number]
  radius?: number
  color: string
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, 10, 10]} />
      <meshStandardMaterial color={color} metalness={0.72} roughness={0.38} />
    </mesh>
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
  const iron = '#2a2c30'
  const ironDark = '#17181b'
  const brass = '#8a7355'
  const yaw = Math.atan2(nx, nz)

  // Connected polyline in local space (+Z into street).
  const base: [number, number, number] = [0, 0.02, 0.05]
  const elbow: [number, number, number] = [0, h * 0.88, 0.05]
  const bend: [number, number, number] = [0, h * 0.98, 0.34]
  const tip: [number, number, number] = [0, h * 0.9, 0.64]
  const hang: [number, number, number] = [0, h * 0.82, 0.64]

  return (
    <group position={[x, 0, z]} rotation={[0, yaw, 0]}>
      {/* Wall plate */}
      <mesh position={[0, elbow[1], -0.03]}>
        <boxGeometry args={[0.3, 0.46, 0.06]} />
        <meshStandardMaterial color={iron} metalness={0.72} roughness={0.38} />
      </mesh>
      <mesh position={[0, elbow[1], 0.01]}>
        <boxGeometry args={[0.16, 0.24, 0.04]} />
        <meshStandardMaterial color={brass} metalness={0.65} roughness={0.4} />
      </mesh>

      {/* Ground → elbow → curved arm → hang point (overlapping joints = no gaps). */}
      <LampRod from={base} to={elbow} radius={0.038} color={iron} />
      <LampJoint position={elbow} radius={0.042} color={iron} />
      <LampRod from={elbow} to={bend} radius={0.03} color={iron} />
      <LampJoint position={bend} radius={0.034} color={iron} />
      <LampRod from={bend} to={tip} radius={0.026} color={iron} />
      <LampJoint position={tip} radius={0.03} color={iron} />
      <LampRod from={tip} to={hang} radius={0.02} color={brass} metalness={0.65} />
      <LampJoint position={hang} radius={0.028} color={brass} />

      {/* Diagonal brace wall → mid-arm */}
      <LampRod
        from={[0, elbow[1] - 0.22, 0.05]}
        to={[0, bend[1] - 0.04, bend[2] - 0.02]}
        radius={0.012}
        color={brass}
        metalness={0.6}
        roughness={0.45}
      />

      {/* Lantern hangs from tip */}
      <group position={hang}>
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.07, 0.1, 0.05, 8]} />
          <meshStandardMaterial color={ironDark} metalness={0.75} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.12, 0]}>
          <cylinderGeometry args={[0.095, 0.095, 0.14, 8]} />
          <meshStandardMaterial color={iron} metalness={0.55} roughness={0.45} />
        </mesh>
        <mesh position={[0, -0.26, 0]}>
          <cylinderGeometry args={[0.09, 0.08, 0.2, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2.4}
            transparent
            opacity={0.88}
            roughness={0.25}
            metalness={0.05}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.085, 0.06, 0.08, 8]} />
          <meshStandardMaterial color={ironDark} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <sphereGeometry args={[0.032, 10, 10]} />
          <meshStandardMaterial color={brass} metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <coneGeometry args={[0.018, 0.055, 8]} />
          <meshStandardMaterial color={brass} metalness={0.7} roughness={0.35} />
        </mesh>
      </group>

      <pointLight
        position={[hang[0], hang[1] - 0.22, hang[2]]}
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
