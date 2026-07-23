import { Text } from '@react-three/drei'
import { useMemo } from 'react'
import type { ParkGateDef, ParkZoneLayout } from './parkZones'
import {
  buildPerimeterSpec,
  getBridgePlacement,
  getCardinalGatePlacement,
  getOpening,
  isFrontClearSide,
  isPerimeterGateOpening,
  riverInnerOnNS,
  shouldBuildPerimeterSide,
  splitAxisSegments,
  type CardinalSide,
  type ParkPerimeterDef,
  type PerimeterSpec,
} from './parkPerimeterSpec'

/** クラシック園の境界パレット */
const STONE = '#4a4552'
const STONE_DARK = '#35303c'
const STONE_LIGHT = '#6a6570'
const GOLD = '#c4a060'
const GOLD_DIM = '#9a7a40'
const WATER = '#1a6a8a'
const WATER_DEEP = '#0f4a62'
const WATER_FOAM = '#8ec8e0'
const IVY = '#3d5a40'

/** マウンテン（マインクラフト山岳）パレット */
const MT_STONE = '#6a6e68'
const MT_STONE_DARK = '#4a4e48'
const MT_STONE_LIGHT = '#8a8e82'
const MT_GRASS = '#5a8a48'
const MT_DIRT = '#6a5a42'
const MT_WATER = '#2a7a9a'
const MT_WATER_DEEP = '#1a4a62'
const MT_WATER_FOAM = '#a0d8e8'
const MT_WOOD = '#7a5a38'
const MT_MOSS = '#3d6a40'

function isMountainTheme(spec: PerimeterSpec) {
  return spec.theme === 'mountain'
}

/**
 * エリア外周: 崖・壁・川・滝・橋・封印門。
 * theme=classic → クラシック園 / theme=mountain → ボクセル山岳
 */
export function ParkPerimeter({
  layout,
  perimeter,
  gates,
  locale,
}: {
  layout: ParkZoneLayout
  perimeter: ParkPerimeterDef
  gates: ParkGateDef[]
  locale: 'en' | 'ja'
}) {
  const spec = useMemo(
    () => buildPerimeterSpec(layout, perimeter, gates),
    [layout, perimeter, gates],
  )

  return (
    <group>
      <RiverAndWalls spec={spec} />
      <LowCornerMarkers spec={spec} />
      <CornerWaterfalls spec={spec} />
      <CardinalFeatures spec={spec} locale={locale} />
      <WallLanterns spec={spec} />
    </group>
  )
}

function RiverAndWalls({ spec }: { spec: PerimeterSpec }) {
  const { cx, cz, riverInnerX, riverInnerZN, riverInnerZS, riverWidth, wallThickness, wallHeight } =
    spec
  const riverMidX = riverInnerX + riverWidth * 0.5
  const wallMidX = riverInnerX + riverWidth + wallThickness * 0.5
  const riverMidZN = riverInnerZN + riverWidth * 0.5
  const riverMidZS = riverInnerZS + riverWidth * 0.5
  const wallMidZN = riverInnerZN + riverWidth + wallThickness * 0.5
  const wallMidZS = riverInnerZS + riverWidth + wallThickness * 0.5
  const halfSpanZ =
    Math.max(riverInnerZN, riverInnerZS) + riverWidth + wallThickness * 0.5
  const halfSpanX = riverInnerX + riverWidth + wallThickness * 0.5

  const sides: Array<{
    side: CardinalSide
    riverPos: [number, number, number]
    wallPos: [number, number, number]
    axis: 'z' | 'x'
  }> = [
    {
      side: 'e',
      riverPos: [cx + riverMidX, -0.35, cz],
      wallPos: [cx + wallMidX, wallHeight * 0.5, cz],
      axis: 'z',
    },
    {
      side: 'w',
      riverPos: [cx - riverMidX, -0.35, cz],
      wallPos: [cx - wallMidX, wallHeight * 0.5, cz],
      axis: 'z',
    },
    {
      side: 'n',
      riverPos: [cx, -0.35, cz + riverMidZN],
      wallPos: [cx, wallHeight * 0.5, cz + wallMidZN],
      axis: 'x',
    },
    {
      side: 's',
      riverPos: [cx, -0.35, cz - riverMidZS],
      wallPos: [cx, wallHeight * 0.5, cz - wallMidZS],
      axis: 'x',
    },
  ]

  return (
    <group>
      {sides.map((sideDef) => {
        // 手前クリア辺はゲートが無い限り完全スキップ
        if (!shouldBuildPerimeterSide(spec, sideDef.side)) return null

        const opening = getOpening(spec, sideDef.side)
        const isGateOpening = isPerimeterGateOpening(opening)
        const riverGap = isGateOpening ? spec.openingHalf : 0
        const wallGap = isGateOpening ? spec.wallOpeningHalf : 0
        const openCenter =
          opening?.kind === 'bridge-gate'
            ? (spec.gates.find((g) => g.id === opening.gateId)?.[
                sideDef.axis === 'z' ? 'z' : 'x'
              ] ?? (sideDef.axis === 'z' ? cz : cx))
            : sideDef.axis === 'z'
              ? cz
              : cx

        const span = sideDef.axis === 'z' ? halfSpanZ : halfSpanX
        const riverSegments = splitAxisSegments(
          sideDef.axis === 'z' ? cz : cx,
          span,
          openCenter,
          riverGap,
        )
        const wallSegments = splitAxisSegments(
          sideDef.axis === 'z' ? cz : cx,
          span,
          openCenter,
          wallGap,
        )

        return (
          <group key={sideDef.side}>
            {riverSegments.map((seg, index) => {
              const riverSize: [number, number, number] =
                sideDef.axis === 'z'
                  ? [riverWidth, 0.55, seg.half * 2]
                  : [seg.half * 2, 0.55, riverWidth]
              const riverPos: [number, number, number] =
                sideDef.axis === 'z'
                  ? [sideDef.riverPos[0], sideDef.riverPos[1], seg.mid]
                  : [seg.mid, sideDef.riverPos[1], sideDef.riverPos[2]]

              return (
                <group key={`${sideDef.side}-river-${index}`}>
                  <RiverSegment position={riverPos} size={riverSize} mountain={isMountainTheme(spec)} />
                </group>
              )
            })}
            {wallSegments.map((seg, index) => {
              const wallSize: [number, number, number] =
                sideDef.axis === 'z'
                  ? [wallThickness, wallHeight, seg.half * 2]
                  : [seg.half * 2, wallHeight, wallThickness]
              const wallPos: [number, number, number] =
                sideDef.axis === 'z'
                  ? [sideDef.wallPos[0], sideDef.wallPos[1], seg.mid]
                  : [seg.mid, sideDef.wallPos[1], sideDef.wallPos[2]]

              return isMountainTheme(spec) ? (
                <VoxelCliff
                  key={`${sideDef.side}-wall-${index}`}
                  position={wallPos}
                  size={wallSize}
                  axis={sideDef.axis}
                />
              ) : (
                <ClassicWall
                  key={`${sideDef.side}-wall-${index}`}
                  position={wallPos}
                  size={wallSize}
                  axis={sideDef.axis}
                />
              )
            })}
            {isGateOpening ? (
              <GateWallReveal
                spec={spec}
                side={sideDef.side}
                wallMid={sideDef.axis === 'z' ? sideDef.wallPos[0] : sideDef.wallPos[2]}
                axis={sideDef.axis}
                openCenter={openCenter}
              />
            ) : null}
          </group>
        )
      })}
    </group>
  )
}

function RiverSegment({
  position,
  size,
  mountain = false,
}: {
  position: [number, number, number]
  size: [number, number, number]
  mountain?: boolean
}) {
  const deep = mountain ? MT_WATER_DEEP : WATER_DEEP
  const mid = mountain ? MT_WATER : WATER
  const foam = mountain ? MT_WATER_FOAM : WATER_FOAM
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={deep}
          emissive={mid}
          emissiveIntensity={0.35}
          metalness={0.55}
          roughness={0.18}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh position={[0, size[1] * 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0] * 0.92, size[2] * 0.92]} />
        <meshStandardMaterial
          color={mid}
          emissive={foam}
          emissiveIntensity={0.22}
          transparent
          opacity={0.35}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
    </group>
  )
}

function ClassicWall({
  position,
  size,
  axis,
}: {
  position: [number, number, number]
  size: [number, number, number]
  axis: 'x' | 'z'
}) {
  const [sx, sy, sz] = size
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[sx, sy, sz]} />
        <meshStandardMaterial color={STONE} roughness={0.92} />
      </mesh>
      {/* 控えめな上層バンド（門を隠すほどの崖にはしない） */}
      <mesh position={[0, sy * 0.5 + 0.35, 0]} castShadow receiveShadow>
        <boxGeometry
          args={[
            axis === 'z' ? sx * 1.08 : sx,
            0.7,
            axis === 'z' ? sz : sz * 1.08,
          ]}
        />
        <meshStandardMaterial color={STONE_DARK} roughness={0.94} />
      </mesh>
      <mesh position={[0, sy * 0.5 + 0.78, 0]} castShadow>
        <boxGeometry
          args={[
            axis === 'z' ? sx * 1.18 : sx * 1.02,
            0.16,
            axis === 'z' ? sz * 1.02 : sz * 1.18,
          ]}
        />
        <meshStandardMaterial color={GOLD} metalness={0.42} roughness={0.4} />
      </mesh>
    </group>
  )
}

/** マインクラフト風の段々崖（石＋草ブロック天面） */
function VoxelCliff({
  position,
  size,
  axis,
}: {
  position: [number, number, number]
  size: [number, number, number]
  axis: 'x' | 'z'
}) {
  const [sx, sy, sz] = size
  const tiers = 3
  return (
    <group position={position}>
      {Array.from({ length: tiers }, (_, tier) => {
        const t = tier / tiers
        const h = sy / tiers
        const inset = tier * 0.18
        const tw = axis === 'z' ? sx + inset : sx - inset * 0.5
        const td = axis === 'z' ? sz - inset * 0.5 : sz + inset
        return (
          <mesh
            key={tier}
            position={[0, -sy * 0.5 + h * (tier + 0.5), 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[Math.max(tw, 0.4), h * 0.96, Math.max(td, 0.4)]} />
            <meshStandardMaterial
              color={tier === tiers - 1 ? MT_STONE_LIGHT : tier === 0 ? MT_STONE_DARK : MT_STONE}
              roughness={0.96}
            />
          </mesh>
        )
      })}
      {/* 草ブロック天面 */}
      <mesh position={[0, sy * 0.5 + 0.12, 0]} castShadow receiveShadow>
        <boxGeometry
          args={[
            axis === 'z' ? sx * 1.05 : sx * 0.92,
            0.28,
            axis === 'z' ? sz * 0.92 : sz * 1.05,
          ]}
        />
        <meshStandardMaterial color={MT_GRASS} roughness={0.9} />
      </mesh>
      <mesh position={[0, sy * 0.5 - 0.05, 0]} receiveShadow>
        <boxGeometry
          args={[
            axis === 'z' ? sx * 0.98 : sx * 0.88,
            0.2,
            axis === 'z' ? sz * 0.88 : sz * 0.98,
          ]}
        />
        <meshStandardMaterial color={MT_DIRT} roughness={0.95} />
      </mesh>
    </group>
  )
}

/**
 * ゲート開口の両脇を翼壁にし、門を額縁のように見せる。
 * mountain はボクセル崖の柱で門に自然につなぐ。
 */
function GateWallReveal({
  spec,
  side,
  wallMid,
  axis,
  openCenter,
}: {
  spec: PerimeterSpec
  side: CardinalSide
  wallMid: number
  axis: 'x' | 'z'
  openCenter: number
}) {
  const mountain = isMountainTheme(spec)
  const wing = mountain ? 1.55 : 1.15
  const h = mountain
    ? Math.min(spec.wallHeight * 0.85, 3.1)
    : Math.min(spec.wallHeight * 0.55, 1.55)
  const t = spec.wallThickness * (mountain ? 1.05 : 0.85)
  const edge = spec.wallOpeningHalf * 0.92

  return (
    <group>
      {([-1, 1] as const).map((dir) => {
        const along = openCenter + dir * edge
        const position: [number, number, number] =
          axis === 'z' ? [wallMid, h * 0.5, along] : [along, h * 0.5, wallMid]
        const size: [number, number, number] =
          axis === 'z' ? [t, h, wing] : [wing, h, t]
        return (
          <group key={`${side}-wing-${dir}`} position={position}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={size} />
              <meshStandardMaterial
                color={mountain ? MT_STONE : STONE_LIGHT}
                roughness={mountain ? 0.95 : 0.88}
              />
            </mesh>
            {mountain ? (
              <>
                <mesh position={[0, h * 0.15, dir * 0.15]} castShadow>
                  <boxGeometry
                    args={
                      axis === 'z'
                        ? [t * 1.15, h * 0.55, wing * 0.7]
                        : [wing * 0.7, h * 0.55, t * 1.15]
                    }
                  />
                  <meshStandardMaterial color={MT_STONE_DARK} roughness={0.96} />
                </mesh>
                <mesh position={[0, h * 0.5 + 0.14, 0]} castShadow>
                  <boxGeometry
                    args={
                      axis === 'z'
                        ? [t * 1.2, 0.32, wing * 1.1]
                        : [wing * 1.1, 0.32, t * 1.2]
                    }
                  />
                  <meshStandardMaterial color={MT_GRASS} roughness={0.9} />
                </mesh>
              </>
            ) : (
              <mesh position={[0, h * 0.5 + 0.08, 0]} castShadow>
                <boxGeometry
                  args={
                    axis === 'z'
                      ? [t * 1.15, 0.14, wing * 1.05]
                      : [wing * 1.05, 0.14, t * 1.15]
                  }
                />
                <meshStandardMaterial color={GOLD} metalness={0.45} roughness={0.4} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

function LowCornerMarkers({ spec }: { spec: PerimeterSpec }) {
  const { cx, cz, riverInnerX, riverWidth } = spec
  const cornerX = riverInnerX + riverWidth * 0.45
  const mountain = isMountainTheme(spec)

  return (
    <group>
      {([-1, 1] as const).flatMap((sx) =>
        ([-1, 1] as const)
          .filter((sz) => {
            if (sz < 0 && isFrontClearSide(spec, 's')) return false
            if (sz > 0 && isFrontClearSide(spec, 'n')) return false
            if (sx < 0 && isFrontClearSide(spec, 'w')) return false
            if (sx > 0 && isFrontClearSide(spec, 'e')) return false
            return true
          })
          .map((sz) => {
            const cornerZ = riverInnerOnNS(spec, sz > 0 ? 'n' : 's') + riverWidth * 0.45
            return (
              <group key={`corner-${sx}-${sz}`} position={[cx + sx * cornerX, 0, cz + sz * cornerZ]}>
                {mountain ? (
                  <>
                    <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
                      <boxGeometry args={[1.4, 1.1, 1.4]} />
                      <meshStandardMaterial color={MT_STONE} roughness={0.95} />
                    </mesh>
                    <mesh position={[0.35, 1.15, -0.2]} castShadow>
                      <boxGeometry args={[0.8, 0.7, 0.75]} />
                      <meshStandardMaterial color={MT_STONE_LIGHT} roughness={0.94} />
                    </mesh>
                    <mesh position={[0, 1.35, 0]} castShadow>
                      <boxGeometry args={[1.2, 0.35, 1.2]} />
                      <meshStandardMaterial color={MT_GRASS} roughness={0.9} />
                    </mesh>
                    <mesh position={[-0.4, 0.85, 0.35]} castShadow>
                      <boxGeometry args={[0.45, 0.4, 0.45]} />
                      <meshStandardMaterial color={MT_MOSS} roughness={0.92} />
                    </mesh>
                  </>
                ) : (
                  <>
                    <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
                      <boxGeometry args={[1.1, 0.7, 1.1]} />
                      <meshStandardMaterial color={STONE} roughness={0.93} />
                    </mesh>
                    <mesh position={[0, 0.78, 0]} castShadow>
                      <boxGeometry args={[1.2, 0.12, 1.2]} />
                      <meshStandardMaterial color={GOLD_DIM} metalness={0.35} roughness={0.5} />
                    </mesh>
                    <mesh position={[-sx * 0.35, 0.45, 0]}>
                      <boxGeometry args={[0.1, 0.55, 0.55]} />
                      <meshStandardMaterial color={IVY} roughness={0.9} />
                    </mesh>
                  </>
                )}
              </group>
            )
          }),
      )}
    </group>
  )
}

function CornerWaterfalls({ spec }: { spec: PerimeterSpec }) {
  const { cx, cz, riverInnerX, riverInnerZS, riverWidth } = spec
  const mountain = isMountainTheme(spec)
  const fx = riverInnerX + riverWidth * 0.25
  const fz = riverInnerZS * (mountain ? 0.42 : 0.35)

  return (
    <group>
      {([-1, 1] as const).map((sx) => (
        <Waterfall
          key={`fall-${sx}`}
          position={[cx + sx * fx, 0, cz - fz]}
          height={mountain ? 2.4 : 1.6}
          faceX={-sx}
          faceZ={0.35}
          mountain={mountain}
        />
      ))}
    </group>
  )
}

function Waterfall({
  position,
  height,
  faceX,
  faceZ,
  mountain = false,
}: {
  position: [number, number, number]
  height: number
  faceX: number
  faceZ: number
  mountain?: boolean
}) {
  const yaw = Math.atan2(faceX, faceZ)
  const foam = mountain ? MT_WATER_FOAM : WATER_FOAM
  const mid = mountain ? MT_WATER : WATER
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {Array.from({ length: mountain ? 7 : 5 }, (_, i) => (
        <mesh
          key={i}
          position={[0, height * 0.35 - i * 0.15, 0.15 + i * 0.08]}
          castShadow={false}
        >
          <boxGeometry args={[1.1 - i * 0.08, height * 0.55 - i * 0.05, 0.12]} />
          <meshStandardMaterial
            color={foam}
            emissive={mid}
            emissiveIntensity={0.55 - i * 0.06}
            transparent
            opacity={0.45 - i * 0.05}
            roughness={0.15}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.15, 0.55]}>
        <boxGeometry args={[1.4, 0.2, 0.9]} />
        <meshStandardMaterial
          color={mid}
          emissive={foam}
          emissiveIntensity={0.4}
          transparent
          opacity={0.5}
        />
      </mesh>
      <pointLight position={[0, height * 0.4, 0.4]} color="#9fd4ef" intensity={0.9} distance={7} />
    </group>
  )
}

function CardinalFeatures({
  spec,
  locale,
}: {
  spec: PerimeterSpec
  locale: 'en' | 'ja'
}) {
  return (
    <group>
      {(['n', 's', 'e', 'w'] as const).map((side) => {
        const opening = getOpening(spec, side)
        if (!opening) return null
        if (opening.kind === 'bridge-gate') {
          // 手前クリア辺でもゲート（＋橋アプローチ）は可
          return <BridgeGateApproach key={side} spec={spec} side={side} />
        }
        // 手前クリア辺: 封印門・壁飾りも禁止（ゲート以外すべて不可）
        if (isFrontClearSide(spec, side)) return null
        return (
          <group key={side}>
            <BridgeGateApproach spec={spec} side={side} />
            <SealedPortal spec={spec} side={side} locale={locale} />
          </group>
        )
      })}
    </group>
  )
}

function BridgeGateApproach({
  spec,
  side,
}: {
  spec: PerimeterSpec
  side: CardinalSide
}) {
  const placement = getBridgePlacement(spec, side)
  if (!placement) return null

  const { x, z, rotationY, length } = placement
  const w = spec.bridgeDeckWidth
  const deckTop = 0.08
  const mountain = isMountainTheme(spec)
  const beam = mountain ? MT_WOOD : STONE_DARK
  const deck = mountain ? '#8a6a42' : '#7a7268'
  const plankA = mountain ? '#9a7a50' : '#8a8278'
  const plankB = mountain ? '#7a5a38' : '#6e675e'
  const rail = mountain ? MT_WOOD : GOLD

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      <mesh position={[0, -0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, 0.28, w * 0.98]} />
        <meshStandardMaterial color={beam} roughness={0.88} />
      </mesh>
      <mesh position={[0, deckTop - 0.04, 0]} castShadow receiveShadow>
        <boxGeometry args={[length * 0.98, 0.08, w * 0.92]} />
        <meshStandardMaterial color={deck} roughness={0.78} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const px = -length * 0.42 + i * (length * 0.16)
        return (
          <mesh key={i} position={[px, deckTop, 0]} receiveShadow>
            <boxGeometry args={[length * 0.14, 0.05, w * 0.85]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? plankA : plankB}
              roughness={0.88}
            />
          </mesh>
        )
      })}
      {([-1, 1] as const).map((sideSign) => (
        <group key={sideSign} position={[0, 0, sideSign * (w * 0.48)]}>
          <mesh position={[0, 0.72, 0]} castShadow>
            <boxGeometry args={[length * 0.96, 0.1, 0.1]} />
            <meshStandardMaterial
              color={rail}
              metalness={mountain ? 0.05 : 0.5}
              roughness={mountain ? 0.85 : 0.35}
            />
          </mesh>
          {[-0.35, -0.1, 0.15, 0.35].map((t) => (
            <mesh key={t} position={[t * length, 0.42, 0]} castShadow>
              <boxGeometry args={[0.1, 0.7, 0.1]} />
              <meshStandardMaterial color={mountain ? MT_STONE_DARK : STONE_DARK} roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}
      {([-1, 1] as const).map((end) =>
        ([-1, 1] as const).map((sideSign) =>
          mountain ? (
            <TorchLantern
              key={`${end}-${sideSign}`}
              position={[end * length * 0.42, 0, sideSign * (w * 0.42)]}
            />
          ) : (
            <BridgeLantern
              key={`${end}-${sideSign}`}
              position={[end * length * 0.42, 0, sideSign * (w * 0.42)]}
            />
          ),
        ),
      )}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[length * 0.7, 0.2, w * 0.7]} />
        <meshStandardMaterial
          color={mountain ? MT_WATER_DEEP : WATER_DEEP}
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function BridgeLantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 1.1, 8]} />
        <meshStandardMaterial color={STONE_DARK} roughness={0.85} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.38, 0.42, 0.38]} />
        <meshStandardMaterial
          color="#f0d090"
          emissive="#f0d090"
          emissiveIntensity={0.7}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 1.48, 0]}>
        <boxGeometry args={[0.42, 0.08, 0.42]} />
        <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.4} />
      </mesh>
      <pointLight position={[0, 1.2, 0]} color="#ffd9a0" intensity={0.75} distance={5} />
    </group>
  )
}

function TorchLantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.14, 1.1, 0.14]} />
        <meshStandardMaterial color={MT_WOOD} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.28, 0.35, 0.28]} />
        <meshStandardMaterial
          color="#ff9040"
          emissive="#ff6020"
          emissiveIntensity={1.1}
          roughness={0.4}
        />
      </mesh>
      <pointLight position={[0, 1.25, 0]} color="#ffb060" intensity={0.85} distance={6} />
    </group>
  )
}

function sealedGateCopy(side: CardinalSide, locale: 'en' | 'ja', mountain: boolean) {
  if (locale === 'ja') {
    if (side === 'e') return { label: mountain ? '東の峰' : '東の庭園', sub: '準備中' }
    if (side === 'w') return { label: mountain ? '西坑道' : '西の翼', sub: '準備中' }
    if (side === 'n') return { label: mountain ? '北の谷' : '北門', sub: '準備中' }
    return { label: mountain ? '坑道入口' : '南の回廊', sub: '準備中' }
  }
  if (side === 'e') return { label: mountain ? 'EAST PEAK' : 'EAST GARDEN', sub: 'Coming Soon' }
  if (side === 'w') return { label: mountain ? 'WEST MINE' : 'WEST WING', sub: 'Coming Soon' }
  if (side === 'n') return { label: mountain ? 'NORTH VALE' : 'NORTH GATE', sub: 'Coming Soon' }
  return { label: mountain ? 'MINE SHAFT' : 'SOUTH COURT', sub: 'Coming Soon' }
}

/**
 * 封印門 — 本ゲートと同じ壁開口ライン＋橋の先に置く。
 * 通過不可の閉じた門として、クラシック／山岳それぞれの本ゲート品質に揃える。
 */
function SealedPortal({
  spec,
  side,
  locale,
}: {
  spec: PerimeterSpec
  side: CardinalSide
  locale: 'en' | 'ja'
}) {
  const mountain = isMountainTheme(spec)
  const { x, z, rotationY } = getCardinalGatePlacement(spec, side)
  const { label, sub } = sealedGateCopy(side, locale, mountain)
  const halfW = spec.openingHalf

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {mountain ? (
        <MountainSealedGate halfW={halfW} label={label} sub={sub} />
      ) : (
        <ClassicSealedGate halfW={halfW} label={label} sub={sub} />
      )}
    </group>
  )
}

/** Plaza 系: 石柱＋金縁アーチ＋鉄の封印扉（PlazaReturnGate と同系） */
function ClassicSealedGate({
  halfW,
  label,
  sub,
}: {
  halfW: number
  label: string
  sub: string
}) {
  const pillarZ = halfW * 0.92
  return (
    <group>
      {/* 足元敷石 */}
      <mesh position={[0, 0.06, 0.55]} receiveShadow>
        <boxGeometry args={[halfW * 1.55, 0.12, 1.35]} />
        <meshStandardMaterial color={STONE_LIGHT} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.1, 0.55]} receiveShadow>
        <boxGeometry args={[halfW * 1.25, 0.06, 1.05]} />
        <meshStandardMaterial color="#7a7268" roughness={0.9} />
      </mesh>

      {[-pillarZ, pillarZ].map((pz) => (
        <group key={pz} position={[0, 0, pz]}>
          <mesh position={[0, 1.85, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.72, 3.7, 0.72]} />
            <meshStandardMaterial color="#3a3530" roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.12, 0.15]} castShadow>
            <boxGeometry args={[0.9, 0.24, 0.9]} />
            <meshStandardMaterial color={STONE} roughness={0.88} />
          </mesh>
          <mesh position={[0, 3.82, 0]} castShadow>
            <boxGeometry args={[0.9, 0.34, 0.9]} />
            <meshStandardMaterial color={GOLD} metalness={0.4} roughness={0.42} />
          </mesh>
          <mesh position={[0, 4.2, 0]} castShadow>
            <coneGeometry args={[0.24, 0.5, 8]} />
            <meshStandardMaterial color={GOLD} metalness={0.55} roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* アーチ梁 */}
      <mesh position={[0, 3.55, 0]} castShadow>
        <boxGeometry args={[0.58, 0.42, halfW * 2.1]} />
        <meshStandardMaterial color="#2a2520" roughness={0.75} />
      </mesh>
      <mesh position={[0, 3.88, 0]} castShadow>
        <boxGeometry args={[0.42, 0.18, halfW * 1.9]} />
        <meshStandardMaterial color={GOLD} metalness={0.42} roughness={0.4} />
      </mesh>

      {/* 封印された鉄扉 */}
      <mesh position={[0, 1.65, 0.08]} castShadow>
        <boxGeometry args={[0.18, 3.15, halfW * 1.55]} />
        <meshStandardMaterial color="#1e1a1c" metalness={0.72} roughness={0.32} />
      </mesh>
      {[-0.55, 0.55].map((oz) => (
        <mesh key={oz} position={[0.12, 1.65, oz]} castShadow>
          <boxGeometry args={[0.08, 2.9, halfW * 0.68]} />
          <meshStandardMaterial color="#2a2428" metalness={0.65} roughness={0.38} />
        </mesh>
      ))}
      {/* 横桟・鍵板 */}
      {[0.55, 1.35, 2.15, 2.85].map((y) => (
        <mesh key={y} position={[0.16, y, 0]} castShadow>
          <boxGeometry args={[0.1, 0.08, halfW * 1.5]} />
          <meshStandardMaterial color={GOLD_DIM} metalness={0.55} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.22, 1.7, 0]} castShadow>
        <boxGeometry args={[0.14, 0.55, 0.55]} />
        <meshStandardMaterial color={GOLD} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* 鎖 */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[0.28, 2.4, s * 0.35]} rotation={[0, 0, s * 0.35]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
          <meshStandardMaterial color="#8a7a50" metalness={0.7} roughness={0.35} />
        </mesh>
      ))}

      {/* ランタン */}
      {([-1, 1] as const).map((s) => (
        <group key={`lantern-${s}`} position={[0.85, 0, s * (halfW * 0.55)]}>
          <mesh position={[0, 1.15, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 2.2, 8]} />
            <meshStandardMaterial color={STONE_DARK} roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.35, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial
              color="#ffe2b0"
              emissive="#ffe2b0"
              emissiveIntensity={0.75}
              roughness={0.3}
            />
          </mesh>
          <pointLight position={[0, 2.35, 0]} color="#ffd9a0" intensity={0.65} distance={6} />
        </group>
      ))}

      {/* 看板 */}
      <group position={[0.55, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 4.55, 0]} castShadow>
          <boxGeometry args={[3.4, 0.95, 0.14]} />
          <meshStandardMaterial color="#1a1510" roughness={0.72} />
        </mesh>
        <mesh position={[0, 4.55, 0.09]}>
          <boxGeometry args={[3.15, 0.75, 0.04]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.12} roughness={0.5} />
        </mesh>
        <Text position={[0, 4.7, 0.14]} fontSize={0.24} color="#1a1208" anchorX="center" anchorY="middle">
          {label}
        </Text>
        <Text position={[0, 4.38, 0.14]} fontSize={0.15} color="#3a2a10" anchorX="center" anchorY="middle">
          {sub}
        </Text>
      </group>
    </group>
  )
}

/** Mountain 系: ボクセル岩塔＋板打ち封印（MountainPortalGate と同系） */
function MountainSealedGate({
  halfW,
  label,
  sub,
}: {
  halfW: number
  label: string
  sub: string
}) {
  const rockZ = halfW * 0.95
  return (
    <group>
      <mesh position={[0, 0.08, 0.5]} receiveShadow>
        <boxGeometry args={[halfW * 1.6, 0.16, 1.4]} />
        <meshStandardMaterial color={MT_DIRT} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.14, 0.5]} receiveShadow>
        <boxGeometry args={[halfW * 1.2, 0.08, 1.05]} />
        <meshStandardMaterial color="#5a6a48" roughness={0.92} />
      </mesh>

      {/* 左右の岩塔 */}
      {([-1, 1] as const).map((s) => (
        <group key={s} position={[0.15, 0, s * rockZ]}>
          <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.35, 2.2, 1.35]} />
            <meshStandardMaterial color={MT_STONE} roughness={0.95} />
          </mesh>
          <mesh position={[s * 0.15, 2.35, 0.1]} castShadow>
            <boxGeometry args={[1.1, 1.5, 1.1]} />
            <meshStandardMaterial color={MT_STONE_DARK} roughness={0.96} />
          </mesh>
          <mesh position={[0, 3.35, 0]} castShadow>
            <boxGeometry args={[0.85, 1.0, 0.85]} />
            <meshStandardMaterial color={MT_STONE_LIGHT} roughness={0.94} />
          </mesh>
          <mesh position={[0, 4.0, 0]} castShadow>
            <boxGeometry args={[0.55, 0.55, 0.55]} />
            <meshStandardMaterial color="#e8eef4" roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.25 + 0.05, 0]} castShadow>
            <boxGeometry args={[1.45, 0.28, 1.45]} />
            <meshStandardMaterial color={MT_GRASS} roughness={0.9} />
          </mesh>
          {/* 足元の小岩 */}
          <mesh position={[0.55, 0.35, s * 0.4]} castShadow>
            <boxGeometry args={[0.55, 0.7, 0.5]} />
            <meshStandardMaterial color={MT_STONE_DARK} roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* アーチ梁 */}
      <mesh position={[0, 3.45, 0]} castShadow>
        <boxGeometry args={[0.7, 0.55, halfW * 2.05]} />
        <meshStandardMaterial color={MT_STONE} roughness={0.94} />
      </mesh>
      <mesh position={[0, 3.85, 0]} castShadow>
        <boxGeometry args={[0.85, 0.35, halfW * 1.7]} />
        <meshStandardMaterial color={MT_GRASS} roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.15, 0]} castShadow>
        <boxGeometry args={[0.5, 0.35, halfW * 0.9]} />
        <meshStandardMaterial color="#d8e4ec" roughness={0.88} />
      </mesh>

      {/* 板打ち封印扉 */}
      <mesh position={[0, 1.55, 0.05]} castShadow>
        <boxGeometry args={[0.22, 3.0, halfW * 1.5]} />
        <meshStandardMaterial color={MT_WOOD} roughness={0.88} />
      </mesh>
      {[-0.7, -0.2, 0.3, 0.8].map((oz, i) => (
        <mesh key={oz} position={[0.14, 1.55, oz * halfW * 0.55]} castShadow>
          <boxGeometry args={[0.1, 2.85, 0.42]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#6a4a30' : '#5a3a28'} roughness={0.9} />
        </mesh>
      ))}
      {[0.7, 1.5, 2.3].map((y) => (
        <mesh key={y} position={[0.2, y, 0]} castShadow>
          <boxGeometry args={[0.12, 0.12, halfW * 1.45]} />
          <meshStandardMaterial color="#3a2a18" roughness={0.85} />
        </mesh>
      ))}
      {/* X 封鎖 */}
      <mesh position={[0.28, 1.7, 0]} rotation={[0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.14, halfW * 1.6]} />
        <meshStandardMaterial color="#2a2010" roughness={0.8} />
      </mesh>
      <mesh position={[0.28, 1.7, 0]} rotation={[-0.55, 0, 0]} castShadow>
        <boxGeometry args={[0.1, 0.14, halfW * 1.6]} />
        <meshStandardMaterial color="#2a2010" roughness={0.8} />
      </mesh>

      {/* 松明 */}
      {([-1, 1] as const).map((s) => (
        <group key={`torch-${s}`} position={[0.9, 0, s * (halfW * 0.5)]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <boxGeometry args={[0.12, 2.2, 0.12]} />
            <meshStandardMaterial color={MT_WOOD} roughness={0.9} />
          </mesh>
          <mesh position={[0, 2.4, 0]}>
            <boxGeometry args={[0.28, 0.35, 0.28]} />
            <meshStandardMaterial
              color="#ffb060"
              emissive="#ff9020"
              emissiveIntensity={0.9}
              roughness={0.4}
            />
          </mesh>
          <pointLight position={[0, 2.4, 0]} color="#ffb060" intensity={0.7} distance={5} />
        </group>
      ))}

      {/* 看板 */}
      <group position={[0.6, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 4.55, 0]} castShadow>
          <boxGeometry args={[3.2, 0.9, 0.14]} />
          <meshStandardMaterial color="#1a2018" roughness={0.75} />
        </mesh>
        <Text position={[0, 4.68, 0.12]} fontSize={0.22} color="#d8e8c8" anchorX="center" anchorY="middle">
          {label}
        </Text>
        <Text position={[0, 4.4, 0.12]} fontSize={0.14} color={MT_GRASS} anchorX="center" anchorY="middle">
          {sub}
        </Text>
      </group>
    </group>
  )
}

function WallLanterns({ spec }: { spec: PerimeterSpec }) {
  const { cx, cz, riverInnerZS } = spec
  const mountain = isMountainTheme(spec)
  const spots: Array<[number, number]> = []
  if (shouldBuildPerimeterSide(spec, 's')) {
    const lz = riverInnerZS - 1.1
    spots.push([cx + 7, cz - lz], [cx - 7, cz - lz])
  }

  return (
    <group>
      {spots.map(([x, z], index) =>
        mountain ? (
          <TorchLantern key={index} position={[x, 0, z]} />
        ) : (
          <group key={index} position={[x, 0, z]}>
            <mesh position={[0, 0.85, 0]} castShadow>
              <cylinderGeometry args={[0.06, 0.08, 1.7, 8]} />
              <meshStandardMaterial color={STONE_DARK} roughness={0.85} />
            </mesh>
            <mesh position={[0, 1.8, 0]}>
              <sphereGeometry args={[0.18, 12, 12]} />
              <meshStandardMaterial
                color="#ffe2b0"
                emissive="#ffe2b0"
                emissiveIntensity={0.85}
                roughness={0.3}
              />
            </mesh>
            <pointLight position={[0, 1.8, 0]} color="#ffd9a0" intensity={0.5} distance={7} />
          </group>
        ),
      )}
    </group>
  )
}
