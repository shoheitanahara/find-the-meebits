/**
 * パーク外側の背景（グラデ空・地続きの大地・壁外すぐ近くを囲む森シルエット）。
 * すべて InstancedMesh（影なし・アニメなし）で 4 ドローコールに抑え、
 * 密度を上げても軽く保つ。
 */
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import {
  BackSide,
  Color,
  InstancedMesh,
  Object3D,
  Path,
  Shape,
  ShapeGeometry,
} from 'three'
import type { ParkLook } from './parkLook'
import {
  buildPerimeterSpec,
  getBridgePlacement,
  type CardinalSide,
  type ParkPerimeterDef,
  type PerimeterSpec,
} from './parkPerimeterSpec'
import type { ParkTimeOfDay } from './parkTimeOfDay'
import type { ParkGateDef, ParkZoneId, ParkZoneLayout } from './parkZones'

const scratch = new Object3D()
const scratchColor = new Color()

/** 空ドームの高さグラデーション（地平線=fogColor、天頂=backgroundColor） */
const SKY_VERTEX_SHADER = /* glsl */ `
  varying float vHeight;
  void main() {
    vHeight = normalize(position).y;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const SKY_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uHorizon;
  uniform vec3 uZenith;
  varying float vHeight;
  void main() {
    float t = smoothstep(-0.08, 0.48, vHeight);
    gl_FragColor = vec4(mix(uHorizon, uZenith, t), 1.0);
  }
`

type BackdropTheme = {
  ground: string
  /** 冬（11–12月）の雪を帯びた外周大地 */
  winterGround: string
  scenery: 'mixedForest' | 'pineForest' | 'quietForest' | 'plumForest' | 'craterRocks' | 'seaIslets'
  trunk: string
  /** 明るい〜暗い葉色のグラデーション（同一樹冠内でずらし配置と合わせて立体感を出す） */
  foliage: readonly string[]
  /** 橋デッキ色（接続部を橋から滑らかに馴染ませる） */
  bridgeColor: string
  /** 橋の先に続く道の石畳2色と縁石色 */
  roadA: string
  roadB: string
  roadCurb: string
}

const THEME_BY_ZONE: Record<ParkZoneId, BackdropTheme> = {
  plaza: {
    ground: '#212b22',
    winterGround: '#7a8a98',
    scenery: 'mixedForest',
    trunk: '#4a3525',
    foliage: ['#1d3b24', '#264b2d', '#2f5935', '#39663d'],
    bridgeColor: '#a8927c',
    roadA: '#645c60',
    roadB: '#5c5458',
    roadCurb: '#a68c54',
  },
  mountain: {
    ground: '#263125',
    winterGround: '#8696a6',
    scenery: 'pineForest',
    trunk: '#483424',
    foliage: ['#183923', '#20492b', '#275734', '#2e643b'],
    bridgeColor: '#8c6f4b',
    roadA: '#6c5a44',
    roadB: '#63523d',
    roadCurb: '#4b453e',
  },
  culture: {
    ground: '#162030',
    winterGround: '#54667c',
    scenery: 'quietForest',
    trunk: '#383036',
    foliage: ['#162c30', '#1d383c', '#244548', '#2b5052'],
    bridgeColor: '#3a5480',
    roadA: '#2a3d5f',
    roadB: '#263756',
    roadCurb: '#5c82b8',
  },
  musicArt: {
    ground: '#161120',
    winterGround: '#4a4a62',
    scenery: 'plumForest',
    trunk: '#322634',
    foliage: ['#1c2624', '#232e2e', '#2a243a', '#303634'],
    bridgeColor: '#48305a',
    roadA: '#352242',
    roadB: '#2f1e3b',
    roadCurb: '#7a458e',
  },
  astro: {
    ground: '#111520',
    winterGround: '#3e4c62',
    scenery: 'craterRocks',
    trunk: '#1a2030',
    foliage: ['#181e2e', '#222a3e', '#2a344c'],
    bridgeColor: '#36435a',
    roadA: '#2b364a',
    roadB: '#263042',
    roadCurb: '#4b86b4',
  },
  sea: {
    ground: '#081420',
    winterGround: '#081420',
    scenery: 'seaIslets',
    trunk: '#2a2e36',
    foliage: ['#20302c', '#2a3c35', '#1c2824'],
    bridgeColor: '#7a5a3e',
    roadA: '#6e523a',
    roadB: '#654a34',
    roadCurb: '#3f2e20',
  },
}

function hash2(a: number, b: number) {
  const n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
  return n - Math.floor(n)
}

function tintOuterGround(hex: string, timeOfDay: ParkTimeOfDay): string {
  const base = new Color(hex)
  if (timeOfDay === 'noon') return `#${base.clone().lerp(new Color('#4a5e44'), 0.25).getHexString()}`
  if (timeOfDay === 'morning') return `#${base.clone().lerp(new Color('#3a4858'), 0.25).getHexString()}`
  if (timeOfDay === 'evening') return `#${base.clone().lerp(new Color('#2c1d18'), 0.35).getHexString()}`
  return `#${base.clone().lerp(new Color('#080d14'), 0.38).getHexString()}`
}

export function ParkBackdrop({
  zoneId,
  layout,
  perimeter,
  gates,
  look,
  timeOfDay,
}: {
  zoneId: ParkZoneId
  layout: ParkZoneLayout
  perimeter?: ParkPerimeterDef
  gates: ParkGateDef[]
  look: ParkLook
  timeOfDay: ParkTimeOfDay
}) {
  const spec = useMemo(
    () => (perimeter ? buildPerimeterSpec(layout, perimeter, gates) : null),
    [layout, perimeter, gates],
  )
  const theme = THEME_BY_ZONE[zoneId]
  const skyRadius = zoneId === 'sea' ? 235 : 108

  return (
    <group>
      <ParkSkyDome
        radius={skyRadius}
        horizonColor={look.fogColor}
        zenithColor={look.backgroundColor}
      />
      {zoneId !== 'sea' ? (
        <OuterGround
          layout={layout}
          spec={spec}
          color={tintOuterGround(look.christmas ? theme.winterGround : theme.ground, timeOfDay)}
        />
      ) : null}
      <OuterScenery
        layout={layout}
        spec={spec}
        theme={theme}
        christmas={look.christmas && zoneId !== 'sea'}
      />
    </group>
  )
}

function ParkSkyDome({
  radius,
  horizonColor,
  zenithColor,
}: {
  radius: number
  horizonColor: string
  zenithColor: string
}) {
  const uniforms = useMemo(
    () => ({
      uHorizon: { value: new Color(horizonColor) },
      uZenith: { value: new Color(zenithColor) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  useEffect(() => {
    uniforms.uHorizon.value.set(horizonColor)
    uniforms.uZenith.value.set(zenithColor)
  }, [horizonColor, zenithColor, uniforms])

  return (
    <mesh frustumCulled={false}>
      <sphereGeometry args={[radius, 24, 14]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={SKY_VERTEX_SHADER}
        fragmentShader={SKY_FRAGMENT_SHADER}
        side={BackSide}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  )
}

/**
 * 壁の外から地平線まで広がる大地（1メッシュ・川の部分だけくり抜く）。
 * rotateX(-PI/2) で 2D (x, y) が 3D (x, 0, -y) になるため、Z は符号反転して穴を定義する。
 */
function OuterGround({
  layout,
  spec,
  color,
}: {
  layout: ParkZoneLayout
  spec: PerimeterSpec | null
  color: string
}) {
  const geometry = useMemo(() => {
    const outerRadius = 112
    const shape = new Shape()
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false)

    // 川の外縁〜壁の真下でくり抜くので、壁のすぐ外側からアバターと同じ地面高さが続く
    const halfX = spec
      ? spec.riverInnerX + spec.riverWidth + spec.wallThickness * 0.5
      : layout.districtHalfX
    const backZ = spec
      ? layout.groundZ - (spec.riverInnerZS + spec.riverWidth + spec.wallThickness * 0.5)
      : layout.groundZ - layout.districtHalfZ
    const frontZ = layout.groundZ + layout.districtHalfZ

    const hole = new Path()
    hole.moveTo(-halfX, -frontZ)
    hole.lineTo(halfX, -frontZ)
    hole.lineTo(halfX, -backZ)
    hole.lineTo(-halfX, -backZ)
    hole.closePath()
    shape.holes.push(hole)

    const geo = new ShapeGeometry(shape, 12)
    geo.rotateX(-Math.PI / 2)
    return geo
  }, [layout, spec])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh position={[0, GROUND_BASE_Y, 0]} geometry={geometry}>
      <meshStandardMaterial color={color} roughness={0.98} metalness={0} />
    </mesh>
  )
}

type BoxInstance = {
  x: number
  y: number
  z: number
  sx: number
  sy: number
  sz: number
  color: string
}

/** アバターの歩く地面と同じ高さ（z-fighting を避けて +0.0 の床に揃える） */
const GROUND_BASE_Y = 0

type GateRoadSpec = {
  startX: number
  startZ: number
  dirX: number
  dirZ: number
  /** カーブ方向の符号（画面中央側へ寄らず外側へ自然に逃がす） */
  curveSign: number
  side: CardinalSide
}

/** 橋の外端から始まる道のスペックを列挙（封印門は行き止まりなので対象外） */
function getGateRoadSpecs(spec: PerimeterSpec | null): GateRoadSpec[] {
  if (!spec) return []
  const roads: GateRoadSpec[] = []
  for (const opening of spec.openings) {
    if (opening.kind !== 'bridge-gate') continue
    const placement = getBridgePlacement(spec, opening.side)
    if (!placement) continue
    const halfLen = placement.length * 0.5
    if (opening.side === 'e') {
      roads.push({
        startX: placement.x + halfLen,
        startZ: placement.z,
        dirX: 1,
        dirZ: 0,
        curveSign: -1,
        side: 'e',
      })
    } else if (opening.side === 'w') {
      roads.push({
        startX: placement.x - halfLen,
        startZ: placement.z,
        dirX: -1,
        dirZ: 0,
        curveSign: -1,
        side: 'w',
      })
    } else if (opening.side === 's') {
      roads.push({
        startX: placement.x,
        startZ: placement.z - halfLen,
        dirX: 0,
        dirZ: -1,
        // 左寄り北門からそのままさらに少し左奥へ曲がる
        curveSign: -1,
        side: 's',
      })
    } else if (opening.side === 'n') {
      roads.push({
        startX: placement.x,
        startZ: placement.z + halfLen,
        dirX: 0,
        dirZ: 1,
        curveSign: 1,
        side: 'n',
      })
    }
  }
  return roads
}

/** 道沿い距離 d(m) における緩やかなカーブの横ずれ */
function gateRoadLateralOffset(road: GateRoadSpec, d: number) {
  if (d <= 6.0) return 0
  const t = Math.min(1, (d - 6.0) / 22)
  return road.curveSign * t * t * 3.8
}

/** 道の延長線・カーブに沿って木を置かない判定 */
function isOnGateRoad(x: number, z: number, roads: GateRoadSpec[]) {
  for (const road of roads) {
    const dx = x - road.startX
    const dz = z - road.startZ
    // 進行方向距離 d、横方向距離 perp
    const d = dx * road.dirX + dz * road.dirZ
    if (d < -1.5 || d > 28) continue
    const curve = gateRoadLateralOffset(road, Math.max(0, d))
    // 進行方向に対し左／右の法線
    const perpX = -road.dirZ
    const perpZ = road.dirX
    const lateral = dx * perpX + dz * perpZ - curve
    if (Math.abs(lateral) < 3.1) return true
  }
  return false
}

/**
 * 橋の先へ森（または海）の奥まで続く道／桟橋を組み立てる。
 * 橋のデッキ面（y=0.16・幅3.84）の真下から隙間なくつなぎ、なだらかに地面へ降ろす。
 */
function pushGateRoads(
  roadsOut: BoxInstance[],
  roadSpecs: GateRoadSpec[],
  theme: BackdropTheme,
) {
  const isSea = theme.scenery === 'seaIslets'
  const step = 0.85
  const totalLen = isSea ? 22 : 26

  for (const road of roadSpecs) {
    const perpX = -road.dirZ
    const perpZ = road.dirX
    const alongX = Math.abs(road.dirX) > 0.5
    let segIdx = 0

    // 橋のデッキ端の内側（-0.45m）から重ねて開始し、隙間をゼロにする
    for (let d = -0.45; d <= totalLen; d += step) {
      const lat = isSea ? 0 : gateRoadLateralOffset(road, Math.max(0, d))
      const cx = road.startX + road.dirX * d + perpX * lat
      const cz = road.startZ + road.dirZ * d + perpZ * lat

      if (isSea) {
        // 海へ伸びる木製桟橋（橋デッキに連続させる）
        const fade = Math.max(0, (d - 14) / (totalLen - 14))
        if (fade > 0.65 && segIdx % 2 === 1) {
          segIdx += 1
          continue
        }
        roadsOut.push({
          x: cx,
          y: 0.08,
          z: cz,
          sx: alongX ? step * 0.96 : 3.7 * (1 - fade * 0.25),
          sy: 0.16,
          sz: alongX ? 3.7 * (1 - fade * 0.25) : step * 0.96,
          color: segIdx % 2 === 0 ? theme.roadA : theme.roadB,
        })
        if (segIdx % 3 === 0 && fade < 0.7) {
          for (const side of [-1, 1] as const) {
            roadsOut.push({
              x: cx + perpX * side * 1.75,
              y: -0.08,
              z: cz + perpZ * side * 1.75,
              sx: 0.18,
              sy: 0.9,
              sz: 0.18,
              color: theme.roadCurb,
            })
          }
        }
        segIdx += 1
        continue
      }

      // 最初の 4.5m で橋面(y=0.16)から舗装面(y=0.05)へ滑らかに下ろす
      const rampT = Math.min(1, Math.max(0, d / 4.5))
      const surfaceY = 0.155 - rampT * 0.105
      const fade = Math.max(0, (d - 16) / (totalLen - 16))
      const roadW = 3.82 - rampT * 0.42 - fade * 0.65
      // 隣接タイルを少し重ねて(1.1x)横縞の隙間を消す
      const tileLen = step * (fade > 0.35 ? 0.92 - fade * 0.25 : 1.1)

      if (fade > 0.62 && segIdx % 2 === 1) {
        segIdx += 1
        continue
      }

      // 最初の 5m は橋デッキの色から外道の色へ段階的に馴染ませ、境界の色段差をなくす
      const baseColor = segIdx % 2 === 0 ? theme.roadA : theme.roadB
      const colorBlend = Math.min(1, Math.max(0, (d - 0.3) / 5.2))
      const tileColor = `#${new Color(theme.bridgeColor).lerp(new Color(baseColor), colorBlend).getHexString()}`

      roadsOut.push({
        x: cx,
        y: GROUND_BASE_Y + surfaceY * 0.5,
        z: cz,
        sx: alongX ? tileLen : roadW,
        sy: surfaceY,
        sz: alongX ? roadW : tileLen,
        color: tileColor,
      })

      // 縁石（橋の手すり下から途切れず続く）
      if (d < 17.5) {
        const curbOffset = roadW * 0.5 + 0.12
        const curbTop = surfaceY + 0.06
        for (const side of [-1, 1] as const) {
          roadsOut.push({
            x: cx + perpX * side * curbOffset,
            y: GROUND_BASE_Y + curbTop * 0.5,
            z: cz + perpZ * side * curbOffset,
            sx: alongX ? step * 1.08 : 0.24,
            sy: curbTop,
            sz: alongX ? 0.24 : step * 1.08,
            color: theme.roadCurb,
          })
        }
      }

      segIdx += 1
    }
  }
}

/**
 * 広葉樹（オフセットさせた複数の葉塊＋根張り＋枝）。
 * 均等な積み木にならないよう、樹冠を非対称に組む。
 */
function pushBroadleafTree(
  trunks: BoxInstance[],
  crowns: BoxInstance[],
  x: number,
  z: number,
  scale: number,
  n1: number,
  n2: number,
  n3: number,
  theme: BackdropTheme,
  christmas: boolean,
) {
  // 低い木でも塀（2.85〜3.6m）から葉が覗き、高い木は塀を十分に超える高さにする
  const trunkH = (2.35 + n1 * 0.65) * scale
  const trunkW = 0.36 * scale
  const leafDark = theme.foliage[0]
  const leafMid = theme.foliage[Math.floor(n1 * 2) + 1] ?? theme.foliage[1]
  const leafLight = theme.foliage[theme.foliage.length - 1]

  trunks.push({
    x,
    y: GROUND_BASE_Y + trunkH * 0.5,
    z,
    sx: trunkW,
    sy: trunkH,
    sz: trunkW,
    color: theme.trunk,
  })

  const dirX = n1 > 0.5 ? 1 : -1
  const dirZ = n2 > 0.5 ? 1 : -1
  const baseY = GROUND_BASE_Y + trunkH

  trunks.push({
    x: x + dirX * 0.38 * scale,
    y: baseY - 0.45 * scale,
    z: z + dirZ * 0.14 * scale,
    sx: 0.65 * scale,
    sy: 0.2 * scale,
    sz: 0.2 * scale,
    color: theme.trunk,
  })

  const clusters: Array<{
    dx: number
    dy: number
    dz: number
    sx: number
    sy: number
    sz: number
    color: string
  }> = [
    { dx: 0, dy: 0.25, dz: 0, sx: 2.1, sy: 0.96, sz: 2.0, color: leafDark },
    { dx: dirX * 0.62, dy: 0.4, dz: dirZ * 0.3, sx: 1.6, sy: 0.92, sz: 1.5, color: leafMid },
    { dx: -dirX * 0.52, dy: 0.62, dz: -dirZ * 0.3, sx: 1.5, sy: 0.9, sz: 1.5, color: leafMid },
    { dx: dirX * 0.15, dy: 0.98, dz: -dirZ * 0.12, sx: 1.4, sy: 0.78, sz: 1.35, color: leafLight },
  ]
  if (n3 < 0.55) {
    clusters.push({
      dx: -dirX * 0.12,
      dy: 1.34,
      dz: dirZ * 0.1,
      sx: 0.9,
      sy: 0.48,
      sz: 0.9,
      color: leafLight,
    })
  }

  for (const c of clusters) {
    crowns.push({
      x: x + c.dx * scale,
      y: baseY + c.dy * scale,
      z: z + c.dz * scale,
      sx: c.sx * scale,
      sy: c.sy * scale,
      sz: c.sz * scale,
      color: c.color,
    })
  }

  if (christmas) {
    crowns.push({
      x: x + dirX * 0.18 * scale,
      y: baseY + 1.4 * scale,
      z: z - dirZ * 0.1 * scale,
      sx: 0.92 * scale,
      sy: 0.1 * scale,
      sz: 0.88 * scale,
      color: '#dce6f2',
    })
    if (n2 > 0.45) {
      crowns.push({
        x: x - dirX * 0.52 * scale,
        y: baseY + 1.08 * scale,
        z: z - dirZ * 0.28 * scale,
        sx: 0.74 * scale,
        sy: 0.09 * scale,
        sz: 0.72 * scale,
        color: '#c8d6e6',
      })
    }
  }
}

/**
 * 針葉樹（塀をしっかり超える 5 段シルエット）。
 */
function pushPineTree(
  trunks: BoxInstance[],
  crowns: BoxInstance[],
  x: number,
  z: number,
  scale: number,
  n1: number,
  n2: number,
  theme: BackdropTheme,
  christmas: boolean,
) {
  const trunkH = (2.5 + n1 * 0.65) * scale
  const trunkW = 0.34 * scale
  trunks.push({
    x,
    y: GROUND_BASE_Y + trunkH * 0.45,
    z,
    sx: trunkW,
    sy: trunkH * 0.9,
    sz: trunkW,
    color: theme.trunk,
  })

  const lift = n1 * 0.55
  const tiers = [
    { dy: 1.45 + lift, w: 2.0, h: 0.68, color: theme.foliage[0] },
    { dy: 2.02 + lift, w: 1.68, h: 0.66, color: theme.foliage[0] },
    { dy: 2.58 + lift, w: 1.32, h: 0.64, color: theme.foliage[1] ?? theme.foliage[0] },
    { dy: 3.12 + lift, w: 0.94, h: 0.58, color: theme.foliage[2] ?? theme.foliage[1] },
    { dy: 3.62 + lift, w: 0.52, h: 0.54, color: theme.foliage[theme.foliage.length - 1] },
  ]
  const swayX = (n1 - 0.5) * 0.14 * scale
  const swayZ = (n2 - 0.5) * 0.14 * scale

  tiers.forEach((t, idx) => {
    const jitter = idx % 2 === 0 ? 1 : -0.6
    const cx = x + swayX * jitter
    const cz = z + swayZ * jitter
    crowns.push({
      x: cx,
      y: GROUND_BASE_Y + t.dy * scale,
      z: cz,
      sx: t.w * scale,
      sy: t.h * scale,
      sz: t.w * scale,
      color: t.color,
    })
    if (christmas && idx >= 3) {
      const side = idx % 2 === 0 ? 1 : -1
      crowns.push({
        x: cx + side * t.w * 0.16 * scale,
        y: GROUND_BASE_Y + (t.dy + t.h * 0.52) * scale,
        z: cz,
        sx: t.w * 0.45 * scale,
        sy: 0.08 * scale,
        sz: t.w * 0.45 * scale,
        color: idx === 4 ? '#dce6f2' : '#c8d6e6',
      })
    }
  })
}

function buildSceneryInstances({
  layout,
  spec,
  theme,
  christmas,
}: {
  layout: ParkZoneLayout
  spec: PerimeterSpec | null
  theme: BackdropTheme
  christmas: boolean
}): { trunks: BoxInstance[]; crowns: BoxInstance[]; roads: BoxInstance[] } {
  const trunks: BoxInstance[] = []
  const crowns: BoxInstance[] = []
  const roads: BoxInstance[] = []
  const cz = layout.groundZ
  const roadSpecs = getGateRoadSpecs(spec)

  pushGateRoads(roads, roadSpecs, theme)

  // Sea: 外周の森・島シルエットは置かない（桟橋道だけ）
  if (theme.scenery === 'seaIslets') {
    return { trunks, crowns, roads }
  }

  const wallOuterX = spec
    ? spec.riverInnerX + spec.riverWidth + spec.wallThickness
    : layout.districtHalfX + 1.5
  const wallOuterBackZ = spec
    ? cz - (spec.riverInnerZS + spec.riverWidth + spec.wallThickness)
    : cz - layout.districtHalfZ - 1.5

  // 遠くは霧に任せて削り、壁のすぐ外側（0.8m〜11.5m 帯）に手前寄りで密に並べる
  const maxBand = 11.5
  const minX = -(wallOuterX + maxBand)
  const maxX = wallOuterX + maxBand
  const minZ = wallOuterBackZ - maxBand
  // 左右の壁外はカメラに映る手前側（cz + 14）まで寄せる
  const maxZ = cz + 14
  const step = theme.scenery === 'craterRocks' ? 5.2 : 2.75

  for (let gx = minX; gx <= maxX; gx += step) {
    for (let gz = minZ; gz <= maxZ; gz += step) {
      const n1 = hash2(gx, gz)
      const n2 = hash2(gx + 31, gz - 17)
      const n3 = hash2(gx - 19, gz + 43)

      const x = gx + (n1 - 0.5) * step * 0.8
      const z = gz + (n2 - 0.5) * step * 0.8

      // 壁の内側と、手前側（カメラ側）は除外
      const insideOrFrontX = Math.abs(x) < wallOuterX + 1.1
      const notBehindBackWall = z > wallOuterBackZ - 1.1
      if (insideOrFrontX && notBehindBackWall) continue

      // 壁から離れすぎた角はカット
      const distFromWall = Math.max(Math.abs(x) - wallOuterX, wallOuterBackZ - z, 0)
      if (distFromWall < 0.8 || distFromWall > maxBand) continue

      // 壁に近い手前帯を高密度に
      const density = distFromWall < 6.5 ? 0.94 : 0.72
      if (n3 > density) continue

      if (isOnGateRoad(x, z, roadSpecs)) continue

      // いまの最高高さを最低ラインにし、高い木は塀を十分超えるまで伸ばす
      const scale = 1.2 + n2 * 0.45

      if (theme.scenery === 'craterRocks') {
        const w = (1.6 + n1 * 1.2) * scale
        const h = (0.7 + n2 * 0.85) * scale
        const color = theme.foliage[Math.floor(n1 * theme.foliage.length) % theme.foliage.length]
        crowns.push({ x, y: GROUND_BASE_Y + h * 0.5, z, sx: w, sy: h, sz: w * 0.9, color })
        if (n3 < 0.45) {
          crowns.push({
            x: x + w * 0.18,
            y: GROUND_BASE_Y + h + h * 0.22,
            z: z - w * 0.12,
            sx: w * 0.55,
            sy: h * 0.5,
            sz: w * 0.55,
            color: theme.trunk,
          })
        }
        continue
      }

      const isPine =
        theme.scenery === 'pineForest' ||
        (theme.scenery === 'mixedForest' && n1 < 0.45)

      if (isPine) {
        pushPineTree(trunks, crowns, x, z, scale, n1, n2, theme, christmas)
      } else {
        pushBroadleafTree(trunks, crowns, x, z, scale, n1, n2, n3, theme, christmas)
      }
    }
  }

  return { trunks, crowns, roads }
}

function OuterScenery({
  layout,
  spec,
  theme,
  christmas,
}: {
  layout: ParkZoneLayout
  spec: PerimeterSpec | null
  theme: BackdropTheme
  christmas: boolean
}) {
  const { trunks, crowns, roads } = useMemo(
    () => buildSceneryInstances({ layout, spec, theme, christmas }),
    [layout, spec, theme, christmas],
  )

  return (
    <group>
      <StaticVoxelBatch boxes={roads} />
      <StaticVoxelBatch boxes={trunks} />
      <StaticVoxelBatch boxes={crowns} />
    </group>
  )
}

/** 影なし・アニメなしの静的ボクセルバッチ（1ドローコール） */
function StaticVoxelBatch({ boxes }: { boxes: BoxInstance[] }) {
  const meshRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    boxes.forEach((b, index) => {
      scratch.position.set(b.x, b.y, b.z)
      scratch.scale.set(b.sx, b.sy, b.sz)
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
      mesh.setColorAt(index, scratchColor.set(b.color))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [boxes])

  if (boxes.length === 0) return null

  return (
    <instancedMesh key={boxes.length} ref={meshRef} args={[undefined, undefined, boxes.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.95} metalness={0.02} />
    </instancedMesh>
  )
}
