import { PerspectiveCamera, Stars, Text, Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Group, MathUtils, Vector2, Vector3 } from 'three'
import { MeebitSilhouette } from '../avatar/MeebitSilhouette'
import { applyVRMLocomotion, getNpcWalkPhaseOffset } from '../avatar/VRMLocomotion'
import { useKeyboardControls } from '../avatar/useKeyboardControls'
import { useVRMModel } from '../avatar/useVRMModel'
import { INTERACTION_DISTANCE, CAMERA_FOLLOW_OFFSET_XZ, VRM_WORLD_SCALE, CREATOR_MEEBIT_ID } from '../game/gameConfig'
import { isTouchUiMode } from '../game/perfConfig'
import { CREATOR_VRM_LOAD_PRIORITY } from '../game/perfConfig'
import { formatTraitDisplayName } from '../game/traitHunt'
import { getLocale } from '../i18n/locale'
import type { MeebitTraitMap } from '../data/meebitTraits'
import { useTouchControlsStore } from '../stores/touchControlsStore'
import { useNpcStore } from '../stores/npcStore'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { usePlayerStore } from '../stores/playerStore'
import { playSfx } from '../ui/sfx'
import { VrmSculpture } from '../world/VrmSculpture'
import { getAttractionsForZone } from './topConfig'
import { AttractionBuilding } from './AttractionBuilding'
import {
  FEATURED_BOARD_POSITION,
  FOUNTAIN_CENTER_Z,
  type DailyParkLineup,
  type DailyThemeTrait,
  type DailyVisitor,
} from './dailyFeatured'
import { setParkDialogueContext } from './interactWithParkNpc'
import { parkNpcIdFor, parkCreatorNpcId, parkCreatorRecord, PARK_CREATOR_POSITION, PARK_CREATOR_ROTATION_Y, registerParkNpcs } from './parkNpcRegistry'
import { ParkPerimeter } from './ParkPerimeter'
import { ParkSeasonDecor } from './ParkSeasonDecor'
import { getParkSeason, getParkSeasonLook, type ParkSeasonLook } from './parkSeason'
import { applyZoneLook } from './parkZoneTheme'
import {
  NPC_COLLISION_RADIUS,
  PLAYER_COLLISION_RADIUS,
  isParkPositionWalkable,
  resolveParkMovement,
  setParkCollisionZone,
} from './topCollisions'
import { ComingSoonPad, ParkZoneGate } from './ParkZoneGate'
import { getParkZone, type ParkGateDef, type ParkZoneId, type ParkZoneLayout } from './parkZones'
import { ParkBenchProp, type ParkBenchPropKind } from './ParkBenchProp'
import { useTopStore, type AttractionId } from './topStore'

const MOVE_SPEED = 7
const ENTER_DISTANCE = 3.6
const ENTRANCE_HALF_WIDTH = 1.45
const ENTRANCE_TRIGGER_DEPTH = 0.55
const GATE_ENTER_DISTANCE = 2.8
const GATE_TRIGGER_HALF = 1.35
const ZONE_TRANSITION_MS = 280
const TOP_NPC_WALK_SPEED = 1.15
const TOP_NPC_WALK_PATTERNS = [
  { walkSeconds: [4.5, 8], idleSeconds: [0.8, 1.8], turnSpread: Math.PI * 0.35 },
  { walkSeconds: [3, 6], idleSeconds: [1.5, 3], turnSpread: Math.PI * 0.65 },
  { walkSeconds: [2, 4.5], idleSeconds: [3, 5.5], turnSpread: Math.PI * 0.5 },
] as const
const movement = new Vector2()
const cameraOffset = new Vector3(CAMERA_FOLLOW_OFFSET_XZ[0], 6.5, CAMERA_FOLLOW_OFFSET_XZ[1])
const cameraPosition = new Vector3()
const cameraTarget = new Vector3()
const playerPosition = new Vector3()
const npcPosition = new Vector3()
const midpoint = new Vector3()
const dialogueDirection = new Vector3()
const dialogueSide = new Vector3()
const dialogueCameraDirection = new Vector3()
const dialogueCameraDirectionAlt = new Vector3()
const dialogueCandidatePosition = new Vector3()
const dialogueCameraHeight = new Vector3(0, 2.35, 0)
const dialogueLookAtHeight = new Vector3(0, 1.55, 0)
const mobileDialogueCameraHeight = new Vector3(0, 2.1, 0)
const mobileDialogueLookAtHeight = new Vector3(0, 1.15, 0)
const lookAtOffset = new Vector3(0, 1.4, 0)

export function TopScene({
  onEnter,
  lineup,
}: {
  onEnter: (id: AttractionId) => void
  lineup: DailyParkLineup
}) {
  const locale = getLocale()
  const season = getParkSeason()
  const activeZoneId = useTopStore((state) => state.activeZoneId)
  const zone = getParkZone(activeZoneId)
  const look = applyZoneLook(activeZoneId, getParkSeasonLook(season))
  const layout = zone.layout
  const zoneAttractions = getAttractionsForZone(activeZoneId)

  useEffect(() => {
    setParkCollisionZone(activeZoneId)
  }, [activeZoneId])

  return (
    <>
      <color attach="background" args={[look.backgroundColor]} />
      <fog attach="fog" args={[look.fogColor, look.fogNear, look.fogFar]} />
      {look.showStars ? (
        <Stars radius={72} depth={28} count={900} factor={2.2} saturation={0.15} fade speed={0.25} />
      ) : null}
      <PerspectiveCamera
        makeDefault
        position={[0, 6.5, 18]}
        fov={45}
        near={0.1}
        far={120}
      />
      <TopFollowCamera />
      <ambientLight intensity={look.ambientIntensity} color={look.ambientColor} />
      <hemisphereLight
        args={[look.hemisphereSky, look.hemisphereGround, look.hemisphereIntensity]}
      />
      <directionalLight
        castShadow
        position={[-14, 20, 10]}
        intensity={look.directionalIntensity}
        color={look.directionalColor}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-36}
        shadow-camera-right={36}
        shadow-camera-top={36}
        shadow-camera-bottom={-36}
        shadow-bias={-0.0002}
      />
      <pointLight
        position={[0, 9, 2]}
        intensity={look.accentPointIntensity}
        distance={38}
        color={look.accentPointColor}
      />
      <Environment
        preset={look.environmentPreset}
        environmentIntensity={look.environmentIntensity}
      />

      <HubGround
        featuredId={lineup.featuredId}
        look={look}
        layout={layout}
        trees={zone.trees}
        treeStyle={activeZoneId === 'mountain' ? 'pine' : 'grove'}
        showFountain={zone.hasFountain}
      />
      {zone.perimeter ? (
        <ParkPerimeter
          layout={layout}
          perimeter={zone.perimeter}
          gates={zone.gates}
          locale={locale}
        />
      ) : null}
      <ParkSeasonDecor season={season} layout={layout} />
      {zone.hasFeaturedBoard ? (
        <FeaturedInfoBoard
          featuredId={lineup.featuredId}
          featuredTraits={lineup.featuredTraits}
          themeTrait={lineup.themeTrait}
          locale={locale}
        />
      ) : null}
      <ParkLamps look={look} lamps={zone.lamps} />
      <ParkDetails
        benchProp={look.benchProp}
        benches={zone.benches}
        planters={zone.planters}
        layout={layout}
        gates={zone.gates}
        showRailings={!zone.perimeter}
      />
      {zoneAttractions.map((attraction) => (
        <AttractionBuilding
          key={attraction.id}
          attraction={attraction}
          locale={locale}
          onEnter={onEnter}
        />
      ))}
      {zone.gates.map((gate) => (
        <ParkZoneGate
          key={gate.id}
          gate={gate}
          locale={locale}
          onEnter={() => transitionToZone(gate.targetZone, gate.targetSpawn)}
        />
      ))}
      {(zone.comingSoonSlots ?? []).map((slot) => (
        <ComingSoonPad
          key={`soon-${slot.x}-${slot.z}`}
          position={[slot.x, 0, slot.z]}
          locale={locale}
          theme={slot.theme ?? (zone.perimeter?.theme === 'mountain' ? 'mountain' : 'classic')}
          title={slot.title}
          subtitle={slot.subtitle}
        />
      ))}
      {zone.hasNpcCrowd ? (
        <TopNpcCrowd
          visitors={lineup.visitors}
          featuredId={lineup.featuredId}
          themeTrait={lineup.themeTrait}
        />
      ) : null}
      <TopPlayer />
      <TopPlayerController onEnter={onEnter} />
      {zone.hasNpcCrowd ? <ParkNpcProximitySystem /> : null}
    </>
  )
}

function transitionToZone(
  zoneId: ParkZoneId,
  spawn: { x: number; z: number; rotationY: number },
) {
  const store = useTopStore.getState()
  if (store.zoneTransitioning || store.activeZoneId === zoneId) return
  store.setZoneTransitioning(true)
  playSfx('uiConfirm')
  window.setTimeout(() => {
    setParkCollisionZone(zoneId)
    useTopStore.getState().setActiveZone(zoneId, spawn)
    useTopStore.getState().setZoneTransitioning(false)
  }, ZONE_TRANSITION_MS)
}

/** Hunt 本編と同じ固定オフセット追従。会話中は NPC との中間へ寄る。 */
function TopFollowCamera() {
  useFrame(({ camera }, delta) => {
    const player = useTopStore.getState()
    const dialogue = useDialogueStore.getState()
    const isMobile = isTouchUiMode()

    playerPosition.set(player.x, 0, player.z)

    if (dialogue.isOpen && dialogue.activeNpcId) {
      const liveNpcPosition = useNpcStore.getState().npcPositions[dialogue.activeNpcId]

      if (liveNpcPosition) {
        npcPosition.set(liveNpcPosition[0], liveNpcPosition[1], liveNpcPosition[2])
        midpoint.copy(playerPosition).add(npcPosition).multiplyScalar(0.5)
        dialogueDirection.copy(playerPosition).sub(npcPosition)

        if (dialogueDirection.lengthSq() < 0.001) {
          dialogueDirection.set(0, 0, 1)
        }

        dialogueDirection.normalize()
        dialogueSide.set(-dialogueDirection.z, 0, dialogueDirection.x).normalize()

        const sideScale = isMobile ? 0.55 : 0.72
        const forwardScale = isMobile ? 0.35 : 0.48
        const cameraDistance = isMobile ? 5.8 : 4.6
        const cameraHeight = isMobile ? mobileDialogueCameraHeight : dialogueCameraHeight
        const lookAtHeight = isMobile ? mobileDialogueLookAtHeight : dialogueLookAtHeight

        let bestScore = Number.POSITIVE_INFINITY

        for (const sideSign of [-1, 1] as const) {
          dialogueCameraDirectionAlt
            .copy(dialogueSide)
            .multiplyScalar(sideSign * sideScale)
            .addScaledVector(dialogueDirection, forwardScale)
            .normalize()

          dialogueCandidatePosition
            .copy(midpoint)
            .addScaledVector(dialogueCameraDirectionAlt, cameraDistance)
            .add(cameraHeight)

          const travelCost = dialogueCandidatePosition.distanceToSquared(camera.position)
          const cameraSideBias =
            dialogueCandidatePosition.z < midpoint.z ? 18 : dialogueCandidatePosition.z > midpoint.z ? -2 : 0
          const score = travelCost + cameraSideBias

          if (score < bestScore) {
            bestScore = score
            dialogueCameraDirection.copy(dialogueCameraDirectionAlt)
            cameraPosition.copy(dialogueCandidatePosition)
          }
        }

        cameraTarget.copy(midpoint).add(lookAtHeight)
        camera.position.lerp(cameraPosition, 1 - Math.exp(-delta * 8))
        camera.lookAt(cameraTarget)
        return
      }
    }

    cameraPosition.copy(playerPosition).add(cameraOffset)
    cameraTarget.copy(playerPosition).add(lookAtOffset)
    camera.position.lerp(cameraPosition, 1 - Math.exp(-delta * 5))
    camera.lookAt(cameraTarget)
  })

  return null
}

function HubGround({
  featuredId,
  look,
  layout,
  trees,
  treeStyle = 'grove',
  showFountain,
}: {
  featuredId: number
  look: ParkSeasonLook
  layout: ParkZoneLayout
  trees: ReadonlyArray<readonly [number, number]>
  treeStyle?: 'grove' | 'pine'
  showFountain: boolean
}) {
  const {
    groundZ,
    districtHalfX,
    districtHalfZ,
    plazaRadius,
    pathSizeX,
    pathSizeZ,
    paverWidth,
    pathEdgeX,
    pathEdgeLength,
  } = layout

  const paverCount = Math.max(12, Math.ceil(pathSizeZ / 1.9))
  const paverStart = Math.floor(layout.maxZ) - 1

  return (
    <group>
      {/* 地区床（海・砂浜は置かない。外周は将来の崖・川） */}
      <mesh position={[0, -0.08, groundZ]} receiveShadow>
        <boxGeometry args={[districtHalfX * 2, 0.2, districtHalfZ * 2]} />
        <meshStandardMaterial color={look.districtColor} roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.015, groundZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[plazaRadius, 64]} />
        <meshStandardMaterial color={look.plazaColor} roughness={0.88} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.035, groundZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[pathSizeX, pathSizeZ]} />
        <meshStandardMaterial color={look.pathColor} roughness={0.82} metalness={0.08} />
      </mesh>
      {Array.from({ length: paverCount }, (_, index) => paverStart - index * 1.9).map((z, index) => (
        <mesh
          key={`paver-${z}`}
          position={[0, 0.055, z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[paverWidth, 1.72]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? look.paverColorA : look.paverColorB}
            roughness={0.9}
          />
        </mesh>
      ))}
      {[-pathEdgeX, pathEdgeX].map((x) => (
        <mesh key={`path-edge-${x}`} position={[x, 0.07, groundZ]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.18, pathEdgeLength]} />
          <meshStandardMaterial color={look.pathEdgeColor} metalness={0.42} roughness={0.42} />
        </mesh>
      ))}
      {showFountain ? (
        <>
          <mesh position={[0, 0.05, FOUNTAIN_CENTER_Z]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.2, 2.85, 48]} />
            <meshStandardMaterial color={look.fountainRingColor} metalness={0.25} roughness={0.62} />
          </mesh>
          <Fountain />
          <FountainStatue featuredId={featuredId} />
        </>
      ) : null}
      {trees.map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, 0]}>
          {treeStyle === 'pine' ? <PineTree z={z} /> : <Tree z={z} />}
        </group>
      ))}
    </group>
  )
}

function Fountain() {
  return (
    <group position={[0, 0, FOUNTAIN_CENTER_Z]}>
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

/** 噴水中央の本日の主役銅像。丸い石柱の上に立たせる。 */
function FountainStatue({ featuredId }: { featuredId: number }) {
  return (
    <group position={[0, 0, FOUNTAIN_CENTER_Z]}>
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.78, 1.1, 32]} />
        <meshStandardMaterial color="#c9a06a" metalness={0.62} roughness={0.36} />
      </mesh>
      <mesh position={[0, 1.54, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.66, 0.16, 32]} />
        <meshStandardMaterial color="#e0b878" metalness={0.78} roughness={0.26} />
      </mesh>
      <VrmSculpture
        meebitId={featuredId}
        position={[0, 1.62, 0]}
        pedestal="light"
        facingY={0}
        sculptureTone="copper"
        hidePedestal
      />
    </group>
  )
}

function Tree({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.82, 0.56, 16]} />
        <meshStandardMaterial color="#79654f" roughness={0.68} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.35, 2.4, 10]} />
        <meshStandardMaterial color="#5b4030" roughness={0.92} />
      </mesh>
      {[
        [0, 3.05, 0, 1.2],
        [-0.72, 2.75, 0.12, 0.82],
        [0.68, 2.82, -0.08, 0.9],
        [0, 3.65, 0.02, 0.78],
      ].map(([x, y, treeZ, scale], index) => (
        <mesh key={`crown-${index}`} position={[x, y, treeZ]} scale={scale} castShadow>
          <dodecahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#285849' : '#34705a'} roughness={0.94} />
        </mesh>
      ))}
    </group>
  )
}

/** マインクラフト風の針葉樹（段々のボクセル葉） */
function PineTree({ z }: { z: number }) {
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.4, 0.7]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[0.28, 2.2, 0.28]} />
        <meshStandardMaterial color="#4a3a28" roughness={0.92} />
      </mesh>
      {[
        { y: 2.1, s: 1.55 },
        { y: 2.75, s: 1.2 },
        { y: 3.3, s: 0.9 },
        { y: 3.75, s: 0.55 },
      ].map((tier) => (
        <mesh key={tier.y} position={[0, tier.y, 0]} castShadow>
          <boxGeometry args={[tier.s, 0.55, tier.s]} />
          <meshStandardMaterial color={tier.y > 3 ? '#2f6a38' : '#3a7a40'} roughness={0.93} />
        </mesh>
      ))}
    </group>
  )
}

function ParkLamps({
  look,
  lamps,
}: {
  look: ParkSeasonLook
  lamps: ReadonlyArray<readonly [number, number]>
}) {
  return (
    <group>
      {lamps.map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.23, 0.3, 0.24, 12]} />
            <meshStandardMaterial color="#2d2930" metalness={0.72} roughness={0.28} />
          </mesh>
          <mesh position={[0, 1.55, 0]} castShadow>
            <cylinderGeometry args={[0.065, 0.11, 3.1, 12]} />
            <meshStandardMaterial color="#343039" metalness={0.76} roughness={0.28} />
          </mesh>
          <mesh position={[0, 2.9, 0]} castShadow>
            <boxGeometry args={[0.95, 0.06, 0.06]} />
            <meshStandardMaterial color="#343039" metalness={0.76} roughness={0.28} />
          </mesh>
          {[-0.42, 0.42].map((lanternX) => (
            <group key={lanternX} position={[lanternX, 3.05, 0]}>
              <mesh castShadow>
                <sphereGeometry args={[0.19, 14, 12]} />
                <meshStandardMaterial
                  color="#fff0bd"
                  emissive="#f6b84f"
                  emissiveIntensity={look.lampEmissiveIntensity}
                />
              </mesh>
              <mesh position={[0, 0.25, 0]} castShadow>
                <coneGeometry args={[0.23, 0.22, 8]} />
                <meshStandardMaterial color="#343039" metalness={0.74} roughness={0.3} />
              </mesh>
            </group>
          ))}
          <pointLight
            position={[0, 3.05, 0]}
            intensity={look.lampLightIntensity}
            distance={8.5}
            color="#ffd080"
          />
        </group>
      ))}
    </group>
  )
}

function ParkDetails({
  benchProp,
  benches,
  planters,
  layout,
  gates,
  showRailings,
}: {
  benchProp: ParkBenchPropKind
  benches: ReadonlyArray<readonly [number, number, number]>
  planters: ReadonlyArray<readonly [number, number]>
  layout: ParkZoneLayout
  gates: ReadonlyArray<ParkGateDef>
  showRailings: boolean
}) {
  const postSpacing = 1.85
  const postCount = Math.max(12, Math.ceil((layout.railingHalfLength * 2) / postSpacing))
  const openingHalf = (gate: ParkGateDef) => {
    const yaw = gate.yaw ?? 0
    const projected =
      gate.halfWidth * Math.abs(Math.cos(yaw)) + gate.alcoveDepth * Math.abs(Math.sin(yaw))
    return projected + 1.1
  }

  return (
    <group>
      {benches.map(([x, z, rotationY], index) => (
        <ClassicBench key={`bench-${index}`} position={[x, 0, z]} rotationY={rotationY} />
      ))}
      {planters.map(([x, z], index) => (
        <ParkBenchProp
          key={`bench-prop-${index}`}
          kind={benchProp}
          position={[x, 0, z]}
          index={index}
        />
      ))}
      {showRailings
        ? ([-1, 1] as const).map((side) => {
            const gate = gates.find((g) => Math.sign(g.x) === side)
            const openHalf = gate ? openingHalf(gate) : 0
            const gateLocalZ = gate ? gate.z - layout.railingZ : 0
            const posts = Array.from(
              { length: postCount },
              (_, index) => -layout.railingHalfLength + 0.4 + index * postSpacing,
            ).filter((z) => !gate || Math.abs(z - gateLocalZ) > openHalf)

            const railSegments: Array<{ z: number; length: number }> = []
            if (!gate) {
              railSegments.push({ z: 0, length: layout.railingHalfLength * 2 })
            } else {
              const railMin = -layout.railingHalfLength
              const railMax = layout.railingHalfLength
              const openMin = gateLocalZ - openHalf
              const openMax = gateLocalZ + openHalf
              if (openMin > railMin + 0.2) {
                railSegments.push({
                  z: (railMin + openMin) * 0.5,
                  length: openMin - railMin,
                })
              }
              if (openMax < railMax - 0.2) {
                railSegments.push({
                  z: (openMax + railMax) * 0.5,
                  length: railMax - openMax,
                })
              }
            }

            return (
              <group key={`railing-${side}`} position={[side * layout.railingX, 0, layout.railingZ]}>
                {posts.map((z) => (
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
                {[0.48, 0.92].flatMap((y) =>
                  railSegments.map((seg) => (
                    <mesh key={`${y}-${seg.z}`} position={[0, y, seg.z]}>
                      <boxGeometry args={[0.05, 0.05, seg.length]} />
                      <meshStandardMaterial color="#3b3540" metalness={0.72} roughness={0.32} />
                    </mesh>
                  )),
                )}
              </group>
            )
          })
        : null}
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

/** 本日の主役のトレイトを噴水脇に掲示する（見出し＋ID＋共通点＋2列トレイト）。 */
function FeaturedInfoBoard({
  featuredId,
  featuredTraits,
  themeTrait,
  locale,
}: {
  featuredId: number
  featuredTraits: MeebitTraitMap
  themeTrait: DailyThemeTrait
  locale: 'en' | 'ja'
}) {
  const heading = locale === 'ja' ? '本日の主役' : "TODAY'S STAR"
  const linkLabel = locale === 'ja' ? '本日の共通点' : "TODAY'S LINK"
  const themeLine = `${themeTrait.traitType} · ${formatTraitDisplayName(themeTrait.traitType, themeTrait.traitValue)}`
  const orderedTraits = orderFeaturedTraits(featuredTraits)
  const mid = Math.ceil(orderedTraits.length / 2)
  const leftTraits = orderedTraits.slice(0, mid)
  const rightTraits = orderedTraits.slice(mid)

  return (
    <group position={FEATURED_BOARD_POSITION} rotation={[0, 0, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[3.35, 0.2, 0.9]} />
        <meshStandardMaterial color="#29242c" roughness={0.62} />
      </mesh>
      {[-1.35, 1.35].map((x) => (
        <mesh key={x} position={[x, 1.05, 0]}>
          <cylinderGeometry args={[0.05, 0.065, 1.95, 10]} />
          <meshStandardMaterial color="#a8864d" metalness={0.66} roughness={0.34} />
        </mesh>
      ))}
      <mesh position={[0, 1.35, 0.04]}>
        <boxGeometry args={[3.4, 1.85, 0.14]} />
        <meshStandardMaterial
          color="#17151d"
          emissive="#d4b46a"
          emissiveIntensity={0.1}
          metalness={0.18}
          roughness={0.5}
        />
      </mesh>

      <mesh position={[0, 2.02, 0.05]}>
        <boxGeometry args={[3.25, 0.38, 0.04]} />
        <meshStandardMaterial color="#221c28" roughness={0.55} metalness={0.12} />
      </mesh>
      <Text
        position={[-0.78, 2.04, 0.14]}
        fontSize={0.15}
        color="#e2c77f"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
      >
        {heading}
      </Text>
      <Text
        position={[0.88, 2.04, 0.14]}
        fontSize={0.22}
        color="#f4ead2"
        anchorX="center"
        anchorY="middle"
      >
        {`#${featuredId}`}
      </Text>

      <mesh position={[0, 1.78, 0.13]}>
        <boxGeometry args={[3.05, 0.012, 0.02]} />
        <meshStandardMaterial color="#d4b46a" emissive="#8b632b" emissiveIntensity={0.35} />
      </mesh>

      {/* 本日の共通トレイト（マッチ枠15体の基準） */}
      <Text
        position={[0, 1.64, 0.15]}
        fontSize={0.1}
        color="#caa75b"
        anchorX="center"
        anchorY="middle"
      >
        {linkLabel}
      </Text>
      <Text
        position={[0, 1.48, 0.15]}
        fontSize={0.14}
        color="#ffe7b0"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.05}
      >
        {themeLine}
      </Text>

      <FeaturedTraitColumn
        traits={leftTraits}
        themeTrait={themeTrait}
        position={[-0.82, 1.05, 0.15]}
      />
      <FeaturedTraitColumn
        traits={rightTraits}
        themeTrait={themeTrait}
        position={[0.82, 1.05, 0.15]}
      />
    </group>
  )
}

const FEATURED_TRAIT_ORDER = [
  'Type',
  'Hair Style',
  'Hair Color',
  'Glasses',
  'Hat',
  'Hat Color',
  'Beard',
  'Beard Color',
  'Shirt',
  'Shirt Color',
  'Overshirt',
  'Overshirt Color',
  'Pants',
  'Pants Color',
  'Shoes',
  'Shoes Color',
  'Necklace',
  'Earring',
  'Tattoo',
] as const

function orderFeaturedTraits(traits: MeebitTraitMap): Array<[string, string]> {
  const entries = Object.entries(traits)
  const rank = new Map(FEATURED_TRAIT_ORDER.map((key, index) => [key, index]))
  return entries.sort((a, b) => {
    const ra = rank.get(a[0] as (typeof FEATURED_TRAIT_ORDER)[number]) ?? 100
    const rb = rank.get(b[0] as (typeof FEATURED_TRAIT_ORDER)[number]) ?? 100
    if (ra !== rb) return ra - rb
    return a[0].localeCompare(b[0])
  })
}

function FeaturedTraitColumn({
  traits,
  themeTrait,
  position,
}: {
  traits: Array<[string, string]>
  themeTrait: DailyThemeTrait
  position: [number, number, number]
}) {
  if (traits.length === 0) return null

  // テーマ以外のトレイトを通常色で列表示（テーマは上段で強調済み）
  const lines = traits
    .filter(([type, value]) => !(type === themeTrait.traitType && value === themeTrait.traitValue))
    .map(([type, value]) => `${type} · ${formatTraitDisplayName(type, value)}`)
    .join('\n')

  if (!lines) return null

  return (
    <Text
      position={position}
      fontSize={0.11}
      lineHeight={1.28}
      color="#d8cfc0"
      anchorX="center"
      anchorY="middle"
      textAlign="left"
      maxWidth={1.55}
    >
      {lines}
    </Text>
  )
}

type TopNpcSpawn = {
  meebitNumber: number
  x: number
  z: number
  rotationY: number
  walkPattern: 0 | 1 | 2
  matched: boolean
}

function createTopNpcSpawns(visitors: DailyVisitor[]): TopNpcSpawn[] {
  // ID は日次固定。位置・向きだけ訪問ごとにランダムにして探しがいを出す。
  const spawns: TopNpcSpawn[] = []
  let attempts = 0
  const maxAttempts = visitors.length * 80

  while (spawns.length < visitors.length && attempts < maxAttempts) {
    attempts += 1
    const x = MathUtils.randFloat(-18, 18)
    const z = MathUtils.randFloat(-4.8, 13)

    if (!isTopNpcPositionWalkable(x, z)) continue
    if (spawns.some((spawn) => Math.hypot(spawn.x - x, spawn.z - z) < 1.45)) continue

    const visitor = visitors[spawns.length]
    if (!visitor) break

    spawns.push({
      meebitNumber: visitor.meebitNumber,
      matched: visitor.matched,
      x,
      z,
      rotationY: Math.random() * Math.PI * 2,
      walkPattern: (spawns.length % TOP_NPC_WALK_PATTERNS.length) as 0 | 1 | 2,
    })
  }

  // 位置が取れなかった余りは円配置＋ランダムジッターで埋める
  while (spawns.length < visitors.length) {
    const visitor = visitors[spawns.length]
    if (!visitor) break
    const fallbackIndex = spawns.length
    const angle = (fallbackIndex / visitors.length) * Math.PI * 2 + Math.random() * 0.4
    const radius = 6 + (fallbackIndex % 5) * 1.4 + MathUtils.randFloat(-0.6, 0.6)
    let x = Math.cos(angle) * radius
    let z = 6 + Math.sin(angle) * radius * 0.55
    if (!isTopNpcPositionWalkable(x, z)) {
      x = MathUtils.clamp(x, -17, 17)
      z = MathUtils.clamp(z, -4.5, 12.5)
    }
    spawns.push({
      meebitNumber: visitor.meebitNumber,
      matched: visitor.matched,
      x,
      z,
      rotationY: Math.random() * Math.PI * 2,
      walkPattern: (fallbackIndex % TOP_NPC_WALK_PATTERNS.length) as 0 | 1 | 2,
    })
  }

  return spawns
}

function isTopNpcPositionWalkable(x: number, z: number) {
  const layout = getParkZone('plaza').layout
  if (Math.abs(x) > layout.boundsX - 2 || z < layout.minZ + 2 || z > layout.maxZ - 1.5) {
    return false
  }
  for (const attraction of getAttractionsForZone('plaza')) {
    if (Math.hypot(x - attraction.x, z - attraction.entranceZ) < 2.8) return false
  }
  for (const gate of getParkZone('plaza').gates) {
    if (Math.hypot(x - gate.x, z - gate.z) < 3.2) return false
  }
  return isParkPositionWalkable(x, z, NPC_COLLISION_RADIUS)
}

function TopNpcCrowd({
  visitors,
  featuredId,
  themeTrait,
}: {
  visitors: DailyVisitor[]
  featuredId: number
  themeTrait: DailyThemeTrait
}) {
  const started = useTopStore((state) => state.started)
  // visitors（日次固定ID）だけ依存。位置はマウントごとにランダム。
  const spawns = useMemo(() => createTopNpcSpawns(visitors), [visitors])

  useEffect(() => {
    setParkDialogueContext(featuredId, themeTrait)
    registerParkNpcs([
      ...visitors.map((visitor) => ({
        id: parkNpcIdFor(visitor.meebitNumber),
        meebitNumber: visitor.meebitNumber,
        matched: visitor.matched,
        isFeatured: visitor.meebitNumber === featuredId,
      })),
      parkCreatorRecord(),
    ])
    return () => {
      useNpcStore.getState().setNearestNpcId(null)
    }
  }, [visitors, featuredId, themeTrait])

  if (!started) return null

  return (
    <group>
      {spawns.map((spawn, index) => (
        <TopNpc key={`${spawn.meebitNumber}-${index}`} spawn={spawn} index={index} />
      ))}
      <ParkCreatorNpc />
    </group>
  )
}

/** プレイヤーに近い来場者を nearest としてマーク（赤いピン用）。 */
function ParkNpcProximitySystem() {
  useFrame(() => {
    const top = useTopStore.getState()
    if (!top.started) return
    if (useDialogueStore.getState().isOpen) return

    const positions = useNpcStore.getState().npcPositions
    let nearestId: string | null = null
    let nearestDistance = INTERACTION_DISTANCE

    for (const [npcId, position] of Object.entries(positions)) {
      const distance = Math.hypot(position[0] - top.x, position[2] - top.z)
      if (distance <= nearestDistance) {
        nearestDistance = distance
        nearestId = npcId
      }
    }

    const current = useNpcStore.getState().nearestNpcId
    if (current !== nearestId) {
      useNpcStore.getState().setNearestNpcId(nearestId)
    }
  })

  return null
}

/** 看板そばからスタートし、来場者と同じくパーク内を歩き回る作成者。 */
function ParkCreatorNpc() {
  const groupRef = useRef<Group>(null)
  const npcId = parkCreatorNpcId()
  const isNearest = useNpcStore((state) => state.nearestNpcId === npcId)
  const isDialogueActive = useDialogueStore((state) => state.activeNpcId === npcId)
  const walkPattern = TOP_NPC_WALK_PATTERNS[1]
  const isWalkingRef = useRef(true)
  const behaviorTimerRef = useRef(walkPattern.walkSeconds[0] + 1.2)
  const rotationYRef = useRef(PARK_CREATOR_ROTATION_Y)
  const targetRotationYRef = useRef(PARK_CREATOR_ROTATION_Y)
  const localTimeRef = useRef(0.4)
  const walkPhaseOffset = getNpcWalkPhaseOffset(7)
  const { vrmRef, vrmScene, update } = useVRMModel(
    CREATOR_MEEBIT_ID,
    true,
    CREATOR_VRM_LOAD_PRIORITY,
    true,
    true,
  )

  useFrame((_, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05)
    const group = groupRef.current
    localTimeRef.current += safeDelta
    behaviorTimerRef.current -= safeDelta

    if (group) {
      useNpcStore.getState().setNpcPosition(npcId, [group.position.x, 0, group.position.z])
    }

    if (isDialogueActive && group) {
      isWalkingRef.current = false
      const player = useTopStore.getState()
      const faceY = Math.atan2(player.x - group.position.x, player.z - group.position.z)
      rotationYRef.current = faceY
      targetRotationYRef.current = faceY
      group.rotation.y = faceY
      group.position.y = 0.06
      applyVRMLocomotion(vrmRef.current, {
        elapsedTime: localTimeRef.current,
        isMoving: false,
        isRunning: false,
        idleOffset: 0.2,
        walkPhaseOffset,
      })
      update(safeDelta)
      return
    }

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
      idleOffset: 0.2,
      walkPhaseOffset,
    })
    update(safeDelta)
  })

  return (
    <group ref={groupRef} position={PARK_CREATOR_POSITION} rotation={[0, PARK_CREATOR_ROTATION_Y, 0]}>
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <MeebitSilhouette />
      )}
      {isNearest ? <ParkInteractionPin /> : null}
    </group>
  )
}

function TopNpc({ spawn, index }: { spawn: TopNpcSpawn; index: number }) {
  const groupRef = useRef<Group>(null)
  const npcId = parkNpcIdFor(spawn.meebitNumber)
  const isNearest = useNpcStore((state) => state.nearestNpcId === npcId)
  const isDialogueActive = useDialogueStore((state) => state.activeNpcId === npcId)
  const walkPattern = TOP_NPC_WALK_PATTERNS[spawn.walkPattern]
  // 初期歩行状態も index 由来で固定（リロードで挙動がぶれない）
  const isWalkingRef = useRef((index * 17) % 10 > 3)
  const behaviorTimerRef = useRef(
    isWalkingRef.current
      ? walkPattern.walkSeconds[0] + ((index * 0.37) % 1) * (walkPattern.walkSeconds[1] - walkPattern.walkSeconds[0])
      : walkPattern.idleSeconds[0] + ((index * 0.53) % 1) * (walkPattern.idleSeconds[1] - walkPattern.idleSeconds[0]),
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

    if (group) {
      useNpcStore.getState().setNpcPosition(npcId, [group.position.x, 0, group.position.z])
    }

    // 会話中は止まってプレイヤーを向く
    if (isDialogueActive && group) {
      isWalkingRef.current = false
      const player = useTopStore.getState()
      const faceY = Math.atan2(player.x - group.position.x, player.z - group.position.z)
      rotationYRef.current = faceY
      targetRotationYRef.current = faceY
      group.rotation.y = faceY
      group.position.y = 0.06
      applyVRMLocomotion(vrmRef.current, {
        elapsedTime: localTimeRef.current,
        isMoving: false,
        isRunning: false,
        idleOffset: index * 0.61,
        walkPhaseOffset,
      })
      update(safeDelta)
      return
    }

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
      {isNearest ? <ParkInteractionPin /> : null}
    </group>
  )
}

function ParkInteractionPin() {
  const pinRef = useRef<Group>(null)

  useFrame((state) => {
    if (!pinRef.current) return
    pinRef.current.position.y = 2.35 + Math.sin(state.clock.elapsedTime * 4) * 0.025
  })

  return (
    <group ref={pinRef} position={[0, 2.35, 0]}>
      <mesh>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial
          color="#b91c1c"
          roughness={0.92}
          metalness={0}
          transparent
          opacity={0.82}
        />
      </mesh>
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
  const nearestGateRef = useRef<string | null>(null)
  const isEnteringRef = useRef(false)
  const isGateCrossingRef = useRef(false)

  useEffect(() => {
    const handleEnter = (event: KeyboardEvent) => {
      if (event.code !== 'Enter' && event.code !== 'Space') return
      if (useDialogueStore.getState().isOpen) return
      const store = useTopStore.getState()
      if (store.nearestGateId) {
        const gate = getParkZone(store.activeZoneId).gates.find((item) => item.id === store.nearestGateId)
        if (gate) {
          transitionToZone(gate.targetZone, gate.targetSpawn)
          return
        }
      }
      const nearest = nearestRef.current
      if (nearest) onEnter(nearest)
    }
    window.addEventListener('keydown', handleEnter)
    return () => window.removeEventListener('keydown', handleEnter)
  }, [onEnter])

  useFrame((_, delta) => {
    const state = useTopStore.getState()
    if (state.zoneTransitioning) return

    const zone = getParkZone(state.activeZoneId)
    const layout = zone.layout
    const controls = controlsRef.current
    const touch = useTouchControlsStore.getState()
    const movementLocked = usePlayerStore.getState().movementLocked
    movement.set(0, 0)

    if (!movementLocked) {
      if (touch.joystickActive) {
        movement.set(touch.joystickX, touch.joystickY)
      } else {
        if (controls.forward) movement.y -= 1
        if (controls.backward) movement.y += 1
        if (controls.left) movement.x -= 1
        if (controls.right) movement.x += 1
      }
    }

    const moving = movement.lengthSq() > 0.001
    let x = state.x
    let z = state.z
    let rotationY = state.rotationY

    if (moving) {
      movement.normalize()
      const nextX = MathUtils.clamp(
        x + movement.x * MOVE_SPEED * delta,
        -layout.boundsX,
        layout.boundsX,
      )
      const nextZ = MathUtils.clamp(
        z + movement.y * MOVE_SPEED * delta,
        layout.minZ,
        layout.maxZ,
      )
      const resolved = resolveParkMovement(x, z, nextX, nextZ, PLAYER_COLLISION_RADIUS)
      x = resolved.x
      z = resolved.z

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

    if (useDialogueStore.getState().isOpen) return

    let nearest: AttractionId | null = null
    let nearestDistance = Number.POSITIVE_INFINITY
    let insideAnyEntrance = false

    for (const attraction of getAttractionsForZone(state.activeZoneId)) {
      const alcoveMinZ = attraction.entranceZ - attraction.footprint.alcoveDepth
      const isInsideEntrance =
        Math.abs(x - attraction.x) <= ENTRANCE_HALF_WIDTH &&
        z <= attraction.entranceZ - ENTRANCE_TRIGGER_DEPTH &&
        z >= alcoveMinZ

      if (isInsideEntrance) {
        insideAnyEntrance = true
        if (!isEnteringRef.current) {
          isEnteringRef.current = true
          onEnter(attraction.id)
          return
        }
      }

      const distance = Math.hypot(x - attraction.x, z - attraction.entranceZ)
      if (distance < ENTER_DISTANCE && distance < nearestDistance) {
        nearest = attraction.id
        nearestDistance = distance
      }
    }

    let nearestGateId: string | null = null
    let nearestGateDistance = Number.POSITIVE_INFINITY
    let insideGate = false

    for (const gate of zone.gates) {
      const yaw = gate.yaw ?? 0
      const dx = x - gate.x
      const dz = z - gate.z
      const localX = dx * Math.cos(-yaw) - dz * Math.sin(-yaw)
      const localZ = dx * Math.sin(-yaw) + dz * Math.cos(-yaw)
      const inCorridor =
        Math.abs(localZ) <= GATE_TRIGGER_HALF && Math.abs(localX) <= gate.alcoveDepth + 0.5
      if (inCorridor) {
        insideGate = true
        if (!isGateCrossingRef.current) {
          isGateCrossingRef.current = true
          transitionToZone(gate.targetZone, gate.targetSpawn)
          return
        }
      }

      const distance = Math.hypot(dx, dz)
      if (distance < GATE_ENTER_DISTANCE && distance < nearestGateDistance) {
        nearestGateId = gate.id
        nearestGateDistance = distance
      }
    }

    if (!insideAnyEntrance) isEnteringRef.current = false
    if (!insideGate) isGateCrossingRef.current = false

    if (nearest !== nearestRef.current) {
      nearestRef.current = nearest
      useTopStore.getState().setNearestAttraction(nearest)
    }
    if (nearestGateId !== nearestGateRef.current) {
      nearestGateRef.current = nearestGateId
      useTopStore.getState().setNearestGateId(nearestGateId)
    }
  })

  return null
}
