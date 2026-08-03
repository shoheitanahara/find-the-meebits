import { Text } from '@react-three/drei'
import { useMemo } from 'react'
import type { ParkGateDef, ParkZoneLayout } from './parkZones'
import { VoxelBlockMat } from './VoxelBlockMat'
import {
  buildPerimeterSpec,
  getBridgePlacement,
  getCardinalGatePlacement,
  getOpening,
  isFrontClearSide,
  isPerimeterGateOpening,
  openCenterOnSide,
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

/** カルチャー（濃紺ギャラリー）パレット */
const CU_STONE = '#1a2a48'
const CU_STONE_DARK = '#0e1a30'
const CU_STONE_LIGHT = '#2a4068'
const CU_ACCENT = '#6a9ee8'
const CU_ACCENT_DIM = '#3a6aa8'
const CU_WATER = '#1a4a7a'
const CU_WATER_DEEP = '#0c2a48'
const CU_WATER_FOAM = '#6a9ec8'

/** シー（砂浜・海）パレット */
const SEA_SAND = '#d2b48c'
const SEA_SAND_DARK = '#b89868'
const SEA_SAND_WET = '#a89070'
const SEA_WOOD = '#8a6a48'
const SEA_WOOD_DARK = '#5a4030'
const SEA_WATER = '#1a7aaa'
const SEA_WATER_DEEP = '#0e4a6a'
const SEA_WATER_FOAM = '#a8d8e8'
const SEA_ACCENT = '#f0c878'

/** Astro（宇宙基地）パレット */
const AS_STONE = '#1a2234'
const AS_STONE_DARK = '#0e1422'
const AS_STONE_LIGHT = '#2a3448'
const AS_ACCENT = '#5ce0ff'
const AS_ACCENT_DIM = '#3a88b8'
const AS_WATER = '#1a3a68'
const AS_WATER_DEEP = '#0c2038'
const AS_WATER_FOAM = '#6ac8e8'
const AS_PURPLE = '#a878ff'

function isMountainTheme(spec: PerimeterSpec) {
  return spec.theme === 'mountain'
}

function isCultureTheme(spec: PerimeterSpec) {
  return spec.theme === 'culture'
}

function isSeaTheme(spec: PerimeterSpec) {
  return spec.theme === 'sea'
}

function isAstroTheme(spec: PerimeterSpec) {
  return spec.theme === 'astro'
}

/**
 * エリア外周: 崖・壁・川・滝・橋・封印門。
 * classic / mountain / culture / sea / astro
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
      {/* シーは広大な海＋砂浜を SeaDistrictGround が担う。ここは桟橋ゲートだけ */}
      {!isSeaTheme(spec) ? <RiverAndWalls spec={spec} /> : null}
      {!isSeaTheme(spec) ? <LowCornerMarkers spec={spec} /> : null}
      <CardinalFeatures spec={spec} locale={locale} />
      {!isSeaTheme(spec) ? <WallLanterns spec={spec} /> : null}
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
        // 本ゲート／封印門とも同じ along（奥＝北は FAR 左寄り／手前＝南はセンター）
        const openCenter = openCenterOnSide(spec, sideDef.side)

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
                  <RiverSegment
                    position={riverPos}
                    size={riverSize}
                    mountain={isMountainTheme(spec)}
                    culture={isCultureTheme(spec)}
                    sea={isSeaTheme(spec)}
                    astro={isAstroTheme(spec)}
                  />
                </group>
              )
            })}
            {wallSegments.map((seg, index) => {
              // シーエリア: 壁・砂丘は一切出さない（海と砂だけ）
              if (isSeaTheme(spec)) return null

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
                  culture={isCultureTheme(spec)}
                  astro={isAstroTheme(spec)}
                />
              )
            })}
            {isGateOpening && !isSeaTheme(spec) ? (
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
  culture = false,
  sea = false,
  astro = false,
}: {
  position: [number, number, number]
  size: [number, number, number]
  mountain?: boolean
  culture?: boolean
  sea?: boolean
  astro?: boolean
}) {
  const deep = mountain
    ? MT_WATER_DEEP
    : culture
      ? CU_WATER_DEEP
      : sea
        ? SEA_WATER_DEEP
        : astro
          ? AS_WATER_DEEP
          : WATER_DEEP
  const mid = mountain
    ? MT_WATER
    : culture
      ? CU_WATER
      : sea
        ? SEA_WATER
        : astro
          ? AS_WATER
          : WATER
  const foam = mountain
    ? MT_WATER_FOAM
    : culture
      ? CU_WATER_FOAM
      : sea
        ? SEA_WATER_FOAM
        : astro
          ? AS_WATER_FOAM
          : WATER_FOAM
  // 海は少し浅く・広く見せる（Y を下げて砂浜に溶ける感じ）
  const seaY = sea ? -0.12 : 0
  return (
    <group position={[position[0], position[1] + seaY, position[2]]}>
      <mesh receiveShadow>
        <boxGeometry args={sea ? [size[0], size[1] * 0.85, size[2]] : size} />
        <meshStandardMaterial
          color={deep}
          emissive={mid}
          emissiveIntensity={sea ? 0.48 : 0.35}
          metalness={sea ? 0.45 : 0.55}
          roughness={sea ? 0.22 : 0.18}
          transparent
          opacity={sea ? 0.88 : 0.92}
        />
      </mesh>
      <mesh position={[0, size[1] * (sea ? 0.36 : 0.42), 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[size[0] * 0.92, size[2] * 0.92]} />
        <meshStandardMaterial
          color={mid}
          emissive={foam}
          emissiveIntensity={sea ? 0.32 : 0.22}
          transparent
          opacity={sea ? 0.42 : 0.35}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
      {sea ? (
        <mesh position={[0, size[1] * 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[size[0] * 0.55, size[2] * 0.55]} />
          <meshStandardMaterial
            color="#3a9ec8"
            emissive={foam}
            emissiveIntensity={0.2}
            transparent
            opacity={0.28}
            roughness={0.08}
            metalness={0.5}
          />
        </mesh>
      ) : null}
    </group>
  )
}

function ClassicWall({
  position,
  size,
  axis,
  culture = false,
  astro = false,
}: {
  position: [number, number, number]
  size: [number, number, number]
  axis: 'x' | 'z'
  culture?: boolean
  astro?: boolean
}) {
  const [sx, sy, sz] = size
  const body = astro ? AS_STONE : culture ? CU_STONE : STONE
  const top = astro ? AS_STONE_DARK : culture ? CU_STONE_DARK : STONE_DARK
  const cap = astro ? AS_ACCENT : culture ? CU_ACCENT : GOLD
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[sx, sy, sz]} />
        <meshStandardMaterial
          color={body}
          roughness={astro ? 0.55 : 0.92}
          metalness={astro ? 0.55 : 0}
        />
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
        <meshStandardMaterial
          color={top}
          roughness={astro ? 0.48 : 0.94}
          metalness={astro ? 0.6 : 0}
        />
      </mesh>
      <mesh position={[0, sy * 0.5 + 0.78, 0]} castShadow>
        <boxGeometry
          args={[
            axis === 'z' ? sx * 1.18 : sx * 1.02,
            0.16,
            axis === 'z' ? sz * 1.02 : sz * 1.18,
          ]}
        />
        <meshStandardMaterial
          color={cap}
          emissive={cap}
          emissiveIntensity={astro ? 0.35 : 0}
          metalness={astro ? 0.7 : 0.42}
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}

/** 砂丘バンパー（壁の代わり） */
function BeachDune({
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
        <meshStandardMaterial color={SEA_SAND_DARK} roughness={0.96} />
      </mesh>
      <mesh position={[0, sy * 0.35, 0]} castShadow receiveShadow>
        <boxGeometry
          args={[
            axis === 'z' ? sx * 1.15 : sx * 0.95,
            sy * 0.55,
            axis === 'z' ? sz * 0.95 : sz * 1.15,
          ]}
        />
        <meshStandardMaterial color={SEA_SAND} roughness={0.94} />
      </mesh>
      <mesh position={[0, sy * 0.55, 0]} receiveShadow>
        <boxGeometry
          args={[
            axis === 'z' ? sx * 1.25 : sx * 0.85,
            0.18,
            axis === 'z' ? sz * 0.85 : sz * 1.25,
          ]}
        />
        <meshStandardMaterial color={SEA_SAND_WET} roughness={0.9} />
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
            <VoxelBlockMat
              kind={tier === tiers - 1 ? 'stone' : tier === 0 ? 'darkStone' : 'stone'}
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
        <VoxelBlockMat kind="grass" face="top" />
      </mesh>
      <mesh position={[0, sy * 0.5 - 0.05, 0]} receiveShadow>
        <boxGeometry
          args={[
            axis === 'z' ? sx * 0.98 : sx * 0.88,
            0.2,
            axis === 'z' ? sz * 0.88 : sz * 0.98,
          ]}
        />
        <VoxelBlockMat kind="dirt" />
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
  const culture = isCultureTheme(spec)
  const sea = isSeaTheme(spec)
  const astro = isAstroTheme(spec)
  const wing = mountain ? 1.55 : sea ? 1.4 : astro ? 1.25 : 1.15
  const h = mountain
    ? Math.min(spec.wallHeight * 0.85, 3.1)
    : sea
      ? Math.min(spec.wallHeight * 0.9, 1.05)
      : astro
        ? Math.min(spec.wallHeight * 0.65, 2.1)
        : Math.min(spec.wallHeight * 0.55, 1.55)
  const t = spec.wallThickness * (mountain ? 1.05 : sea ? 0.95 : astro ? 0.9 : 0.85)
  const edge = spec.wallOpeningHalf * 0.92
  const wingColor = sea
    ? SEA_SAND
    : culture
      ? CU_STONE_LIGHT
      : astro
        ? AS_STONE_LIGHT
        : STONE_LIGHT
  const capColor = sea ? SEA_WOOD : culture ? CU_ACCENT : astro ? AS_ACCENT : GOLD

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
              {mountain ? (
                <VoxelBlockMat kind="stone" />
              ) : (
                <meshStandardMaterial color={wingColor} roughness={0.9} />
              )}
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
                  <VoxelBlockMat kind="darkStone" />
                </mesh>
                <mesh position={[0, h * 0.5 + 0.14, 0]} castShadow>
                  <boxGeometry
                    args={
                      axis === 'z'
                        ? [t * 1.2, 0.32, wing * 1.1]
                        : [wing * 1.1, 0.32, t * 1.2]
                    }
                  />
                  <VoxelBlockMat kind="grass" face="top" />
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
                <meshStandardMaterial color={capColor} metalness={sea ? 0.05 : 0.45} roughness={0.5} />
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

function BeachCornerMarkers({ spec }: { spec: PerimeterSpec }) {
  const { cx, cz, riverInnerX, riverWidth } = spec
  const cornerX = riverInnerX + riverWidth * 0.45
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
              <group key={`beach-corner-${sx}-${sz}`} position={[cx + sx * cornerX, 0, cz + sz * cornerZ]}>
                <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
                  <boxGeometry args={[1.6, 0.7, 1.6]} />
                  <meshStandardMaterial color={SEA_SAND_DARK} roughness={0.96} />
                </mesh>
                <mesh position={[0.25, 0.75, -0.15]} castShadow>
                  <boxGeometry args={[0.9, 0.45, 0.85]} />
                  <meshStandardMaterial color={SEA_SAND} roughness={0.94} />
                </mesh>
                <mesh position={[-0.35, 1.1, 0.3]} castShadow>
                  <cylinderGeometry args={[0.08, 0.12, 1.8, 8]} />
                  <meshStandardMaterial color={SEA_WOOD} roughness={0.85} />
                </mesh>
                <mesh position={[-0.35, 2.05, 0.3]} castShadow>
                  <sphereGeometry args={[0.35, 8, 8]} />
                  <meshStandardMaterial color="#3d7a48" roughness={0.88} />
                </mesh>
              </group>
            )
          }),
      )}
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
        // シー: 封印門も橋も出さない（海が続くだけ）
        if (isSeaTheme(spec)) return null
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
  const culture = isCultureTheme(spec)
  const sea = isSeaTheme(spec)
  const astro = isAstroTheme(spec)
  const beam = mountain
    ? MT_WOOD
    : culture
      ? CU_STONE_DARK
      : sea
        ? SEA_WOOD_DARK
        : astro
          ? AS_STONE_DARK
          : STONE_DARK
  const deck = mountain
    ? '#8a6a42'
    : culture
      ? '#1e3050'
      : sea
        ? '#9a7a55'
        : astro
          ? '#243048'
          : '#7a7268'
  const plankA = mountain
    ? '#9a7a50'
    : culture
      ? '#2a4068'
      : sea
        ? '#b89060'
        : astro
          ? '#2e3a52'
          : '#8a8278'
  const plankB = mountain
    ? '#7a5a38'
    : culture
      ? '#162848'
      : sea
        ? '#8a6848'
        : astro
          ? '#1a2234'
          : '#6e675e'
  const rail = mountain
    ? MT_WOOD
    : culture
      ? CU_ACCENT
      : sea
        ? SEA_WOOD
        : astro
          ? AS_ACCENT
          : GOLD
  const post = mountain
    ? MT_STONE_DARK
    : culture
      ? CU_STONE
      : sea
        ? SEA_WOOD_DARK
        : astro
          ? AS_STONE
          : STONE_DARK
  const under = mountain
    ? MT_WATER_DEEP
    : culture
      ? CU_WATER_DEEP
      : sea
        ? SEA_WATER_DEEP
        : astro
          ? AS_WATER_DEEP
          : WATER_DEEP

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
              metalness={mountain || sea ? 0.05 : 0.5}
              roughness={mountain || sea ? 0.85 : 0.35}
            />
          </mesh>
          {[-0.35, -0.1, 0.15, 0.35].map((t) => (
            <mesh key={t} position={[t * length, 0.42, 0]} castShadow>
              <boxGeometry args={[0.1, 0.7, 0.1]} />
              <meshStandardMaterial color={post} roughness={0.85} />
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
          ) : sea ? (
            <PierLantern
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
          color={under}
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

/** 桟橋用：木ポール＋暖色キューブランタン */
function PierLantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 1.1, 8]} />
        <meshStandardMaterial color={SEA_WOOD_DARK} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.18, 0]} castShadow>
        <boxGeometry args={[0.32, 0.38, 0.32]} />
        <meshStandardMaterial
          color="#fff2c8"
          emissive="#ffb040"
          emissiveIntensity={0.95}
          roughness={0.35}
          transparent
          opacity={0.92}
        />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <boxGeometry args={[0.36, 0.06, 0.36]} />
        <meshStandardMaterial color={SEA_WOOD} roughness={0.88} />
      </mesh>
      <pointLight position={[0, 1.18, 0]} color="#ffb060" intensity={0.9} distance={5.5} />
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

function sealedGateCopy(
  side: CardinalSide,
  locale: 'en' | 'ja',
  mountain: boolean,
  culture = false,
  sea = false,
  astro = false,
) {
  if (locale === 'ja') {
    if (side === 'e') {
      return {
        label: mountain
          ? '東の峰'
          : culture
            ? '東ギャラリー'
            : sea
              ? '東桟橋'
              : astro
                ? '東ドッキング'
                : '東の庭園',
        sub: '準備中',
      }
    }
    if (side === 'w') {
      return {
        label: mountain
          ? '西坑道'
          : culture
            ? '西アトリエ'
            : sea
              ? '西の入り江'
              : astro
                ? '西ベイ'
                : '西の翼',
        sub: '準備中',
      }
    }
    if (side === 'n') {
      return {
        label: mountain
          ? '北の谷'
          : culture
            ? '北フォワイエ'
            : sea
              ? '北ビーチ'
              : astro
                ? '北エアロック'
                : '北門',
        sub: '準備中',
      }
    }
    return {
      label: mountain
        ? '坑道入口'
        : culture
          ? '南サロン'
          : sea
            ? '南ラグーン'
            : astro
              ? '南ハッチ'
              : '南の回廊',
      sub: '準備中',
    }
  }
  if (side === 'e') {
    return {
      label: mountain
        ? 'EAST PEAK'
        : culture
          ? 'EAST GALLERY'
          : sea
            ? 'EAST PIER'
            : astro
              ? 'EAST DOCK'
              : 'EAST GARDEN',
      sub: 'Coming Soon',
    }
  }
  if (side === 'w') {
    return {
      label: mountain
        ? 'WEST MINE'
        : culture
          ? 'WEST ATELIER'
          : sea
            ? 'WEST COVE'
            : astro
              ? 'WEST BAY'
              : 'WEST WING',
      sub: 'Coming Soon',
    }
  }
  if (side === 'n') {
    return {
      label: mountain
        ? 'NORTH VALE'
        : culture
          ? 'NORTH FOYER'
          : sea
            ? 'NORTH BEACH'
            : astro
              ? 'NORTH AIRLOCK'
              : 'NORTH GATE',
      sub: 'Coming Soon',
    }
  }
  return {
    label: mountain
      ? 'MINE SHAFT'
      : culture
        ? 'SOUTH SALON'
        : sea
          ? 'SOUTH LAGOON'
          : astro
            ? 'SOUTH HATCH'
            : 'SOUTH COURT',
    sub: 'Coming Soon',
  }
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
  const culture = isCultureTheme(spec)
  const sea = isSeaTheme(spec)
  const astro = isAstroTheme(spec)
  const { x, z, rotationY } = getCardinalGatePlacement(spec, side)
  const { label, sub } = sealedGateCopy(side, locale, mountain, culture, sea, astro)
  const halfW = spec.openingHalf

  return (
    <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
      {mountain ? (
        <MountainSealedGate halfW={halfW} label={label} sub={sub} />
      ) : sea ? (
        <BeachSealedGate halfW={halfW} label={label} sub={sub} />
      ) : (
        <ClassicSealedGate halfW={halfW} label={label} sub={sub} culture={culture} astro={astro} />
      )}
    </group>
  )
}

/** シー封印：木の桟橋門＋閉じた板戸 */
function BeachSealedGate({
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
      <mesh position={[0, 0.06, 0.55]} receiveShadow>
        <boxGeometry args={[halfW * 1.55, 0.12, 1.35]} />
        <meshStandardMaterial color={SEA_SAND} roughness={0.92} />
      </mesh>
      {[-pillarZ, pillarZ].map((pz) => (
        <group key={pz} position={[0, 0, pz]}>
          <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.55, 3.1, 0.55]} />
            <meshStandardMaterial color={SEA_WOOD_DARK} roughness={0.85} />
          </mesh>
          <mesh position={[0, 3.25, 0]} castShadow>
            <boxGeometry args={[0.7, 0.28, 0.7]} />
            <meshStandardMaterial color={SEA_WOOD} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.15, 0]} castShadow>
        <boxGeometry args={[0.4, 0.28, halfW * 2.05]} />
        <meshStandardMaterial color={SEA_WOOD} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.5, 0.08]} castShadow>
        <boxGeometry args={[0.16, 2.85, halfW * 1.5]} />
        <meshStandardMaterial color="#3a2a20" roughness={0.75} />
      </mesh>
      <group position={[0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <Text position={[0, 4.0, 0]} fontSize={0.22} color="#f5e6c8" anchorX="center" anchorY="middle">
          {label}
        </Text>
        <Text position={[0, 3.7, 0]} fontSize={0.14} color={SEA_ACCENT} anchorX="center" anchorY="middle">
          {sub}
        </Text>
      </group>
    </group>
  )
}

/** Plaza 系: 石柱＋金縁アーチ＋鉄の封印扉（PlazaReturnGate と同系） */
function ClassicSealedGate({
  halfW,
  label,
  sub,
  culture = false,
  astro = false,
}: {
  halfW: number
  label: string
  sub: string
  culture?: boolean
  astro?: boolean
}) {
  const pillarZ = halfW * 0.92
  const pillar = astro ? AS_STONE_DARK : culture ? CU_STONE_DARK : '#3a3530'
  const base = astro ? AS_STONE_LIGHT : culture ? CU_STONE_LIGHT : STONE_LIGHT
  const step = astro ? '#121824' : culture ? '#1a2844' : '#7a7268'
  const accent = astro ? AS_ACCENT : culture ? CU_ACCENT : GOLD
  const accentDim = astro ? AS_ACCENT_DIM : culture ? CU_ACCENT_DIM : GOLD_DIM
  const arch = astro ? '#0a101c' : culture ? '#0c1528' : '#2a2520'
  const door = astro ? '#080c16' : culture ? '#0a1424' : '#1e1a1c'
  const doorPanel = astro ? '#141c2c' : culture ? '#152038' : '#2a2428'
  return (
    <group>
      {/* 足元敷石 */}
      <mesh position={[0, 0.06, 0.55]} receiveShadow>
        <boxGeometry args={[halfW * 1.55, 0.12, 1.35]} />
        <meshStandardMaterial color={base} roughness={0.86} />
      </mesh>
      <mesh position={[0, 0.1, 0.55]} receiveShadow>
        <boxGeometry args={[halfW * 1.25, 0.06, 1.05]} />
        <meshStandardMaterial color={step} roughness={0.9} />
      </mesh>

      {[-pillarZ, pillarZ].map((pz) => (
        <group key={pz} position={[0, 0, pz]}>
          <mesh position={[0, 1.85, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.72, 3.7, 0.72]} />
            <meshStandardMaterial color={pillar} roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.12, 0.15]} castShadow>
            <boxGeometry args={[0.9, 0.24, 0.9]} />
            <meshStandardMaterial color={culture ? CU_STONE : STONE} roughness={0.88} />
          </mesh>
          <mesh position={[0, 3.82, 0]} castShadow>
            <boxGeometry args={[0.9, 0.34, 0.9]} />
            <meshStandardMaterial color={accent} metalness={0.4} roughness={0.42} />
          </mesh>
          <mesh position={[0, 4.2, 0]} castShadow>
            <coneGeometry args={[0.24, 0.5, 8]} />
            <meshStandardMaterial color={accent} metalness={0.55} roughness={0.35} />
          </mesh>
        </group>
      ))}

      {/* アーチ梁 */}
      <mesh position={[0, 3.55, 0]} castShadow>
        <boxGeometry args={[0.58, 0.42, halfW * 2.1]} />
        <meshStandardMaterial color={arch} roughness={0.75} />
      </mesh>
      <mesh position={[0, 3.88, 0]} castShadow>
        <boxGeometry args={[0.42, 0.18, halfW * 1.9]} />
        <meshStandardMaterial color={accent} metalness={0.42} roughness={0.4} />
      </mesh>

      {/* 封印された鉄扉 */}
      <mesh position={[0, 1.65, 0.08]} castShadow>
        <boxGeometry args={[0.18, 3.15, halfW * 1.55]} />
        <meshStandardMaterial color={door} metalness={0.72} roughness={0.32} />
      </mesh>
      {[-0.55, 0.55].map((oz) => (
        <mesh key={oz} position={[0.12, 1.65, oz]} castShadow>
          <boxGeometry args={[0.08, 2.9, halfW * 0.68]} />
          <meshStandardMaterial color={doorPanel} metalness={0.65} roughness={0.38} />
        </mesh>
      ))}
      {/* 横桟・鍵板 */}
      {[0.55, 1.35, 2.15, 2.85].map((y) => (
        <mesh key={y} position={[0.16, y, 0]} castShadow>
          <boxGeometry args={[0.1, 0.08, halfW * 1.5]} />
          <meshStandardMaterial color={accentDim} metalness={0.55} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.22, 1.7, 0]} castShadow>
        <boxGeometry args={[0.14, 0.55, 0.55]} />
        <meshStandardMaterial color={accent} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* 鎖 */}
      {([-1, 1] as const).map((s) => (
        <mesh key={s} position={[0.28, 2.4, s * 0.35]} rotation={[0, 0, s * 0.35]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
          <meshStandardMaterial
            color={culture ? '#5a7aa0' : '#8a7a50'}
            metalness={0.7}
            roughness={0.35}
          />
        </mesh>
      ))}

      {/* ランタン */}
      {([-1, 1] as const).map((s) => (
        <group key={`lantern-${s}`} position={[0.85, 0, s * (halfW * 0.55)]}>
          <mesh position={[0, 1.15, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 2.2, 8]} />
            <meshStandardMaterial color={culture ? CU_STONE_DARK : STONE_DARK} roughness={0.85} />
          </mesh>
          <mesh position={[0, 2.35, 0]}>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial
              color={culture ? '#c8e0ff' : '#ffe2b0'}
              emissive={culture ? '#8eb4e8' : '#ffe2b0'}
              emissiveIntensity={0.75}
              roughness={0.3}
            />
          </mesh>
          <pointLight
            position={[0, 2.35, 0]}
            color={culture ? '#a8c8f0' : '#ffd9a0'}
            intensity={0.65}
            distance={6}
          />
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
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.12} roughness={0.5} />
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
        <VoxelBlockMat kind="dirt" />
      </mesh>
      <mesh position={[0, 0.14, 0.5]} receiveShadow>
        <boxGeometry args={[halfW * 1.2, 0.08, 1.05]} />
        <VoxelBlockMat kind="grass" face="top" />
      </mesh>

      {/* 左右の岩塔 */}
      {([-1, 1] as const).map((s) => (
        <group key={s} position={[0.15, 0, s * rockZ]}>
          <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.35, 2.2, 1.35]} />
            <VoxelBlockMat kind="stone" />
          </mesh>
          <mesh position={[s * 0.15, 2.35, 0.1]} castShadow>
            <boxGeometry args={[1.1, 1.5, 1.1]} />
            <VoxelBlockMat kind="darkStone" />
          </mesh>
          <mesh position={[0, 3.35, 0]} castShadow>
            <boxGeometry args={[0.85, 1.0, 0.85]} />
            <VoxelBlockMat kind="stone" />
          </mesh>
          <mesh position={[0, 4.0, 0]} castShadow>
            <boxGeometry args={[0.55, 0.55, 0.55]} />
            <VoxelBlockMat kind="snow" />
          </mesh>
          <mesh position={[0, 2.25 + 0.05, 0]} castShadow>
            <boxGeometry args={[1.45, 0.28, 1.45]} />
            <VoxelBlockMat kind="grass" face="top" />
          </mesh>
          {/* 足元の小岩 */}
          <mesh position={[0.55, 0.35, s * 0.4]} castShadow>
            <boxGeometry args={[0.55, 0.7, 0.5]} />
            <VoxelBlockMat kind="darkStone" />
          </mesh>
        </group>
      ))}

      {/* アーチ梁 */}
      <mesh position={[0, 3.45, 0]} castShadow>
        <boxGeometry args={[0.7, 0.55, halfW * 2.05]} />
        <VoxelBlockMat kind="stone" />
      </mesh>
      <mesh position={[0, 3.85, 0]} castShadow>
        <boxGeometry args={[0.85, 0.35, halfW * 1.7]} />
        <VoxelBlockMat kind="grass" face="top" />
      </mesh>
      <mesh position={[0, 4.15, 0]} castShadow>
        <boxGeometry args={[0.5, 0.35, halfW * 0.9]} />
        <VoxelBlockMat kind="snow" />
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
