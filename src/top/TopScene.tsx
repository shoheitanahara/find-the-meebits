import { PerspectiveCamera, Stars, Environment } from '@react-three/drei'
import { Text } from '../world/WorldText'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { Group, MathUtils, type Material, type Mesh, Plane, Vector2, Vector3 } from 'three'
import { MeebitSilhouette } from '../avatar/MeebitSilhouette'
import {
  applyVRMLocomotion,
  applyVRMSitPose,
  getAudienceBreathParams,
  getNpcWalkPhaseOffset,
} from '../avatar/VRMLocomotion'
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
import { AboutMeebitsBoard } from './AboutMeebitsBoard'
import { ParkMapBoard, PARK_MAP_BOARD_SPOTS } from './ParkMapBoard'
import {
  ABOUT_MEEBITS_BOARD_POSITION,
  ABOUT_MEEBITS_INTERACT_DISTANCE,
} from './aboutMeebits'
import { setParkDialogueContext } from './interactWithParkNpc'
import { parkNpcIdFor, parkCreatorNpcId, parkCreatorRecord, PARK_CREATOR_POSITION, PARK_CREATOR_ROTATION_Y, registerParkNpcs, getParkNpcById } from './parkNpcRegistry'
import { ParkPerimeter } from './ParkPerimeter'
import { applyChristmasLook } from './parkChristmas'
import { getParkLook, type ParkBenchPropKind, type ParkLook } from './parkLook'
import { applyTimeOfDayLook } from './parkTimeOfDay'
import { applyZoneLook } from './parkZoneTheme'
import {
  NPC_COLLISION_RADIUS,
  PLAYER_COLLISION_RADIUS,
  isParkPositionWalkable,
  resolveParkMovement,
  setParkCollisionZone,
} from './topCollisions'
import { ComingSoonPad, ParkZoneGate } from './ParkZoneGate'
import { AstroDistrictGround } from './AstroDistrictGround'
import { CultureDistrictGround } from './CultureDistrictGround'
import { MusicArtDistrictGround } from './MusicArtDistrictGround'
import { SeaDistrictGround } from './SeaDistrictGround'
import { MountainVoxelGround } from './MountainVoxelGround'
import { ParkSnowCover } from './ParkSnowCover'
import {
  getGateArrivalSpawn,
  getParkZone,
  type ParkGateDef,
  type ParkZoneId,
  type ParkZoneLayout,
} from './parkZones'
import { isInsideGateTrigger } from './parkGateRules'
import { buildPerimeterSpec, getLandClip } from './parkPerimeterSpec'
import { ParkBenchProp } from './ParkBenchProp'
import { ParkBackdrop } from './ParkBackdrop'
import { CameraOcclusionFader, OCCLUDER_USER_DATA } from '../world/CameraOcclusionFader'
import { JungleDistrictGround } from './JungleDistrictGround'
import { JungleAnimals } from './jungle/JungleAnimals'
import { isJungleConifer } from './jungle/jungleConfig'
import { buildParkGroveTreeModel, buildParkPineTreeModel } from './landmarks/parkTreeModel'
import { VoxelModelMesh } from './voxel/VoxelModelMesh'
import { parkPlayerWorld, setParkPlayerWorld } from './parkPlayerWorld'
import { useTopStore, type AttractionId } from './topStore'

const MOVE_SPEED = 7
const ENTRANCE_HALF_WIDTH = 1.45
const ENTRANCE_TRIGGER_DEPTH = 0.55
const ZONE_TRANSITION_MS = 280
const TOP_NPC_WALK_SPEED = 1.15
/** ミュージアム NPC と同じく、会話距離より少し手前で立ち止まる */
const PLAYER_STOP_DISTANCE = INTERACTION_DISTANCE + 1
const MIN_PLAYER_PAUSE_SECONDS = 2.2
const MAX_PLAYER_PAUSE_SECONDS = 4.2
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
  const activeZoneId = useTopStore((state) => state.activeZoneId)
  const timeOfDay = useTopStore((state) => state.timeOfDay)
  const zone = getParkZone(activeZoneId)
  const look = applyTimeOfDayLook(
    applyChristmasLook(activeZoneId, applyZoneLook(activeZoneId, getParkLook())),
    timeOfDay,
  )
  const layout = zone.layout
  const zoneAttractions = getAttractionsForZone(activeZoneId)

  useEffect(() => {
    setParkCollisionZone(activeZoneId)
  }, [activeZoneId])

  return (
    <>
      <color attach="background" args={[look.backgroundColor]} />
      <fog attach="fog" args={[look.fogColor, look.fogNear, look.fogFar]} />
      <ParkBackdrop
        zoneId={activeZoneId}
        layout={layout}
        perimeter={zone.perimeter}
        gates={zone.gates}
        look={look}
        timeOfDay={timeOfDay}
      />
      {look.showStars ? (
        <Stars radius={72} depth={28} count={900} factor={2.2} saturation={0.15} fade speed={0.25} />
      ) : null}
      <PerspectiveCamera
        makeDefault
        position={[0, 6.5, 18]}
        fov={45}
        near={0.1}
        far={activeZoneId === 'sea' ? 280 : 120}
      />
      <TopFollowCamera />
      <CameraOcclusionFader getTargets={getParkOcclusionTargets} />
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
        treeStyle={
          activeZoneId === 'sea' || activeZoneId === 'astro' || activeZoneId === 'musicArt'
            ? 'none'
            : activeZoneId === 'mountain'
              ? 'pine'
              : activeZoneId === 'jungle'
                ? 'mixed'
                : 'grove'
        }
        voxelGround={activeZoneId === 'mountain'}
        cultureGround={activeZoneId === 'culture'}
        seaGround={activeZoneId === 'sea'}
        astroGround={activeZoneId === 'astro'}
        musicArtGround={activeZoneId === 'musicArt'}
        jungleGround={activeZoneId === 'jungle'}
        showFountain={zone.hasFountain}
        landClip={zone.perimeter ? getLandClip(buildPerimeterSpec(layout, zone.perimeter, zone.gates)) : null}
      />
      {zone.perimeter ? (
        <ParkPerimeter
          layout={layout}
          perimeter={zone.perimeter}
          gates={zone.gates}
          locale={locale}
          look={look}
        />
      ) : null}
      {zone.hasFeaturedBoard ? (
        <group userData={OCCLUDER_USER_DATA}>
          <FeaturedInfoBoard
            featuredId={lineup.featuredId}
            featuredTraits={lineup.featuredTraits}
            themeTrait={lineup.themeTrait}
            locale={locale}
          />
        </group>
      ) : null}
      {activeZoneId === 'culture' ? (
        <group userData={OCCLUDER_USER_DATA}>
          <AboutMeebitsBoard locale={locale} />
        </group>
      ) : null}
      {/* 全エリアの手前にパークマップ（現在地はエリアごと） */}
      <group userData={OCCLUDER_USER_DATA}>
        <ParkMapBoard locale={locale} zoneId={activeZoneId} />
      </group>
      <ParkLamps
        look={look}
        lamps={zone.lamps}
        style={
          activeZoneId === 'sea'
            ? 'beach'
            : activeZoneId === 'astro'
              ? 'astro'
              : activeZoneId === 'musicArt'
                ? 'musicArt'
                : 'classic'
        }
      />
      <ParkDetails
        benchProp={look.benchProp}
        christmas={look.christmas}
        benchStyle={activeZoneId === 'astro' ? 'astro' : 'classic'}
        benches={zone.benches}
        planters={zone.planters}
        layout={layout}
        gates={zone.gates}
        showRailings={!zone.perimeter}
      />
      {activeZoneId === 'jungle' ? <JungleAnimals /> : null}
      {zoneAttractions.map((attraction) => (
        <AttractionBuilding
          key={attraction.id}
          attraction={attraction}
          locale={locale}
        />
      ))}
      {zone.gates.map((gate) => (
        <group key={gate.id} userData={OCCLUDER_USER_DATA}>
          <ParkZoneGate gate={gate} locale={locale} />
        </group>
      ))}
      {(zone.comingSoonSlots ?? []).map((slot) => (
        <ComingSoonPad
          key={`soon-${slot.x}-${slot.z}`}
          position={[slot.x, 0, slot.z]}
          locale={locale}
          theme={
            slot.theme ??
            (zone.perimeter?.theme === 'mountain'
              ? 'mountain'
              : zone.id === 'culture'
                ? 'culture'
                : zone.id === 'sea'
                  ? 'sea'
                  : zone.id === 'astro'
                    ? 'astro'
                    : zone.id === 'musicArt'
                      ? 'musicArt'
                      : 'classic')
          }
          title={slot.title}
          subtitle={slot.subtitle}
        />
      ))}
      {zone.hasNpcCrowd ? (
        <TopNpcCrowd
          zoneId={activeZoneId}
          visitors={
            activeZoneId === 'mountain'
              ? lineup.mountainVisitors
              : activeZoneId === 'sea'
                ? lineup.seaVisitors
                : activeZoneId === 'culture'
                  ? lineup.cultureVisitors
                  : activeZoneId === 'astro'
                    ? lineup.astroVisitors
                    : activeZoneId === 'musicArt'
                      ? lineup.musicArtVisitors
                      : activeZoneId === 'jungle'
                        ? lineup.jungleVisitors
                        : lineup.visitors
          }
          featuredId={lineup.featuredId}
          themeTrait={lineup.themeTrait}
          includeCreator={activeZoneId === 'plaza'}
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

/**
 * 透かし判定でカメラから見たい相手。
 * パークでは話しかけているときだけ（プレイヤーと NPC の胸・頭）。
 * 歩いているあいだは空を返し、透けていた物は元に戻る。
 */
const occlusionTargets = [new Vector3(), new Vector3(), new Vector3(), new Vector3()]
function getParkOcclusionTargets(): Vector3[] {
  const dialogue = useDialogueStore.getState()
  if (!dialogue.isOpen || !dialogue.activeNpcId) return []
  const npc = useNpcStore.getState().npcPositions[dialogue.activeNpcId]
  if (!npc) return []
  occlusionTargets[0].set(parkPlayerWorld.x, 1.1, parkPlayerWorld.z)
  occlusionTargets[1].set(parkPlayerWorld.x, 1.8, parkPlayerWorld.z)
  occlusionTargets[2].set(npc[0], npc[1] + 1.1, npc[2])
  occlusionTargets[3].set(npc[0], npc[1] + 1.8, npc[2])
  return occlusionTargets
}

/** Hunt 本編と同じ固定オフセット追従。会話中は NPC との中間へ寄る。 */
function TopFollowCamera() {
  useFrame(({ camera }, delta) => {
    const dialogue = useDialogueStore.getState()
    const isMobile = isTouchUiMode()

    playerPosition.set(parkPlayerWorld.x, 0, parkPlayerWorld.z)

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
  voxelGround = false,
  cultureGround = false,
  seaGround = false,
  astroGround = false,
  musicArtGround = false,
  jungleGround = false,
  showFountain,
  landClip,
}: {
  featuredId: number
  look: ParkLook
  layout: ParkZoneLayout
  trees: ReadonlyArray<readonly [number, number]>
  /** mixed = 針葉樹と広葉樹の混在（Jungle） */
  treeStyle?: 'grove' | 'pine' | 'mixed' | 'none'
  voxelGround?: boolean
  cultureGround?: boolean
  seaGround?: boolean
  astroGround?: boolean
  musicArtGround?: boolean
  jungleGround?: boolean
  showFountain: boolean
  /** 外周の川の上は床を切り取る（川が床の下を流れて見えるように） */
  landClip: ReturnType<typeof getLandClip> | null
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
  const groundRef = useRef<Group>(null)
  const gl = useThree((state) => state.gl)
  const clipMaxX = landClip?.maxX ?? null
  const clipMinX = landClip?.minX ?? null
  const clipMinZ = landClip?.minZ ?? null

  // 床だけを川の内側で切る（建物・木・外周には付けない）
  useEffect(() => {
    const group = groundRef.current
    if (!group) return
    const planes: Plane[] = []
    if (clipMaxX !== null) planes.push(new Plane(new Vector3(-1, 0, 0), clipMaxX))
    if (clipMinX !== null) planes.push(new Plane(new Vector3(1, 0, 0), -clipMinX))
    if (clipMinZ !== null) planes.push(new Plane(new Vector3(0, 0, 1), -clipMinZ))
    if (planes.length > 0) gl.localClippingEnabled = true
    group.traverse((object) => {
      const mesh = object as Mesh
      if (!mesh.isMesh) return
      const materials: Material[] = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const material of materials) {
        material.clippingPlanes = planes.length > 0 ? planes : null
        material.needsUpdate = true
      }
    })
  }, [
    gl,
    clipMaxX,
    clipMinX,
    clipMinZ,
    voxelGround,
    cultureGround,
    seaGround,
    astroGround,
    musicArtGround,
    jungleGround,
    look.christmas,
  ])

  return (
    <group>
      <group ref={groundRef}>
      {voxelGround ? (
        <MountainVoxelGround layout={layout} christmas={look.christmas} />
      ) : cultureGround ? (
        <CultureDistrictGround layout={layout} christmas={look.christmas} />
      ) : seaGround ? (
        <SeaDistrictGround layout={layout} />
      ) : astroGround ? (
        <AstroDistrictGround layout={layout} christmas={look.christmas} />
      ) : musicArtGround ? (
        <MusicArtDistrictGround layout={layout} christmas={look.christmas} />
      ) : jungleGround ? (
        <JungleDistrictGround layout={layout} christmas={look.christmas} />
      ) : (
        <>
          {/* エリア床（海・砂浜は置かない。外周は将来の崖・川） */}
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
          {look.christmas ? (
            <ParkSnowCover
              layout={layout}
              clearRadius={3.1}
              clearCenterZ={FOUNTAIN_CENTER_Z}
              y={0.085}
            />
          ) : null}
        </>
      )}
      </group>
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
      {treeStyle !== 'none'
        ? trees.map(([x, z]) => (
            <group key={`${x}-${z}`} position={[x, 0, 0]} userData={OCCLUDER_USER_DATA}>
              {/* mixed（Jungle の森）は植木鉢なし。針葉樹は雪だけ、広葉樹は冬にイルミネーション */}
              {treeStyle === 'pine' || (treeStyle === 'mixed' && isJungleConifer(x, z)) ? (
                <PineTree z={z} christmas={look.christmas} wild={treeStyle === 'mixed'} />
              ) : (
                <Tree z={z} christmas={look.christmas} wild={treeStyle === 'mixed'} />
              )}
            </group>
          ))
        : null}
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

function Tree({ z, christmas = false, wild = false }: { z: number; christmas?: boolean; wild?: boolean }) {
  const model = useMemo(() => buildParkGroveTreeModel(z, christmas, wild), [z, christmas, wild])
  return (
    <group position={[0, 0, z]}>
      <VoxelModelMesh model={model} />
    </group>
  )
}

function PineTree({ z, christmas = false, wild = false }: { z: number; christmas?: boolean; wild?: boolean }) {
  const model = useMemo(() => buildParkPineTreeModel(z, christmas, wild), [z, christmas, wild])
  return (
    <group position={[0, 0, z]}>
      <VoxelModelMesh model={model} />
    </group>
  )
}

function ParkLamps({
  look,
  lamps,
  style = 'classic',
}: {
  look: ParkLook
  lamps: ReadonlyArray<readonly [number, number]>
  style?: 'classic' | 'beach' | 'astro' | 'musicArt'
}) {
  return (
    <group>
      {lamps.map(([x, z]) => (
        <group key={`${x}-${z}`} userData={OCCLUDER_USER_DATA}>
          {style === 'beach' ? (
            <BeachLamp look={look} x={x} z={z} />
          ) : style === 'astro' ? (
            <AstroLamp look={look} x={x} z={z} />
          ) : style === 'musicArt' ? (
            <MusicArtLamp look={look} x={x} z={z} />
          ) : (
            <ClassicLamp look={look} x={x} z={z} />
          )}
        </group>
      ))}
    </group>
  )
}

/** Music & Art向け：深紫ポール＋マゼンタ／アンバーの先端ライト。 */
function MusicArtLamp({
  look,
  x,
  z,
}: {
  look: ParkLook
  x: number
  z: number
}) {
  const tipEmissive = look.christmas ? look.lampEmissiveColor : '#e85cff'
  const tipColor = look.christmas ? look.lampBulbColor : '#ffd0f0'
  const glow = look.christmas ? look.lampPointColor : '#ff9ae0'

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.36, 0.24, 10]} />
        <meshStandardMaterial color="#120818" metalness={0.55} roughness={0.42} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.11, 2.8, 8]} />
        <meshStandardMaterial color="#241830" metalness={0.45} roughness={0.4} />
      </mesh>
      <mesh position={[0, 3.05, 0]} castShadow>
        <boxGeometry args={[0.42, 0.16, 0.42]} />
        <meshStandardMaterial color="#e85cff" emissive="#e85cff" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 3.35, 0]} castShadow>
        <sphereGeometry args={[0.26, 14, 12]} />
        <meshStandardMaterial
          color={tipColor}
          emissive={tipEmissive}
          emissiveIntensity={look.lampEmissiveIntensity * 1.1}
          roughness={0.3}
        />
      </mesh>
      <pointLight
        position={[0, 3.4, 0]}
        intensity={look.lampLightIntensity}
        distance={14}
        color={glow}
      />
    </group>
  )
}

/** Astro向け：分節ポール＋シアンの環状ライト。 */
function AstroLamp({
  look,
  x,
  z,
}: {
  look: ParkLook
  x: number
  z: number
}) {
  const ringColors = look.christmas
    ? (['#e04040', '#40c878', '#f0d040'] as const)
    : (['#5ce0ff', '#5ce0ff', '#5ce0ff'] as const)
  const tipEmissive = look.christmas ? look.lampEmissiveColor : '#5ce0ff'
  const tipColor = look.christmas ? look.lampBulbColor : '#dff8ff'

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.28, 0.36, 0.24, 10]} />
        <meshStandardMaterial color="#0e1422" metalness={0.68} roughness={0.38} />
      </mesh>
      {[0.68, 1.55, 2.42].map((y, index) => (
        <group key={y}>
          <mesh position={[0, y, 0]} castShadow>
            <cylinderGeometry args={[0.075, 0.1, 0.78, 8]} />
            <meshStandardMaterial
              color={index % 2 === 0 ? '#1a2234' : '#2a3448'}
              metalness={0.7}
              roughness={0.34}
            />
          </mesh>
          <mesh position={[0, y + 0.39, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.14, 0.025, 8, 18]} />
            <meshStandardMaterial
              color={ringColors[index]}
              emissive={ringColors[index]}
              emissiveIntensity={look.christmas ? 0.7 : 0.45}
              metalness={0.45}
              roughness={0.3}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.1, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial
          color={tipColor}
          emissive={tipEmissive}
          emissiveIntensity={look.lampEmissiveIntensity * 1.15}
          roughness={0.22}
          metalness={0.12}
        />
      </mesh>
      <mesh position={[0, 3.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.36, 0.055, 8, 24]} />
        <meshStandardMaterial
          color={look.christmas ? '#e04040' : '#a878ff'}
          emissive={look.christmas ? '#e04040' : '#a878ff'}
          emissiveIntensity={0.55}
          metalness={0.5}
          roughness={0.3}
        />
      </mesh>
      {look.christmas ? (
        <pointLight
          position={[0, 3.1, 0]}
          intensity={look.lampLightIntensity * 0.55}
          distance={7.5}
          color={look.lampPointColor}
        />
      ) : null}
    </group>
  )
}

/** 広場・山・カルチャー用のクラシック街灯 */
function ClassicLamp({
  look,
  x,
  z,
}: {
  look: ParkLook
  x: number
  z: number
}) {
  const bulbColors = look.christmas
    ? ([
        { bulb: '#ffe0e0', emissive: '#e04040' },
        { bulb: '#e8ffe8', emissive: '#40c878' },
      ] as const)
    : ([
        { bulb: look.lampBulbColor, emissive: look.lampEmissiveColor },
        { bulb: look.lampBulbColor, emissive: look.lampEmissiveColor },
      ] as const)

  return (
    <group position={[x, 0, z]}>
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
      {[-0.42, 0.42].map((lanternX, index) => (
        <group key={lanternX} position={[lanternX, 3.05, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.19, 14, 12]} />
            <meshStandardMaterial
              color={bulbColors[index].bulb}
              emissive={bulbColors[index].emissive}
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
        color={look.lampPointColor}
      />
    </group>
  )
}

/** ビーチ向け：木のポール＋暖色ランタン */
function BeachLamp({
  look,
  x,
  z,
}: {
  look: ParkLook
  x: number
  z: number
}) {
  return (
    <group position={[x, 0, z]}>
      {/* 砂の台座 */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <cylinderGeometry args={[0.32, 0.4, 0.12, 10]} />
        <meshStandardMaterial color="#c4a880" roughness={0.96} />
      </mesh>
      {/* 木のポール */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.12, 2.2, 8]} />
        <meshStandardMaterial color="#6a4a30" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.095, 0.125, 2.15, 8]} />
        <meshStandardMaterial color="#8a6848" roughness={0.88} transparent opacity={0.35} />
      </mesh>
      {/* 横腕 */}
      <mesh position={[0.28, 2.35, 0]} rotation={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[0.55, 0.07, 0.07]} />
        <meshStandardMaterial color="#5a4030" roughness={0.88} />
      </mesh>
      {/* 吊り下げランタン */}
      <group position={[0.52, 2.05, 0]}>
        <mesh position={[0, 0.22, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.28, 6]} />
          <meshStandardMaterial color="#4a3428" roughness={0.85} />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[0.28, 0.36, 0.28]} />
          <meshStandardMaterial
            color="#fff2c8"
            emissive="#ffb040"
            emissiveIntensity={look.lampEmissiveIntensity * 1.15}
            transparent
            opacity={0.92}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow>
          <boxGeometry args={[0.32, 0.06, 0.32]} />
          <meshStandardMaterial color="#5a4030" roughness={0.88} />
        </mesh>
        <mesh position={[0, -0.2, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.16, 0.05, 8]} />
          <meshStandardMaterial color="#5a4030" roughness={0.88} />
        </mesh>
        <pointLight
          position={[0, 0, 0]}
          intensity={look.lampLightIntensity * 1.1}
          distance={9.5}
          color="#ffb060"
        />
      </group>
    </group>
  )
}

function ParkDetails({
  benchProp,
  christmas = false,
  benchStyle = 'classic',
  benches,
  planters,
  layout,
  gates,
  showRailings,
}: {
  benchProp: ParkBenchPropKind
  christmas?: boolean
  benchStyle?: 'classic' | 'astro'
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
        <group key={`bench-${index}`} userData={OCCLUDER_USER_DATA}>
          {benchStyle === 'astro' ? (
            <AstroBench position={[x, 0, z]} rotationY={rotationY} />
          ) : (
            <ClassicBench position={[x, 0, z]} rotationY={rotationY} />
          )}
        </group>
      ))}
      {planters.map(([x, z], index) => (
        <group key={`bench-prop-${index}`} userData={OCCLUDER_USER_DATA}>
          <ParkBenchProp
            kind={benchProp}
            christmas={christmas}
            position={[x, 0, z]}
            index={index}
          />
        </group>
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

/** Astroエリアの気密モジュール風ベンチ。 */
function AstroBench({
  position,
  rotationY,
}: {
  position: [number, number, number]
  rotationY: number
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.48, 0.05]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.18, 0.68]} />
        <meshStandardMaterial color="#253149" metalness={0.58} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.78, -0.27]} rotation={[-0.08, 0, 0]} castShadow>
        <boxGeometry args={[2.3, 0.62, 0.14]} />
        <meshStandardMaterial color="#1a2234" metalness={0.62} roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.79, -0.35]}>
        <boxGeometry args={[1.9, 0.12, 0.035]} />
        <meshStandardMaterial
          color="#5ce0ff"
          emissive="#5ce0ff"
          emissiveIntensity={0.45}
          metalness={0.45}
          roughness={0.3}
        />
      </mesh>
      {[-0.92, 0.92].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 0.26, 0]} castShadow>
            <boxGeometry args={[0.16, 0.52, 0.58]} />
            <meshStandardMaterial color="#0e1422" metalness={0.68} roughness={0.36} />
          </mesh>
          <mesh position={[0, 0.57, 0.15]} castShadow>
            <boxGeometry args={[0.2, 0.08, 0.42]} />
            <meshStandardMaterial color="#a878ff" emissive="#a878ff" emissiveIntensity={0.28} />
          </mesh>
        </group>
      ))}
      {[-0.55, 0, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.58, 0.39]}>
          <boxGeometry args={[0.035, 0.04, 0.16]} />
          <meshStandardMaterial color="#5ce0ff" emissive="#5ce0ff" emissiveIntensity={0.35} />
        </mesh>
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
  const displayedTraits = orderedTraits.filter(
    ([type, value]) => !(type === themeTrait.traitType && value === themeTrait.traitValue),
  )
  const mid = Math.ceil(displayedTraits.length / 2)
  const leftTraits = displayedTraits.slice(0, mid)
  const rightTraits = displayedTraits.slice(mid)
  const maxTraitRows = Math.max(leftTraits.length, rightTraits.length)
  const boardBottomY = 0.42
  const boardHeight = Math.max(1.85, 1.14 + maxTraitRows * 0.141)
  const boardTopY = boardBottomY + boardHeight
  const boardCenterY = boardBottomY + boardHeight * 0.5
  const postBottomY = 0.08
  const postHeight = boardTopY - postBottomY

  return (
    <group position={FEATURED_BOARD_POSITION} rotation={[0, 0, 0]}>
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[3.35, 0.2, 0.9]} />
        <meshStandardMaterial color="#29242c" roughness={0.62} />
      </mesh>
      {[-1.35, 1.35].map((x) => (
        <mesh key={x} position={[x, postBottomY + postHeight * 0.5, 0]}>
          <cylinderGeometry args={[0.05, 0.065, postHeight, 10]} />
          <meshStandardMaterial color="#a8864d" metalness={0.66} roughness={0.34} />
        </mesh>
      ))}
      <mesh position={[0, boardCenterY, 0.04]}>
        <boxGeometry args={[3.4, boardHeight, 0.14]} />
        <meshStandardMaterial
          color="#17151d"
          emissive="#d4b46a"
          emissiveIntensity={0.1}
          metalness={0.18}
          roughness={0.5}
        />
      </mesh>

      <mesh position={[0, boardTopY - 0.23, 0.05]}>
        <boxGeometry args={[3.25, 0.38, 0.04]} />
        <meshStandardMaterial color="#221c28" roughness={0.55} metalness={0.12} />
      </mesh>
      <Text
        position={[-0.78, boardTopY - 0.21, 0.14]}
        fontSize={0.15}
        color="#e2c77f"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.5}
      >
        {heading}
      </Text>
      <Text
        position={[0.88, boardTopY - 0.21, 0.14]}
        fontSize={0.22}
        color="#f4ead2"
        anchorX="center"
        anchorY="middle"
      >
        {`#${featuredId}`}
      </Text>

      <mesh position={[0, boardTopY - 0.49, 0.13]}>
        <boxGeometry args={[3.05, 0.012, 0.02]} />
        <meshStandardMaterial color="#d4b46a" emissive="#8b632b" emissiveIntensity={0.35} />
      </mesh>

      {/* 本日の共通トレイト（マッチ枠10体の基準） */}
      <Text
        position={[0, boardTopY - 0.63, 0.15]}
        fontSize={0.1}
        color="#caa75b"
        anchorX="center"
        anchorY="middle"
      >
        {linkLabel}
      </Text>
      <Text
        position={[0, boardTopY - 0.79, 0.15]}
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
        position={[-0.82, boardTopY - 0.96, 0.15]}
      />
      <FeaturedTraitColumn
        traits={rightTraits}
        position={[0.82, boardTopY - 0.96, 0.15]}
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
  position,
}: {
  traits: Array<[string, string]>
  position: [number, number, number]
}) {
  if (traits.length === 0) return null

  const lines = traits
    .map(([type, value]) => `${type} · ${formatTraitDisplayName(type, value)}`)
    .join('\n')

  return (
    <Text
      position={position}
      fontSize={0.11}
      lineHeight={1.28}
      color="#d8cfc0"
      anchorX="center"
      anchorY="top"
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
  /** walk = 歩き回る / sit = ベンチに座っている / view = 看板などを眺めて立っている */
  role: 'walk' | 'sit' | 'view'
}

type NpcSpot = { x: number; z: number; rotationY: number }

/** ベンチに座ったときの体の高さ（座りポーズで腰が座面に乗る高さ） */
const PARK_BENCH_SIT_Y = 0.02
/** 座っている人が話しかけられたとき、顔を向けられる左右の最大角（30°） */
const SEATED_HEAD_TURN_MAX = Math.PI / 6
/** 顔の向きは首と頭で分けて回す（首 4 : 頭 6） */
const SEATED_NECK_SHARE = 0.4

/** ベンチの座る位置（1 台に 2 席。座面の少し前寄り、ベンチの正面を向く） */
function getBenchSeats(zoneId: ParkZoneId): NpcSpot[] {
  return getParkZone(zoneId).benches.flatMap(([bx, bz, ry]) =>
    [-0.5, 0.5].map((lx) => {
      // 座面（奥行き 0.65、中心 +0.08）の前寄り。奥すぎると膝が座面にめり込む
      const lz = 0.32
      return {
        x: bx + lx * Math.cos(ry) + lz * Math.sin(ry),
        z: bz - lx * Math.sin(ry) + lz * Math.cos(ry),
        rotationY: ry,
      }
    }),
  )
}

/** 看板・銅像などの前で、そちらを向いて立つ場所（どれも -Z 側を見る） */
function getViewSpots(zoneId: ParkZoneId): NpcSpot[] {
  const spots: NpcSpot[] = []
  const facingBack = Math.PI
  const [mx, , mz] = PARK_MAP_BOARD_SPOTS[zoneId]
  spots.push({ x: mx - 0.9, z: mz + 2.0, rotationY: facingBack }, { x: mx + 0.9, z: mz + 2.2, rotationY: facingBack })
  for (const attraction of getAttractionsForZone(zoneId)) {
    const bx = attraction.x + attraction.infoBoardLocal[0]
    const bz = attraction.z + attraction.infoBoardLocal[1]
    spots.push({ x: bx, z: bz + 1.6, rotationY: facingBack })
  }
  if (zoneId === 'plaza') {
    // 今日の主役の看板と、噴水の銅像
    spots.push({ x: FEATURED_BOARD_POSITION[0], z: FEATURED_BOARD_POSITION[2] + 1.6, rotationY: facingBack })
    for (const side of [-1, 1]) {
      const x = side * 2.5
      const z = FOUNTAIN_CENTER_Z + 2.5
      spots.push({ x, z, rotationY: Math.atan2(-x, FOUNTAIN_CENTER_Z - z) })
    }
  }
  if (zoneId === 'culture') {
    spots.push({ x: ABOUT_MEEBITS_BOARD_POSITION[0], z: ABOUT_MEEBITS_BOARD_POSITION[2] + 1.6, rotationY: facingBack })
  }
  return spots.filter((spot) => isTopNpcPositionWalkable(spot.x, spot.z, zoneId))
}

function shuffled<T>(items: T[]): T[] {
  const list = [...items]
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[list[i], list[j]] = [list[j], list[i]]
  }
  return list
}

function createTopNpcSpawns(visitors: DailyVisitor[], zoneId: ParkZoneId): TopNpcSpawn[] {
  // ID は日次固定。位置・向きだけ訪問ごとにランダムにして探しがいを出す。
  const spawns: TopNpcSpawn[] = []

  // 何人かはベンチに座り、何人かは看板や銅像を眺めている（どちらも 2〜3 人）
  const seats = shuffled(getBenchSeats(zoneId)).slice(0, MathUtils.randInt(2, 3))
  const views = shuffled(getViewSpots(zoneId)).slice(0, MathUtils.randInt(2, 3))
  for (const [role, spots] of [
    ['sit', seats],
    ['view', views],
  ] as const) {
    for (const spot of spots) {
      const visitor = visitors[spawns.length]
      if (!visitor) break
      spawns.push({
        meebitNumber: visitor.meebitNumber,
        matched: visitor.matched,
        x: spot.x,
        z: spot.z,
        rotationY: spot.rotationY,
        walkPattern: (spawns.length % TOP_NPC_WALK_PATTERNS.length) as 0 | 1 | 2,
        role,
      })
    }
  }

  let attempts = 0
  const maxAttempts = visitors.length * 80

  while (spawns.length < visitors.length && attempts < maxAttempts) {
    attempts += 1
    const x = MathUtils.randFloat(-18, 18)
    const z = MathUtils.randFloat(-4.8, 13)

    if (!isTopNpcPositionWalkable(x, z, zoneId)) continue
    if (spawns.some((spawn) => Math.hypot(spawn.x - x, spawn.z - z) < 1.45)) continue
    if (seats.some((seat) => Math.hypot(seat.x - x, seat.z - z) < 1.2)) continue

    const visitor = visitors[spawns.length]
    if (!visitor) break

    spawns.push({
      meebitNumber: visitor.meebitNumber,
      matched: visitor.matched,
      x,
      z,
      rotationY: Math.random() * Math.PI * 2,
      walkPattern: (spawns.length % TOP_NPC_WALK_PATTERNS.length) as 0 | 1 | 2,
      role: 'walk',
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
    if (!isTopNpcPositionWalkable(x, z, zoneId)) {
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
      role: 'walk',
    })
  }

  return spawns
}

function isTopNpcPositionWalkable(x: number, z: number, zoneId: ParkZoneId) {
  const zone = getParkZone(zoneId)
  const layout = zone.layout
  if (Math.abs(x) > layout.boundsX - 2 || z < layout.minZ + 2 || z > layout.maxZ - 1.5) {
    return false
  }
  for (const attraction of getAttractionsForZone(zoneId)) {
    if (Math.hypot(x - attraction.x, z - attraction.entranceZ) < 2.8) return false
  }
  for (const gate of zone.gates) {
    if (Math.hypot(x - gate.x, z - gate.z) < 3.2) return false
  }
  for (const slot of zone.comingSoonSlots ?? []) {
    if (Math.hypot(x - slot.x, z - slot.z) < 3.5) return false
  }
  return isParkPositionWalkable(x, z, NPC_COLLISION_RADIUS)
}

function TopNpcCrowd({
  zoneId,
  visitors,
  featuredId,
  themeTrait,
  includeCreator = false,
}: {
  zoneId: ParkZoneId
  visitors: DailyVisitor[]
  featuredId: number
  themeTrait: DailyThemeTrait
  /** Shawn は広場のみ */
  includeCreator?: boolean
}) {
  const started = useTopStore((state) => state.started)
  // visitors（日次固定ID）だけ依存。位置はマウントごとにランダム。
  const spawns = useMemo(() => createTopNpcSpawns(visitors, zoneId), [visitors, zoneId])

  useEffect(() => {
    setParkDialogueContext(featuredId, themeTrait)
    const records = [
      ...visitors.map((visitor) => ({
        id: parkNpcIdFor(visitor.meebitNumber),
        meebitNumber: visitor.meebitNumber,
        matched: visitor.matched,
        isFeatured: visitor.meebitNumber === featuredId,
      })),
      ...(includeCreator ? [parkCreatorRecord()] : []),
    ]
    registerParkNpcs(records)
    // 前ゾーン／ミュージアムの座標が残ると、見えなくなった NPC が nearest を奪う
    useNpcStore.getState().retainNpcPositions(records.map((record) => record.id))
    return () => {
      useNpcStore.getState().setNearestNpcId(null)
    }
  }, [visitors, featuredId, themeTrait, includeCreator])

  if (!started) return null

  return (
    <group>
      {spawns.map((spawn, index) => (
        <TopNpc key={`${zoneId}-${spawn.meebitNumber}-${index}`} spawn={spawn} index={index} />
      ))}
      {includeCreator ? <ParkCreatorNpc /> : null}
    </group>
  )
}

/** プレイヤーに近い来場者を nearest としてマーク（赤いピン用）。 */
function ParkNpcProximitySystem() {
  useFrame(() => {
    if (!useTopStore.getState().started) return
    if (useDialogueStore.getState().isOpen) return

    const positions = useNpcStore.getState().npcPositions
    let nearestId: string | null = null
    let nearestDistance = INTERACTION_DISTANCE

    for (const [npcId, position] of Object.entries(positions)) {
      // レジストリ外（前ゾーン・ミュージアムの幽霊）は無視
      if (!getParkNpcById(npcId)) continue
      const distance = Math.hypot(position[0] - parkPlayerWorld.x, position[2] - parkPlayerWorld.z)
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

/**
 * ミュージアム NPC と同じ近接ポーズ。
 * 近づくと数秒立ち止まり、離れるかタイマー切れで再開する。
 */
function getParkNpcStoppedForPlayer({
  distance,
  elapsedTime,
  isDialogueActive,
  pauseSeed,
  playerPauseUntilRef,
}: {
  distance: number
  elapsedTime: number
  isDialogueActive: boolean
  pauseSeed: number
  playerPauseUntilRef: { current: number }
}) {
  if (isDialogueActive) {
    return true
  }

  if (distance > PLAYER_STOP_DISTANCE) {
    playerPauseUntilRef.current = 0
    return false
  }

  if (playerPauseUntilRef.current === 0) {
    const pauseNoise = seededNoise(pauseSeed * 4.17 + elapsedTime * 0.41)
    playerPauseUntilRef.current =
      elapsedTime +
      MIN_PLAYER_PAUSE_SECONDS +
      pauseNoise * (MAX_PLAYER_PAUSE_SECONDS - MIN_PLAYER_PAUSE_SECONDS)
  }

  return elapsedTime < playerPauseUntilRef.current
}

function seededNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453
  return value - Math.floor(value)
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
  const playerPauseUntilRef = useRef(0)
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

  useFrame((state, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05)
    const group = groupRef.current
    localTimeRef.current += safeDelta

    if (group) {
      useNpcStore.getState().setNpcPosition(npcId, [group.position.x, 0, group.position.z])
    }

    const dx = group ? parkPlayerWorld.x - group.position.x : 0
    const dz = group ? parkPlayerWorld.z - group.position.z : 0
    const distance = Math.hypot(dx, dz)
    const isStoppedForPlayer = getParkNpcStoppedForPlayer({
      distance,
      elapsedTime: state.clock.elapsedTime,
      isDialogueActive,
      pauseSeed: CREATOR_MEEBIT_ID,
      playerPauseUntilRef,
    })

    // 会話中・近接時は立ち止まってプレイヤーを向く
    if (isStoppedForPlayer && group) {
      const faceY = Math.atan2(dx, dz)
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

      if (isTopNpcPositionWalkable(nextX, nextZ, useTopStore.getState().activeZoneId)) {
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
  const playerPauseUntilRef = useRef(0)
  const rotationYRef = useRef(spawn.rotationY)
  const targetRotationYRef = useRef(spawn.rotationY)
  const localTimeRef = useRef(index * 0.37)
  const walkPhaseOffset = getNpcWalkPhaseOffset(spawn.walkPattern)
  const breathParams = useMemo(() => getAudienceBreathParams(spawn.meebitNumber), [spawn.meebitNumber])
  /** 座っている人の顔の向き（体の正面からの角度）と、前のフレームで首・頭に足した量 */
  const headYawRef = useRef(0)
  const appliedHeadYawRef = useRef(0)
  const { vrmRef, vrmScene, update } = useVRMModel(
    spawn.meebitNumber,
    true,
    120 + index,
    true,
    // Exclusive: プール共有クローンはテンプレの骨を共有し、表示メッシュに
    // ロコモーションが届かず T ポーズのままになるため単独ロードする。
    true,
  )

  useFrame((state, delta) => {
    const safeDelta = Math.min(Math.max(delta, 0), 0.05)
    const group = groupRef.current
    localTimeRef.current += safeDelta

    if (group) {
      useNpcStore.getState().setNpcPosition(npcId, [group.position.x, 0, group.position.z])
    }

    // ベンチに座っている人は、話しかけられても座ったまま（向きも変えない）
    if (spawn.role === 'sit') {
      const vrm = vrmRef.current
      const neck = vrm?.humanoid.getNormalizedBoneNode('neck') ?? null
      const head = vrm?.humanoid.getNormalizedBoneNode('head') ?? null
      // 前のフレームで足した顔の向きをいったん戻してから、座りポーズ（呼吸・揺れ）を当てる
      const applied = appliedHeadYawRef.current
      if (neck) neck.rotation.y -= applied * SEATED_NECK_SHARE
      if (head) head.rotation.y -= applied * (1 - SEATED_NECK_SHARE)

      if (group) {
        group.position.set(spawn.x, PARK_BENCH_SIT_Y, spawn.z)
        group.rotation.y = spawn.rotationY
      }
      applyVRMSitPose(vrm, { elapsedTime: localTimeRef.current, ...breathParams })

      // 話しかけられている（または近くに来た）ときだけ、体はそのままで顔をこちらへ（左右 30° まで）
      let target = 0
      if (group) {
        const px = parkPlayerWorld.x - group.position.x
        const pz = parkPlayerWorld.z - group.position.z
        if (isDialogueActive || Math.hypot(px, pz) < PLAYER_STOP_DISTANCE) {
          const relative = Math.atan2(px, pz) - spawn.rotationY
          target = MathUtils.clamp(
            Math.atan2(Math.sin(relative), Math.cos(relative)),
            -SEATED_HEAD_TURN_MAX,
            SEATED_HEAD_TURN_MAX,
          )
        }
      }
      headYawRef.current += (target - headYawRef.current) * (1 - Math.exp(-safeDelta * 4))
      const yaw = headYawRef.current
      if (neck) neck.rotation.y += yaw * SEATED_NECK_SHARE
      if (head) head.rotation.y += yaw * (1 - SEATED_NECK_SHARE)
      appliedHeadYawRef.current = neck || head ? yaw : 0

      update(safeDelta)
      return
    }

    const dx = group ? parkPlayerWorld.x - group.position.x : 0
    const dz = group ? parkPlayerWorld.z - group.position.z : 0
    const distance = Math.hypot(dx, dz)
    const isStoppedForPlayer = getParkNpcStoppedForPlayer({
      distance,
      elapsedTime: state.clock.elapsedTime,
      isDialogueActive,
      pauseSeed: spawn.meebitNumber,
      playerPauseUntilRef,
    })

    // 会話中・近接時は立ち止まってプレイヤーを向く
    if (isStoppedForPlayer && group) {
      const faceY = Math.atan2(dx, dz)
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

    // 看板などを眺めている人は、その場で立ち止まったまま（話したあとは向き直る）
    if (spawn.role === 'view') {
      if (group) {
        const angleDelta = Math.atan2(
          Math.sin(spawn.rotationY - rotationYRef.current),
          Math.cos(spawn.rotationY - rotationYRef.current),
        )
        rotationYRef.current += angleDelta * (1 - Math.exp(-safeDelta * 2.2))
        group.rotation.y = rotationYRef.current
        group.position.y = 0.06
      }
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

      if (isTopNpcPositionWalkable(nextX, nextZ, useTopStore.getState().activeZoneId)) {
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
    const root = rootRef.current
    if (root) {
      root.position.set(parkPlayerWorld.x, 0.06, parkPlayerWorld.z)
      root.rotation.y = parkPlayerWorld.rotationY
      if (parkPlayerWorld.isMoving) {
        root.position.y += Math.abs(Math.sin(state.clock.elapsedTime * 10.5)) * 0.025
      }
    }
    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: state.clock.elapsedTime,
      isMoving: parkPlayerWorld.isMoving,
      isRunning: parkPlayerWorld.isMoving,
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
  const nearestAboutBoardRef = useRef(false)
  const isEnteringRef = useRef(false)
  const isGateCrossingRef = useRef(false)

  useFrame((_, delta) => {
    const state = useTopStore.getState()
    if (state.zoneTransitioning) return
    if (state.aboutBrowserOpen) return

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
    let x = parkPlayerWorld.x
    let z = parkPlayerWorld.z
    let rotationY = parkPlayerWorld.rotationY

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

    setParkPlayerWorld(x, z, rotationY, moving)

    if (useDialogueStore.getState().isOpen) return

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
    }

    let insideGate = false

    for (const gate of zone.gates) {
      // 判定幅は門の開口いっぱい（橋の端を歩いても移動できる）
      if (isInsideGateTrigger(gate, x, z)) {
        insideGate = true
        if (!isGateCrossingRef.current) {
          isGateCrossingRef.current = true
          transitionToZone(gate.targetZone, getGateArrivalSpawn(zone.id, gate))
          return
        }
      }
    }

    if (!insideAnyEntrance) isEnteringRef.current = false
    if (!insideGate) isGateCrossingRef.current = false

    if (useTopStore.getState().nearestAttraction != null) {
      useTopStore.getState().setNearestAttraction(null)
    }
    if (useTopStore.getState().nearestGateId != null) {
      useTopStore.getState().setNearestGateId(null)
    }

    const nearAboutBoard =
      state.activeZoneId === 'culture' &&
      Math.hypot(x - ABOUT_MEEBITS_BOARD_POSITION[0], z - ABOUT_MEEBITS_BOARD_POSITION[2]) <
        ABOUT_MEEBITS_INTERACT_DISTANCE
    if (nearAboutBoard !== nearestAboutBoardRef.current) {
      nearestAboutBoardRef.current = nearAboutBoard
      useTopStore.getState().setNearestAboutBoard(nearAboutBoard)
    }
  })

  return null
}
