import { PerspectiveCamera, Stars, Text } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Group, MathUtils, Vector2, Vector3 } from 'three'
import { MeebitSilhouette } from '../avatar/MeebitSilhouette'
import { applyVRMLocomotion, getNpcWalkPhaseOffset } from '../avatar/VRMLocomotion'
import { useKeyboardControls } from '../avatar/useKeyboardControls'
import { useVRMModel } from '../avatar/useVRMModel'
import { CAMERA_FOLLOW_OFFSET_XZ, VRM_WORLD_SCALE } from '../game/gameConfig'
import { getLocale } from '../i18n/locale'
import { useTouchControlsStore } from '../stores/touchControlsStore'
import { playSfx } from '../ui/sfx'
import { VrmSculpture } from '../world/VrmSculpture'
import { TOP_ATTRACTIONS, type Attraction } from './topConfig'
import { useTopStore, type AttractionId } from './topStore'

const MOVE_SPEED = 7
const HUB_BOUNDS_X = 18.5
const HUB_MIN_Z = -9.3
const HUB_MAX_Z = 14
const ENTER_DISTANCE = 3.1
const ENTRANCE_HALF_WIDTH = 1.15
const ENTRANCE_TRIGGER_DEPTH = 0.7
const TOP_NPC_COUNT = 30
const TOP_NPC_WALK_SPEED = 1.15
const PLAYER_COLLISION_RADIUS = 0.42
const BENCH_HALF_WIDTH = 0.48
const BENCH_HALF_LENGTH = 1.28
const BENCH_PLACEMENTS = [
  [-16.8, 8, Math.PI / 2],
  [16.8, 8, -Math.PI / 2],
  [-16.8, -1.5, Math.PI / 2],
  [16.8, -1.5, -Math.PI / 2],
] as const
const TOP_NPC_WALK_PATTERNS = [
  { walkSeconds: [4.5, 8], idleSeconds: [0.8, 1.8], turnSpread: Math.PI * 0.35 },
  { walkSeconds: [3, 6], idleSeconds: [1.5, 3], turnSpread: Math.PI * 0.65 },
  { walkSeconds: [2, 4.5], idleSeconds: [3, 5.5], turnSpread: Math.PI * 0.5 },
] as const
const movement = new Vector2()
const cameraOffset = new Vector3(CAMERA_FOLLOW_OFFSET_XZ[0], 6.5, CAMERA_FOLLOW_OFFSET_XZ[1])
const cameraPosition = new Vector3()
const cameraTarget = new Vector3()

export function TopScene({ onEnter }: { onEnter: (id: AttractionId) => void }) {
  const locale = getLocale()

  return (
    <>
      <color attach="background" args={['#111a33']} />
      <fog attach="fog" args={['#17233d', 34, 82]} />
      <Stars radius={72} depth={28} count={900} factor={2.2} saturation={0.15} fade speed={0.25} />
      <PerspectiveCamera
        makeDefault
        position={[0, 6.5, 18]}
        fov={45}
        near={0.1}
        far={100}
      />
      <TopFollowCamera />
      <ambientLight intensity={0.82} color="#c4c9eb" />
      <hemisphereLight args={['#8492c3', '#35293a', 1.45]} />
      <directionalLight
        castShadow
        position={[-14, 20, 10]}
        intensity={2.25}
        color="#d8e1ff"
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-24}
        shadow-camera-right={24}
        shadow-camera-top={24}
        shadow-camera-bottom={-24}
      />
      <pointLight position={[0, 9, 2]} intensity={38} distance={38} color="#ffd38a" />

      <HubGround />
      <ParkLamps />
      <ParkDetails />
      {TOP_ATTRACTIONS.map((attraction) => (
        <AttractionBuilding
          key={attraction.id}
          attraction={attraction}
          locale={locale}
          onEnter={onEnter}
        />
      ))}
      <TopNpcCrowd />
      <TopPlayer />
      <TopPlayerController onEnter={onEnter} />
    </>
  )
}

/** Hunt 本編と同じ固定オフセットで、プレイヤーだけを追従するカメラ。 */
function TopFollowCamera() {
  useFrame(({ camera }, delta) => {
    const player = useTopStore.getState()

    cameraPosition.set(player.x, 0, player.z).add(cameraOffset)
    cameraTarget.set(player.x, 1.4, player.z)
    camera.position.lerp(cameraPosition, 1 - Math.exp(-delta * 5))
    camera.lookAt(cameraTarget)
  })

  return null
}

function HubGround() {
  return (
    <group>
      {/* 島の外側を覆う、月明かりを反射する海。 */}
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial
          color="#0b4163"
          emissive="#0d5275"
          emissiveIntensity={0.2}
          metalness={0.45}
          roughness={0.24}
        />
      </mesh>
      <mesh position={[0, -0.25, 0]} receiveShadow>
        <cylinderGeometry args={[26, 27, 0.5, 64]} />
        <meshStandardMaterial color="#3a3440" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.015, 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[25.3, 64]} />
        <meshStandardMaterial color="#303746" roughness={0.88} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.035, 1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[29, 31]} />
        <meshStandardMaterial color="#554d52" roughness={0.82} metalness={0.08} />
      </mesh>
      {/* 大判の敷石で中央通りに奥行きと素材感を加える。 */}
      {Array.from({ length: 16 }, (_, index) => 14.2 - index * 1.9).map((z, index) => (
        <mesh key={`paver-${z}`} position={[0, 0.055, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[28.6, 1.72]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#5e565b' : '#50494f'} roughness={0.9} />
        </mesh>
      ))}
      {[-14.45, 14.45].map((x) => (
        <mesh key={`path-edge-${x}`} position={[x, 0.07, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.18, 30.8]} />
          <meshStandardMaterial color="#b89758" metalness={0.42} roughness={0.42} />
        </mesh>
      ))}
      <mesh position={[0, 0.05, 3.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.85, 48]} />
        <meshStandardMaterial color="#7b6648" metalness={0.25} roughness={0.62} />
      </mesh>
      <Fountain />
      <FountainStatue />
      {[-21.5, 21.5].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          {[-11, -4, 3, 10].map((z) => (
            <Tree key={z} z={z} />
          ))}
        </group>
      ))}
    </group>
  )
}

function Fountain() {
  return (
    <group position={[0, 0, 3.4]}>
      <mesh position={[0, 0.18, 0]} receiveShadow>
        <cylinderGeometry args={[1.82, 1.95, 0.34, 48]} />
        <meshStandardMaterial color="#8c806f" metalness={0.24} roughness={0.58} />
      </mesh>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[1.5, 1.75, 0.6, 32]} />
        <meshStandardMaterial color="#9a8c78" metalness={0.28} roughness={0.52} />
      </mesh>
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[1.42, 1.42, 0.1, 48]} />
        <meshStandardMaterial color="#287da1" emissive="#2696bd" emissiveIntensity={0.42} roughness={0.12} metalness={0.32} />
      </mesh>
      <mesh position={[0, 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.47, 0.1, 12, 48]} />
        <meshStandardMaterial color="#c4b596" metalness={0.4} roughness={0.42} />
      </mesh>
      <pointLight position={[0, 2.5, 0]} intensity={18} distance={10} color="#7cddff" />
    </group>
  )
}

/** 噴水中央の Meebit #11143 銅像。丸い石柱の上に立たせる。 */
function FountainStatue() {
  return (
    <group position={[0, 0, 3.4]}>
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.78, 1.1, 32]} />
        <meshStandardMaterial color="#b7a884" metalness={0.24} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.54, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.66, 0.16, 32]} />
        <meshStandardMaterial color="#c8b896" metalness={0.32} roughness={0.5} />
      </mesh>
      <VrmSculpture
        meebitId={11143}
        position={[0, 1.62, 0]}
        pedestal="light"
        facingY={0}
        hidePedestal
      />
    </group>
  )
}

function Tree({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.72, 0.82, 0.56, 16]} />
        <meshStandardMaterial color="#79654f" roughness={0.68} />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.2, 0.35, 2.4, 10]} />
        <meshStandardMaterial color="#5b4030" roughness={0.92} />
      </mesh>
      {[
        [0, 3.05, 0, 1.2],
        [-0.72, 2.75, 0.12, 0.82],
        [0.68, 2.82, -0.08, 0.9],
        [0, 3.65, 0.02, 0.78],
      ].map(([x, y, treeZ, scale], index) => (
        <mesh key={`crown-${index}`} position={[x, y, treeZ]} scale={scale}>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#285849' : '#34705a'} roughness={0.94} />
        </mesh>
      ))}
    </group>
  )
}

function ParkLamps() {
  const lampPositions: Array<[number, number]> = [
    [-8.5, 10],
    [8.5, 10],
    [-8.5, 5],
    [8.5, 5],
    [-8.5, 0],
    [8.5, 0],
    [-17.5, 10],
    [17.5, 10],
    [-18, 0],
    [18, 0],
  ]

  return (
    <group>
      {lampPositions.map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.23, 0.3, 0.24, 12]} />
            <meshStandardMaterial color="#2d2930" metalness={0.72} roughness={0.28} />
          </mesh>
          <mesh position={[0, 1.55, 0]}>
            <cylinderGeometry args={[0.065, 0.11, 3.1, 12]} />
            <meshStandardMaterial color="#343039" metalness={0.76} roughness={0.28} />
          </mesh>
          <mesh position={[0, 2.9, 0]}>
            <boxGeometry args={[0.95, 0.06, 0.06]} />
            <meshStandardMaterial color="#343039" metalness={0.76} roughness={0.28} />
          </mesh>
          {[-0.42, 0.42].map((lanternX) => (
            <group key={lanternX} position={[lanternX, 3.05, 0]}>
              <mesh>
                <sphereGeometry args={[0.19, 14, 12]} />
                <meshStandardMaterial color="#fff0bd" emissive="#f6b84f" emissiveIntensity={3.2} />
              </mesh>
              <mesh position={[0, 0.25, 0]}>
                <coneGeometry args={[0.23, 0.22, 8]} />
                <meshStandardMaterial color="#343039" metalness={0.74} roughness={0.3} />
              </mesh>
            </group>
          ))}
          <pointLight position={[0, 3.05, 0]} intensity={14} distance={8.5} color="#ffd080" />
        </group>
      ))}
    </group>
  )
}

function ParkDetails() {
  return (
    <group>
      {BENCH_PLACEMENTS.map(([x, z, rotationY], index) => (
        <ClassicBench key={`bench-${index}`} position={[x, 0, z]} rotationY={rotationY} />
      ))}
      {[
        [-17, 12],
        [17, 12],
        [-17, 3.2],
        [17, 3.2],
      ].map(([x, z], index) => (
        <FlowerPlanter key={`planter-${index}`} position={[x, 0, z]} />
      ))}
      {[-1, 1].map((side) => (
        <group key={`railing-${side}`} position={[side * 20.2, 0, 1]}>
          {Array.from({ length: 14 }, (_, index) => -11.5 + index * 1.9).map((z) => (
            <group key={z} position={[0, 0, z]}>
              <mesh position={[0, 0.55, 0]}>
                <cylinderGeometry args={[0.035, 0.05, 1.1, 8]} />
                <meshStandardMaterial color="#3b3540" metalness={0.72} roughness={0.32} />
              </mesh>
              <mesh position={[0, 1.16, 0]}>
                <coneGeometry args={[0.09, 0.28, 8]} />
                <meshStandardMaterial color="#b28c4d" metalness={0.7} roughness={0.3} />
              </mesh>
            </group>
          ))}
          {[0.48, 0.92].map((y) => (
            <mesh key={y} position={[0, y, 0.85]}>
              <boxGeometry args={[0.05, 0.05, 24.8]} />
              <meshStandardMaterial color="#3b3540" metalness={0.72} roughness={0.32} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function ClassicBench({
  position,
  rotationY,
}: {
  position: [number, number, number]
  rotationY: number
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[0.34, 0.62, 0.9].map((y) => (
        <mesh key={y} position={[0, y, -0.28]}>
          <boxGeometry args={[2.25, 0.14, 0.12]} />
          <meshStandardMaterial color="#8a5437" roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0, 0.46, 0.08]}>
        <boxGeometry args={[2.25, 0.16, 0.65]} />
        <meshStandardMaterial color="#9c6240" roughness={0.7} />
      </mesh>
      {[-0.92, 0.92].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.28, 0]}>
            <boxGeometry args={[0.1, 0.56, 0.62]} />
            <meshStandardMaterial color="#353039" metalness={0.68} roughness={0.34} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function FlowerPlanter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.7, 0.58, 0.7, 16]} />
        <meshStandardMaterial color="#a18b70" roughness={0.7} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * Math.PI * 2
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.38, 0.85, Math.sin(angle) * 0.38]}>
            <sphereGeometry args={[0.22, 10, 8]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? '#d47b9a' : '#e2b35f'}
              emissive={index % 2 === 0 ? '#8a3455' : '#9b6724'}
              emissiveIntensity={0.18}
              roughness={0.75}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function AttractionBuilding({
  attraction,
  locale,
  onEnter,
}: {
  attraction: Attraction
  locale: 'en' | 'ja'
  onEnter: (id: AttractionId) => void
}) {
  const accentColor =
    attraction.id === 'find' ? '#f4c76b' : attraction.id === 'traits' ? '#69d4ed' : '#d894e8'
  const infoBoardX = attraction.x > 0 ? -4.2 : 4.2

  return (
    <group
      position={[attraction.x, 0, attraction.z]}
      onClick={(event) => {
        event.stopPropagation()
        onEnter(attraction.id)
      }}
    >
      <mesh position={[0, 2.175, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 4.35, 5]} />
        <meshStandardMaterial color={attraction.color} roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh position={[0, 5.45, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[5.1, 2.2, 4]} />
        <meshStandardMaterial color={attraction.roofColor} roughness={0.6} metalness={0.22} />
      </mesh>
      <mesh position={[0, 6.65, 0]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#e4bd6f" emissive="#b47b2d" emissiveIntensity={0.5} metalness={0.72} roughness={0.26} />
      </mesh>
      <mesh position={[0, 7.05, 0]}>
        <coneGeometry args={[0.16, 0.72, 12]} />
        <meshStandardMaterial color="#d5ab5e" metalness={0.72} roughness={0.28} />
      </mesh>
      <mesh position={[0, 4.35, 2.54]}>
        <boxGeometry args={[7.05, 0.09, 0.12]} />
        <meshStandardMaterial color="#ad8747" emissive="#8b632b" emissiveIntensity={0.32} metalness={0.72} roughness={0.28} />
      </mesh>
      {[-3.15, 3.15].map((x) => (
        <mesh key={`column-${x}`} position={[x, 2.18, 2.57]}>
          <boxGeometry args={[0.16, 4.2, 0.16]} />
          <meshStandardMaterial color="#9c7b48" metalness={0.55} roughness={0.38} />
        </mesh>
      ))}
      {[-2.15, 2.15].map((x) => (
        <group key={`window-frame-${x}`} position={[x, 1.8, 2.66]}>
          <mesh>
            <boxGeometry args={[1.5, 1.82, 0.11]} />
            <meshStandardMaterial color="#b18b50" metalness={0.58} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.07]}>
            <boxGeometry args={[1.22, 1.54, 0.08]} />
            <meshStandardMaterial color="#ffe1a4" emissive={accentColor} emissiveIntensity={0.85} roughness={0.24} />
          </mesh>
          <mesh position={[0, 0, 0.13]}>
            <boxGeometry args={[0.06, 1.5, 0.05]} />
            <meshStandardMaterial color="#725b3d" metalness={0.45} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.13]}>
            <boxGeometry args={[1.18, 0.06, 0.05]} />
            <meshStandardMaterial color="#725b3d" metalness={0.45} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.16, 2.72]}>
        <boxGeometry args={[2.8, 0.3, 1.25]} />
        <meshStandardMaterial color="#17131a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.55, 2.54]}>
        <boxGeometry args={[2.3, 3.1, 0.18]} />
        <meshStandardMaterial color="#08090d" roughness={0.65} />
      </mesh>
      <mesh position={[0, 2.95, 3.08]} rotation={[Math.PI / 10, 0, 0]}>
        <boxGeometry args={[3.15, 0.12, 1.05]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.24} metalness={0.2} roughness={0.52} />
      </mesh>
      {[-1.32, 1.32].map((x) => (
        <mesh key={`awning-bracket-${x}`} position={[x, 2.66, 2.78]}>
          <boxGeometry args={[0.07, 0.68, 0.07]} />
          <meshStandardMaterial color="#b59050" metalness={0.62} roughness={0.34} />
        </mesh>
      ))}
      <mesh position={[0, 3.75, 2.65]}>
        <boxGeometry args={[5.6, 1.15, 0.22]} />
        <meshStandardMaterial
          color="#17131a"
          emissive="#7f5b24"
          emissiveIntensity={0.34}
          roughness={0.5}
          metalness={0.25}
        />
      </mesh>
      <Text
        position={[0, 3.78, 2.78]}
        fontSize={0.52}
        color="#f6df9d"
        anchorX="center"
        anchorY="middle"
        maxWidth={5.1}
      >
        {attraction.title}
      </Text>
      <Text
        position={[0, 3.15, 2.7]}
        fontSize={0.24}
        color="#c5bda9"
        anchorX="center"
        anchorY="middle"
      >
        {attraction.subtitle}
      </Text>
      <pointLight position={[0, 2.2, 3.8]} intensity={9} distance={9} color={accentColor} />
      <AttractionInfoBoard
        position={[infoBoardX, 0, 3.25]}
        accentColor={accentColor}
        description={attraction.description[locale]}
        heading={attraction.storyTitle[locale]}
      />
    </group>
  )
}

function AttractionInfoBoard({
  position,
  accentColor,
  description,
  heading,
}: {
  position: [number, number, number]
  accentColor: string
  description: string
  heading: string
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[2.9, 0.24, 1.05]} />
        <meshStandardMaterial color="#29242c" roughness={0.62} />
      </mesh>
      {[-1.12, 1.12].map((x) => (
        <mesh key={x} position={[x, 1.15, 0]}>
          <cylinderGeometry args={[0.055, 0.075, 2.15, 10]} />
          <meshStandardMaterial color="#a8864d" metalness={0.66} roughness={0.34} />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0.04]}>
        <boxGeometry args={[3.05, 1.58, 0.16]} />
        <meshStandardMaterial
          color="#17151d"
          emissive={accentColor}
          emissiveIntensity={0.08}
          metalness={0.18}
          roughness={0.5}
        />
      </mesh>
      <Text
        position={[0, 1.98, 0.15]}
        fontSize={0.18}
        color={accentColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.6}
      >
        {heading}
      </Text>
      <Text
        position={[0, 1.46, 0.15]}
        fontSize={0.2}
        lineHeight={1.45}
        color="#f1eadc"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        maxWidth={2.65}
      >
        {description}
      </Text>
    </group>
  )
}

type TopNpcSpawn = {
  meebitNumber: number
  x: number
  z: number
  rotationY: number
  walkPattern: 0 | 1 | 2
}

function createTopNpcSpawns(): TopNpcSpawn[] {
  const spawns: TopNpcSpawn[] = []
  const usedMeebitNumbers = new Set<number>([11143])
  let attempts = 0

  while (spawns.length < TOP_NPC_COUNT && attempts < 2000) {
    attempts += 1
    const x = MathUtils.randFloat(-18, 18)
    const z = MathUtils.randFloat(-4.8, 13)

    if (!isTopNpcPositionWalkable(x, z)) continue
    if (spawns.some((spawn) => Math.hypot(spawn.x - x, spawn.z - z) < 1.45)) continue

    let meebitNumber = MathUtils.randInt(1, 20000)
    while (usedMeebitNumbers.has(meebitNumber)) {
      meebitNumber = MathUtils.randInt(1, 20000)
    }
    usedMeebitNumbers.add(meebitNumber)

    spawns.push({
      meebitNumber,
      x,
      z,
      rotationY: Math.random() * Math.PI * 2,
      walkPattern: (spawns.length % TOP_NPC_WALK_PATTERNS.length) as 0 | 1 | 2,
    })
  }

  return spawns
}

function isTopNpcPositionWalkable(x: number, z: number) {
  if (Math.abs(x) > 18.2 || z < -5 || z > 13.3) return false
  if (Math.hypot(x, z - 3.4) < 3.25) return false
  if (Math.hypot(x, z - 8) < 2.2) return false

  for (const [benchX, benchZ] of BENCH_PLACEMENTS) {
    if (
      Math.abs(x - benchX) < BENCH_HALF_WIDTH + 0.5 &&
      Math.abs(z - benchZ) < BENCH_HALF_LENGTH + 0.5
    ) {
      return false
    }
  }

  for (const attraction of TOP_ATTRACTIONS) {
    if (Math.hypot(x - attraction.x, z - attraction.entranceZ) < 2.8) return false

    const infoBoardX = attraction.x + (attraction.x > 0 ? -4.2 : 4.2)
    const infoBoardZ = attraction.z + 3.25
    if (Math.abs(x - infoBoardX) < 2 && Math.abs(z - infoBoardZ) < 1.1) return false
  }

  return true
}

function resolveBenchCollisions(x: number, z: number) {
  let resolvedX = x
  let resolvedZ = z

  for (const [benchX, benchZ] of BENCH_PLACEMENTS) {
    const deltaX = resolvedX - benchX
    const deltaZ = resolvedZ - benchZ
    const collisionHalfX = BENCH_HALF_WIDTH + PLAYER_COLLISION_RADIUS
    const collisionHalfZ = BENCH_HALF_LENGTH + PLAYER_COLLISION_RADIUS

    if (Math.abs(deltaX) >= collisionHalfX || Math.abs(deltaZ) >= collisionHalfZ) continue

    const penetrationX = collisionHalfX - Math.abs(deltaX)
    const penetrationZ = collisionHalfZ - Math.abs(deltaZ)
    if (penetrationX < penetrationZ) {
      resolvedX = benchX + (deltaX >= 0 ? collisionHalfX : -collisionHalfX)
    } else {
      resolvedZ = benchZ + (deltaZ >= 0 ? collisionHalfZ : -collisionHalfZ)
    }
  }

  return { x: resolvedX, z: resolvedZ }
}

function TopNpcCrowd() {
  const started = useTopStore((state) => state.started)
  const spawns = useMemo(createTopNpcSpawns, [])

  if (!started) return null

  return (
    <group>
      {spawns.map((spawn, index) => (
        <TopNpc key={spawn.meebitNumber} spawn={spawn} index={index} />
      ))}
    </group>
  )
}

function TopNpc({ spawn, index }: { spawn: TopNpcSpawn; index: number }) {
  const groupRef = useRef<Group>(null)
  const walkPattern = TOP_NPC_WALK_PATTERNS[spawn.walkPattern]
  const isWalkingRef = useRef(Math.random() > 0.35)
  const behaviorTimerRef = useRef(
    isWalkingRef.current
      ? MathUtils.randFloat(walkPattern.walkSeconds[0], walkPattern.walkSeconds[1])
      : MathUtils.randFloat(walkPattern.idleSeconds[0], walkPattern.idleSeconds[1]),
  )
  const rotationYRef = useRef(spawn.rotationY)
  const targetRotationYRef = useRef(spawn.rotationY)
  const localTimeRef = useRef(index * 0.37)
  const walkPhaseOffset = getNpcWalkPhaseOffset(spawn.walkPattern)
  const { vrmRef, vrmScene, update } = useVRMModel(
    spawn.meebitNumber,
    true,
    120 + index,
    true,
    // Exclusive: プール共有クローンはテンプレの骨を共有し、表示メッシュに
    // ロコモーションが届かず T ポーズのままになるため単独ロードする。
    true,
  )

  useFrame((_, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05)
    const group = groupRef.current
    localTimeRef.current += safeDelta
    behaviorTimerRef.current -= safeDelta

    if (behaviorTimerRef.current <= 0) {
      isWalkingRef.current = !isWalkingRef.current
      behaviorTimerRef.current = isWalkingRef.current
        ? MathUtils.randFloat(walkPattern.walkSeconds[0], walkPattern.walkSeconds[1])
        : MathUtils.randFloat(walkPattern.idleSeconds[0], walkPattern.idleSeconds[1])

      if (isWalkingRef.current) {
        targetRotationYRef.current += MathUtils.randFloatSpread(walkPattern.turnSpread)
      }
    }

    if (group && isWalkingRef.current) {
      const angleDelta = Math.atan2(
        Math.sin(targetRotationYRef.current - rotationYRef.current),
        Math.cos(targetRotationYRef.current - rotationYRef.current),
      )
      rotationYRef.current += angleDelta * (1 - Math.exp(-safeDelta * 2.4))

      const nextX =
        group.position.x + Math.sin(rotationYRef.current) * TOP_NPC_WALK_SPEED * safeDelta
      const nextZ =
        group.position.z + Math.cos(rotationYRef.current) * TOP_NPC_WALK_SPEED * safeDelta

      if (isTopNpcPositionWalkable(nextX, nextZ)) {
        group.position.x = nextX
        group.position.z = nextZ
      } else {
        rotationYRef.current += MathUtils.randFloat(Math.PI * 0.55, Math.PI * 1.15)
        targetRotationYRef.current = rotationYRef.current
        behaviorTimerRef.current = Math.min(behaviorTimerRef.current, 0.6)
      }
      group.rotation.y = rotationYRef.current
    }

    if (group) {
      group.position.y =
        0.06 + Math.sin(localTimeRef.current * 1.6 + walkPhaseOffset) * 0.03
    }

    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: isWalkingRef.current,
      isRunning: false,
      idleOffset: index * 0.61,
      walkPhaseOffset,
    })
    update(safeDelta)
  })

  return (
    <group
      ref={groupRef}
      position={[spawn.x, 0.06, spawn.z]}
      rotation={[0, spawn.rotationY, 0]}
    >
      {vrmScene ? <primitive object={vrmScene} scale={VRM_WORLD_SCALE} /> : null}
    </group>
  )
}

function TopPlayer() {
  const rootRef = useRef<Group>(null)
  const meebitNumber = useTopStore((state) => state.meebitNumber)
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 0, true, true)

  useFrame((state, delta) => {
    const player = useTopStore.getState()
    const root = rootRef.current
    if (root) {
      root.position.set(player.x, 0.06, player.z)
      root.rotation.y = player.rotationY
      if (player.isMoving) {
        root.position.y += Math.abs(Math.sin(state.clock.elapsedTime * 10.5)) * 0.025
      }
    }
    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: state.clock.elapsedTime,
      isMoving: player.isMoving,
      isRunning: player.isMoving,
    })
    update(delta)
  })

  return (
    <group ref={rootRef}>
      {vrmScene ? <primitive object={vrmScene} scale={VRM_WORLD_SCALE} /> : <MeebitSilhouette />}
    </group>
  )
}

function TopPlayerController({ onEnter }: { onEnter: (id: AttractionId) => void }) {
  const controlsRef = useKeyboardControls()
  const footstepTimer = useRef(0)
  const nearestRef = useRef<AttractionId | null>(null)
  const isEnteringRef = useRef(false)

  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.code !== 'Enter' && event.code !== 'Space') return
      const nearest = nearestRef.current
      if (nearest) onEnter(nearest)
    }
    window.addEventListener('keydown', handleEnter)
    return () => window.removeEventListener('keydown', handleEnter)
  }, [onEnter])

  useFrame((_, delta) => {
    const state = useTopStore.getState()
    const controls = controlsRef.current
    const touch = useTouchControlsStore.getState()
    movement.set(0, 0)

    if (touch.joystickActive) {
      movement.set(touch.joystickX, touch.joystickY)
    } else {
      if (controls.forward) movement.y -= 1
      if (controls.backward) movement.y += 1
      if (controls.left) movement.x -= 1
      if (controls.right) movement.x += 1
    }

    const moving = movement.lengthSq() > 0.001
    let x = state.x
    let z = state.z
    let rotationY = state.rotationY

    if (moving) {
      movement.normalize()
      x = MathUtils.clamp(x + movement.x * MOVE_SPEED * delta, -HUB_BOUNDS_X, HUB_BOUNDS_X)
      z = MathUtils.clamp(z + movement.y * MOVE_SPEED * delta, HUB_MIN_Z, HUB_MAX_Z)

      // Keep the player outside the fountain basin.
      const fountainDx = x
      const fountainDz = z - 3.4
      const fountainDistance = Math.hypot(fountainDx, fountainDz)
      if (fountainDistance < 2.05) {
        const scale = 2.05 / Math.max(fountainDistance, 0.001)
        x = fountainDx * scale
        z = 3.4 + fountainDz * scale
      }

      const benchResolved = resolveBenchCollisions(x, z)
      x = benchResolved.x
      z = benchResolved.z

      rotationY = Math.atan2(movement.x, movement.y)
      footstepTimer.current += delta
      if (footstepTimer.current >= 0.25) {
        footstepTimer.current -= 0.25
        playSfx('footstep')
      }
    } else {
      footstepTimer.current = 0
    }

    useTopStore.getState().setMovement(x, z, rotationY, moving)

    let nearest: AttractionId | null = null
    let nearestDistance = Number.POSITIVE_INFINITY
    for (const attraction of TOP_ATTRACTIONS) {
      const isInsideEntrance =
        Math.abs(x - attraction.x) <= ENTRANCE_HALF_WIDTH &&
        z <= attraction.entranceZ - ENTRANCE_TRIGGER_DEPTH

      if (isInsideEntrance && !isEnteringRef.current) {
        isEnteringRef.current = true
        onEnter(attraction.id)
        return
      }

      const distance = Math.hypot(x - attraction.x, z - attraction.entranceZ)
      if (distance < ENTER_DISTANCE && distance < nearestDistance) {
        nearest = attraction.id
        nearestDistance = distance
      }
    }
    if (nearest !== nearestRef.current) {
      nearestRef.current = nearest
      useTopStore.getState().setNearestAttraction(nearest)
    }
  })

  return null
}
