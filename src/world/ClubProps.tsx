import {
  CLUB_BAR_PLACEMENTS,
  CLUB_COUCH_PLACEMENTS,
  CLUB_DJ_BOOTH_POSITION,
  CLUB_NEON_PLACEMENTS,
  CLUB_PARTITION_PLACEMENTS,
  CLUB_SPEAKER_PLACEMENTS,
  CLUB_VRM_SCULPTURE_PLACEMENTS,
  type ClubNeonPlacement,
} from './clubLandmarks'
import { VrmSculpture } from './VrmSculpture'

const EDGE_TRIM = '#f4f0ff'
const EDGE_EMISSIVE = 0.48

function PropEdge({
  position,
  size,
  color = EDGE_TRIM,
}: {
  position: [number, number, number]
  size: [number, number, number]
  color?: string
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={EDGE_EMISSIVE} roughness={0.35} />
    </mesh>
  )
}

function ClubPartition({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  const [width, height, depth] = size
  const postCount = Math.max(3, Math.round(width / 2.4))
  const postSpacing = width / (postCount - 1)
  const postXs = Array.from({ length: postCount }, (_, index) => -width / 2 + postSpacing * index)
  const ropeY = -height / 2 + 0.72
  const lowerRopeY = -height / 2 + 0.42

  return (
    <group position={position}>
      <mesh receiveShadow position={[0, -height / 2 + 0.03, 0]}>
        <boxGeometry args={[width, 0.06, depth * 0.55]} />
        <meshStandardMaterial color="#1a1028" roughness={0.92} metalness={0.08} />
      </mesh>

      {postXs.map((postX, index) => (
        <group key={`post-${index}`} position={[postX, -height / 2, 0]}>
          <mesh castShadow position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.16, 0.18, 0.1, 12]} />
            <meshStandardMaterial color="#27272a" metalness={0.75} roughness={0.28} />
          </mesh>
          <mesh castShadow position={[0, 0.52, 0]}>
            <cylinderGeometry args={[0.045, 0.05, 0.94, 10]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.88} roughness={0.22} />
          </mesh>
          <mesh position={[0, 1.02, 0]}>
            <sphereGeometry args={[0.075, 12, 12]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.18} emissive="#f59e0b" emissiveIntensity={0.12} />
          </mesh>
        </group>
      ))}

      {postXs.slice(0, -1).map((postX, index) => {
        const nextX = postXs[index + 1]
        const segmentWidth = nextX - postX
        const centerX = postX + segmentWidth / 2

        return (
          <group key={`rope-${index}`}>
            <mesh position={[centerX, ropeY, 0.02]}>
              <boxGeometry args={[segmentWidth * 0.96, 0.055, 0.055]} />
              <meshStandardMaterial color="#9f1239" roughness={0.78} emissive="#be123c" emissiveIntensity={0.08} />
            </mesh>
            <mesh position={[centerX, lowerRopeY, 0.02]}>
              <boxGeometry args={[segmentWidth * 0.96, 0.045, 0.045]} />
              <meshStandardMaterial color="#881337" roughness={0.82} emissive="#9f1239" emissiveIntensity={0.06} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function VipLounge({ rotationY, position }: { position: [number, number, number]; rotationY: number }) {
  const sofaVelvet = '#5b1d6d'
  const sofaHighlight = '#7e22ce'
  const gold = '#fbbf24'

  return (
    <group position={[position[0], 0, position[2]]} rotation={[0, rotationY, 0]} scale={2}>
      <mesh receiveShadow position={[0, 0.05, 0]}>
        <boxGeometry args={[4.1, 0.1, 3.5]} />
        <meshStandardMaterial color="#140b1f" roughness={0.55} metalness={0.18} />
      </mesh>
      <PropEdge color={gold} position={[0, 0.11, 0]} size={[4.12, 0.03, 3.52]} />

      <mesh position={[0, 0.13, 0.15]}>
        <boxGeometry args={[3.5, 0.03, 2.6]} />
        <meshStandardMaterial color="#7f1d1d" roughness={0.9} emissive="#991b1b" emissiveIntensity={0.05} />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.24, -0.95]}>
        <boxGeometry args={[3.2, 0.28, 0.72]} />
        <meshStandardMaterial color={sofaVelvet} roughness={0.82} />
      </mesh>
      <PropEdge color={gold} position={[0, 0.39, -0.95]} size={[3.22, 0.04, 0.74]} />
      <mesh castShadow position={[0, 0.42, -0.95]}>
        <boxGeometry args={[3.05, 0.34, 0.18]} />
        <meshStandardMaterial color={sofaHighlight} roughness={0.8} />
      </mesh>

      <mesh castShadow receiveShadow position={[-1.35, 0.24, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[2.1, 0.28, 0.72]} />
        <meshStandardMaterial color={sofaVelvet} roughness={0.82} />
      </mesh>
      <mesh castShadow position={[-1.35, 0.42, 0.05]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.95, 0.34, 0.18]} />
        <meshStandardMaterial color={sofaHighlight} roughness={0.8} />
      </mesh>

      {[-0.95, 0, 0.95].map((seatX) => (
        <mesh key={`seat-${seatX}`} castShadow position={[seatX, 0.18, -0.35]}>
          <boxGeometry args={[0.88, 0.16, 1.05]} />
          <meshStandardMaterial color="#6b21a8" roughness={0.84} />
        </mesh>
      ))}
      <mesh castShadow position={[-0.55, 0.18, 0.35]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[0.88, 0.16, 1.05]} />
        <meshStandardMaterial color="#6b21a8" roughness={0.84} />
      </mesh>

      {[
        [-1.05, 0.34, -0.55],
        [0.95, 0.34, -0.55],
        [-0.95, 0.34, 0.45],
      ].map(([pillowX, pillowY, pillowZ], index) => (
        <mesh key={`pillow-${index}`} position={[pillowX, pillowY, pillowZ]}>
          <boxGeometry args={[0.34, 0.18, 0.34]} />
          <meshStandardMaterial color={index === 1 ? '#f472b6' : '#c4b5fd'} roughness={0.75} emissive="#a855f7" emissiveIntensity={0.08} />
        </mesh>
      ))}

      <mesh castShadow position={[0.55, 0.28, 0.45]}>
        <cylinderGeometry args={[0.42, 0.48, 0.06, 20]} />
        <meshStandardMaterial color="#fafafa" roughness={0.2} metalness={0.12} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0.55, 0.18, 0.45]}>
        <cylinderGeometry args={[0.08, 0.12, 0.22, 12]} />
        <meshStandardMaterial color={gold} metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0.42, 0.34, 0.45]}>
        <cylinderGeometry args={[0.045, 0.05, 0.24, 10]} />
        <meshStandardMaterial color="#166534" roughness={0.55} />
      </mesh>
      {[
        [0.68, 0.31, 0.38],
        [0.68, 0.31, 0.52],
      ].map(([glassX, glassY, glassZ], index) => (
        <mesh key={`glass-${index}`} position={[glassX, glassY, glassZ]}>
          <cylinderGeometry args={[0.035, 0.04, 0.12, 10]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.15} metalness={0.05} transparent opacity={0.75} />
        </mesh>
      ))}

      <mesh position={[0, 1.05, -1.15]}>
        <boxGeometry args={[1.05, 0.16, 0.08]} />
        <meshStandardMaterial color={gold} emissive="#fbbf24" emissiveIntensity={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[-0.34, 1.05, -1.15]}>
        <boxGeometry args={[0.18, 0.16, 0.08]} />
        <meshStandardMaterial color="#f472b6" emissive="#ec4899" emissiveIntensity={0.75} />
      </mesh>
      <mesh position={[0.34, 1.05, -1.15]}>
        <boxGeometry args={[0.18, 0.16, 0.08]} />
        <meshStandardMaterial color="#f472b6" emissive="#ec4899" emissiveIntensity={0.75} />
      </mesh>

      {[-1.45, 1.45].map((stanchionX) => (
        <group key={`vip-rope-${stanchionX}`} position={[stanchionX, 0, 1.55]}>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.08, 10]} />
            <meshStandardMaterial color="#27272a" metalness={0.75} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.035, 0.04, 0.72, 8]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.88} roughness={0.22} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.5, 1.57]}>
        <boxGeometry args={[2.55, 0.04, 0.04]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.2} roughness={0.45} />
      </mesh>
    </group>
  )
}

function BarBottle({
  position,
  height = 0.34,
  bodyColor,
  labelColor,
}: {
  position: [number, number, number]
  height?: number
  bodyColor: string
  labelColor?: string
}) {
  const bodyHeight = height * 0.72
  const neckHeight = height * 0.2

  return (
    <group position={position}>
      <mesh castShadow position={[0, bodyHeight / 2, 0]}>
        <cylinderGeometry args={[0.055, 0.065, bodyHeight, 10]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} metalness={0.08} />
      </mesh>
      {labelColor ? (
        <mesh position={[0, bodyHeight * 0.45, 0.058]}>
          <boxGeometry args={[0.07, bodyHeight * 0.42, 0.01]} />
          <meshStandardMaterial color={labelColor} roughness={0.7} />
        </mesh>
      ) : null}
      <mesh position={[0, bodyHeight + neckHeight / 2, 0]}>
        <cylinderGeometry args={[0.022, 0.028, neckHeight, 8]} />
        <meshStandardMaterial color="#d4d4d8" roughness={0.35} metalness={0.25} />
      </mesh>
      <mesh position={[0, bodyHeight + neckHeight + 0.02, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.04, 8]} />
        <meshStandardMaterial color="#3f3f46" roughness={0.5} metalness={0.35} />
      </mesh>
    </group>
  )
}

function BarGlass({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.04, 0.045, 0.11, 10]} />
      <meshStandardMaterial color="#e0f2fe" roughness={0.12} metalness={0.04} transparent opacity={0.78} />
    </mesh>
  )
}

const BAR_BOTTLE_COLORS = [
  { body: '#78350f', label: '#fbbf24' },
  { body: '#14532d', label: '#fef08a' },
  { body: '#1e3a8a', label: '#ffffff' },
  { body: '#7f1d1d', label: '#fecaca' },
  { body: '#3f1d5c', label: '#e9d5ff' },
  { body: '#422006', label: '#fde68a' },
  { body: '#0f766e', label: '#ccfbf1' },
  { body: '#334155', label: '#cbd5e1' },
] as const

function WhiteSpeakerDriver({ y, radius }: { y: number; radius: number }) {
  return (
    <mesh position={[0, y, 0.42]}>
      <circleGeometry args={[radius, 28]} />
      <meshStandardMaterial color="#fafafa" emissive="#ffffff" emissiveIntensity={0.14} roughness={0.35} />
    </mesh>
  )
}

function ClubSpeaker({ position, rotationY }: { position: [number, number, number]; rotationY: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[1.1, 0.08, 0.85]} />
        <meshStandardMaterial color="#09090b" roughness={0.95} />
      </mesh>

      <mesh castShadow position={[0, 0.62, 0]}>
        <boxGeometry args={[1.05, 1.16, 0.8]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} metalness={0.05} />
      </mesh>
      <WhiteSpeakerDriver radius={0.34} y={0.62} />

      <mesh castShadow position={[0, 1.52, 0]}>
        <boxGeometry args={[0.95, 0.92, 0.74]} />
        <meshStandardMaterial color="#111111" roughness={0.88} metalness={0.06} />
      </mesh>
      <WhiteSpeakerDriver radius={0.26} y={1.52} />

      <mesh castShadow position={[0, 2.28, 0]}>
        <boxGeometry args={[0.82, 0.72, 0.66]} />
        <meshStandardMaterial color="#18181b" roughness={0.86} metalness={0.08} />
      </mesh>
      <WhiteSpeakerDriver radius={0.18} y={2.28} />
    </group>
  )
}

function ClubBar({
  position,
  rotationY,
  neonColor,
  barIndex,
}: {
  position: [number, number, number]
  rotationY: number
  neonColor: string
  barIndex: number
}) {
  const shelfBottleSlots = Array.from({ length: 18 }, (_, index) => {
    const row = Math.floor(index / 6)
    const col = index % 6
    const palette = BAR_BOTTLE_COLORS[(index + barIndex * 3) % BAR_BOTTLE_COLORS.length]
    return {
      x: -2.25 + col * 0.9,
      y: 0.92 + row * 0.38,
      z: -0.78,
      height: 0.28 + ((index + barIndex) % 4) * 0.05,
      ...palette,
    }
  })
  const counterBottleSlots = Array.from({ length: 10 }, (_, index) => {
    const palette = BAR_BOTTLE_COLORS[(index + barIndex * 5) % BAR_BOTTLE_COLORS.length]
    return {
      x: -2.4 + index * 0.52,
      y: 0.66,
      z: 0.18 + (index % 2) * 0.08,
      height: 0.22 + (index % 3) * 0.06,
      ...palette,
    }
  })

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[6, 0.44, 2]} />
        <meshStandardMaterial color="#2a1020" roughness={0.84} />
      </mesh>
      <mesh castShadow position={[0, 0.48, 0]}>
        <boxGeometry args={[6.1, 0.08, 2.08]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.35} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.24, -0.02]}>
        <boxGeometry args={[5.85, 0.04, 1.85]} />
        <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={0.35} roughness={0.4} />
      </mesh>

      <mesh castShadow position={[0, 1.05, -0.82]}>
        <boxGeometry args={[6.1, 1.55, 0.22]} />
        <meshStandardMaterial color="#1c0f18" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[0, 1.05, -0.7]}>
        <boxGeometry args={[5.7, 1.35, 0.02]} />
        <meshStandardMaterial color="#312e81" roughness={0.2} metalness={0.45} emissive="#4338ca" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 1.72, -0.68]}>
        <boxGeometry args={[5.8, 0.05, 0.08]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.25} roughness={0.35} />
      </mesh>

      {shelfBottleSlots.map((slot, index) => (
        <BarBottle
          key={`shelf-bottle-${index}`}
          bodyColor={slot.body}
          height={slot.height}
          labelColor={slot.label}
          position={[slot.x, slot.y, slot.z]}
        />
      ))}

      {counterBottleSlots.map((slot, index) => (
        <BarBottle
          key={`counter-bottle-${index}`}
          bodyColor={slot.body}
          height={slot.height}
          labelColor={slot.label}
          position={[slot.x, slot.y, slot.z]}
        />
      ))}

      {[-1.8, 1.8].map((tapX) => (
        <group key={`tap-${tapX}`} position={[tapX, 0.66, 0.42]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.28, 10]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.08]} />
            <meshStandardMaterial color="#71717a" metalness={0.65} roughness={0.35} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.58, 0.55]}>
        <cylinderGeometry args={[0.16, 0.18, 0.14, 14]} />
        <meshStandardMaterial color="#71717a" metalness={0.75} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.66, 0.55]}>
        <cylinderGeometry args={[0.13, 0.14, 0.08, 14]} />
        <meshStandardMaterial color="#e0f2fe" roughness={0.2} metalness={0.08} transparent opacity={0.7} />
      </mesh>

      {[
        [-0.55, 0.62, 0.62],
        [-0.2, 0.62, 0.64],
        [0.2, 0.62, 0.62],
        [0.55, 0.62, 0.64],
        [-0.38, 0.62, 0.48],
        [0.38, 0.62, 0.48],
      ].map((glassPosition, index) => (
        <BarGlass key={`glass-${index}`} position={glassPosition as [number, number, number]} />
      ))}

      <mesh position={[1.15, 0.64, 0.35]}>
        <cylinderGeometry args={[0.055, 0.06, 0.18, 10]} />
        <meshStandardMaterial color="#a8a29e" metalness={0.82} roughness={0.25} />
      </mesh>
      <mesh position={[1.15, 0.76, 0.35]}>
        <cylinderGeometry args={[0.08, 0.1, 0.06, 12]} />
        <meshStandardMaterial color="#a8a29e" metalness={0.82} roughness={0.25} />
      </mesh>

      <mesh position={[0, 1.82, -0.2]}>
        <boxGeometry args={[4.2, 0.05, 0.05]} />
        <meshStandardMaterial color="#d4d4d8" metalness={0.7} roughness={0.3} />
      </mesh>
      {[-1.5, -0.5, 0.5, 1.5].map((glassX) => (
        <mesh key={`hanging-${glassX}`} position={[glassX, 1.72, -0.2]}>
          <cylinderGeometry args={[0.035, 0.04, 0.12, 8]} />
          <meshStandardMaterial color="#e0f2fe" roughness={0.15} transparent opacity={0.72} />
        </mesh>
      ))}

      <group position={[0, 1.45, 0]}>
        <ClubNeonTube axis="x" color={neonColor} length={3.4} />
      </group>
    </group>
  )
}

function ClubNeonTube({
  color,
  axis,
  length,
}: {
  color: string
  axis: 'x' | 'y'
  length: number
}) {
  const size: [number, number, number] = axis === 'y' ? [0.14, length, 0.14] : [length, 0.14, 0.14]

  return (
    <mesh>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.15} roughness={0.3} />
    </mesh>
  )
}

function ClubNeonSign({
  position,
  color,
  rotationY,
  axis,
  length,
  height,
}: {
  position: [number, number, number]
  color: string
  rotationY: number
  axis: 'x' | 'y'
  length: number
  height?: number
}) {
  const tubeY = height ?? (axis === 'y' ? length / 2 : 2.1)

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {axis === 'y' ? (
        <mesh position={[0, tubeY / 2, 0]}>
          <boxGeometry args={[0.1, tubeY, 0.1]} />
          <meshStandardMaterial color="#2a1a38" roughness={0.9} />
        </mesh>
      ) : null}
      <group position={[0, tubeY, 0]}>
        <ClubNeonTube axis={axis} color={color} length={length} />
      </group>
    </group>
  )
}

function DjMixer() {
  const padColors = ['#f472b6', '#38bdf8', '#a78bfa', '#facc15'] as const
  const faderXs = [-0.38, -0.13, 0.13, 0.38] as const
  const knobXs = [-0.32, 0, 0.32] as const
  const knobZs = [-0.18, 0.08] as const

  return (
    <group position={[0, 0.64, 0.2]}>
      <mesh castShadow>
        <boxGeometry args={[1.05, 0.22, 1.1]} />
        <meshStandardMaterial color="#27272a" roughness={0.65} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.12, 0.35]}>
        <boxGeometry args={[0.92, 0.03, 0.14]} />
        <meshStandardMaterial color="#18181b" roughness={0.8} />
      </mesh>
      {faderXs.map((faderX) => (
        <mesh key={`fader-${faderX}`} position={[faderX, 0.14, 0.28]}>
          <boxGeometry args={[0.07, 0.05, 0.2]} />
          <meshStandardMaterial color="#71717a" metalness={0.45} roughness={0.4} />
        </mesh>
      ))}
      {knobXs.flatMap((knobX) =>
        knobZs.map((knobZ) => (
          <mesh key={`knob-${knobX}-${knobZ}`} position={[knobX, 0.13, knobZ]}>
            <cylinderGeometry args={[0.045, 0.045, 0.035, 12]} />
            <meshStandardMaterial color="#d4d4d8" metalness={0.55} roughness={0.35} />
          </mesh>
        )),
      )}
      {padColors.map((color, index) => (
        <mesh key={`pad-${color}`} position={[faderXs[index], 0.12, -0.28]}>
          <boxGeometry args={[0.09, 0.03, 0.09]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.45} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

function DjBooth() {
  const [x, y, z] = CLUB_DJ_BOOTH_POSITION

  return (
    <group position={[x, y, z]}>
      <mesh castShadow receiveShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[8, 0.44, 2.6]} />
        <meshStandardMaterial color="#2a1a3a" roughness={0.84} />
      </mesh>
      <PropEdge position={[0, 0.46, 0]} size={[8.05, 0.05, 2.62]} />

      <mesh castShadow position={[0, 0.58, -0.55]}>
        <boxGeometry args={[7.4, 0.5, 0.18]} />
        <meshStandardMaterial color="#312e81" emissive="#6366f1" emissiveIntensity={0.25} roughness={0.7} />
      </mesh>

      {[-1.5, 1.5].map((offsetX) => (
        <group key={offsetX} position={[offsetX, 0.62, 0.15]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.06, 24]} />
            <meshStandardMaterial color="#18181b" roughness={0.55} metalness={0.35} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.04, 12]} />
            <meshStandardMaterial color="#fafafa" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      <DjMixer />

      {[-3.1, 3.1].map((offsetX) => (
        <group key={offsetX} position={[offsetX, 0.72, -0.1]} rotation={[0, offsetX > 0 ? -0.35 : 0.35, 0]}>
          <mesh castShadow position={[0, 0.18, 0]}>
            <boxGeometry args={[0.55, 0.36, 0.42]} />
            <meshStandardMaterial color="#18181b" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0.22]}>
            <circleGeometry args={[0.14, 16]} />
            <meshStandardMaterial color="#a78bfa" emissive="#c4b5fd" emissiveIntensity={0.7} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.86, -0.62]}>
        <boxGeometry args={[6.8, 0.22, 0.08]} />
        <meshStandardMaterial color="#f0abfc" emissive="#e879f9" emissiveIntensity={0.85} />
      </mesh>
    </group>
  )
}

export function ClubProps() {
  return (
    <group>
      {CLUB_PARTITION_PLACEMENTS.map((partition, index) => (
        <ClubPartition
          key={`partition-${index}`}
          position={[...partition.position]}
          size={[...partition.size]}
        />
      ))}
      {CLUB_COUCH_PLACEMENTS.map((couch, index) => (
        <VipLounge
          key={`vip-${index}`}
          position={[...couch.position]}
          rotationY={couch.rotationY}
        />
      ))}
      {CLUB_SPEAKER_PLACEMENTS.map((speaker, index) => (
        <ClubSpeaker
          key={`speaker-${index}`}
          position={[...speaker.position]}
          rotationY={speaker.rotationY}
        />
      ))}
      {CLUB_BAR_PLACEMENTS.map((bar, index) => (
        <ClubBar
          key={`bar-${index}`}
          barIndex={index}
          neonColor={bar.neonColor}
          position={[...bar.position]}
          rotationY={bar.rotationY}
        />
      ))}
      {(CLUB_NEON_PLACEMENTS as ReadonlyArray<ClubNeonPlacement>).map((neon, index) => (
        <ClubNeonSign
          key={`neon-${index}`}
          axis={neon.axis}
          color={neon.color}
          height={neon.height}
          length={neon.length}
          position={[...neon.position]}
          rotationY={neon.rotationY}
        />
      ))}
      {CLUB_VRM_SCULPTURE_PLACEMENTS.map((placement) => (
        <VrmSculpture
          key={`club-vrm-${placement.meebitId}`}
          meebitId={placement.meebitId}
          pedestal={placement.pedestal}
          position={[...placement.position]}
          sculptureTone="club"
        />
      ))}
      <DjBooth />
    </group>
  )
}
