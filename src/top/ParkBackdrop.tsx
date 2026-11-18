/**
 * パーク外側の背景（グラデ空・地続きの大地・壁外すぐ近くを囲む森シルエット）。
 * すべて InstancedMesh（影なし・アニメなし）で数ドローコールに抑え、
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
  /**
   * 壁の外の地面を草地にする（森のゾーンだけ）。
   * 1m タイルを緩やかなノイズで塗り分け、草むら・土・冬の雪だまりを散らす。
   */
  grass?: GrassTheme
}

type GrassTheme = {
  /** 暗い〜明るい草色（ノイズで塗り分ける） */
  greens: readonly string[]
  /** 草むらの葉先 */
  tuft: string
  /** 所々に出る土 */
  dirt: string
}

/** 夜の雪だまり（白すぎると浮くので少し沈める） */
const SNOW_COLORS = ['#b8c4d0', '#a8b4c2'] as const

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
    grass: { greens: ['#24391f', '#2c4524', '#34512a', '#3d5c30'], tuft: '#4a6e36', dirt: '#4a3b2a' },
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
    grass: { greens: ['#203520', '#284126', '#2f4c2c', '#375633'], tuft: '#43663a', dirt: '#463a2c' },
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
    grass: { greens: ['#22371f', '#2a4225', '#324d2b', '#3a5730'], tuft: '#466a38', dirt: '#46392a' },
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
    grass: { greens: ['#1a2820', '#203026', '#26382c', '#2c3f31'], tuft: '#344a3a', dirt: '#2e2630' },
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
  jungle: {
    ground: '#1e3020',
    winterGround: '#1e3020',
    // 外周も広葉樹の深い森
    scenery: 'quietForest',
    trunk: '#3e2c1e',
    foliage: ['#163a1c', '#1e4a22', '#28582a', '#336834'],
    bridgeColor: '#8c6f4b',
    roadA: '#6c5a44',
    roadB: '#63523d',
    roadCurb: '#4b453e',
    grass: { greens: ['#1f3a1c', '#274722', '#2f5428', '#386030'], tuft: '#447036', dirt: '#463826' },
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
          color={tintOuterGround(
            // 草地のゾーンは冬でも地面は緑（雪は草地タイルの吹きだまりで表す）
            theme.grass ? theme.grass.greens[0] : look.christmas ? theme.winterGround : theme.ground,
            timeOfDay,
          )}
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
        side: 'e',
      })
    } else if (opening.side === 'w') {
      roads.push({
        startX: placement.x - halfLen,
        startZ: placement.z,
        dirX: -1,
        dirZ: 0,
        side: 'w',
      })
    } else if (opening.side === 's') {
      roads.push({
        startX: placement.x,
        startZ: placement.z - halfLen,
        dirX: 0,
        dirZ: -1,
        // 左寄り北門からそのままさらに少し左奥へ曲がる
        side: 's',
      })
    } else if (opening.side === 'n') {
      roads.push({
        startX: placement.x,
        startZ: placement.z + halfLen,
        dirX: 0,
        dirZ: 1,
        side: 'n',
      })
    }
  }
  return roads
}

/** 橋の先の道は真っ直ぐ伸ばす（曲げると作り物っぽく見える） */
const GATE_ROAD_REACH = 28

/** 道の延長線上（halfWidth 以内）か。木は 3.1、草地は道幅ぶんだけ避ける */
function isOnGateRoad(x: number, z: number, roads: GateRoadSpec[], halfWidth = 3.1) {
  for (const road of roads) {
    const dx = x - road.startX
    const dz = z - road.startZ
    // 進行方向距離 d、横方向距離 perp
    const d = dx * road.dirX + dz * road.dirZ
    if (d < -1.5 || d > GATE_ROAD_REACH) continue
    // 進行方向に対し左／右の法線
    const perpX = -road.dirZ
    const perpZ = road.dirX
    const lateral = dx * perpX + dz * perpZ
    if (Math.abs(lateral) < halfWidth) return true
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
      const cx = road.startX + road.dirX * d
      const cz = road.startZ + road.dirZ * d

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
  // 幹は短め（背が高すぎると作り物っぽい）。樹冠の上部が塀から覗く程度
  const trunkH = (1.18 + n1 * 0.33) * scale
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

/** 幹を短くしたぶん、針葉樹の葉の段を下げる量 */
const PINE_TRUNK_DROP = 0.8

/**
 * 針葉樹（5 段シルエット）。
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
  // 幹は短め。葉の段も同じだけ下げる
  const trunkH = (1.25 + n1 * 0.33) * scale
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

  const lift = n1 * 0.55 - PINE_TRUNK_DROP
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

/** 0〜1 の滑らかな値ノイズ（格子点ハッシュを双線形補間） */
function valueNoise(x: number, z: number) {
  const x0 = Math.floor(x)
  const z0 = Math.floor(z)
  const fx = x - x0
  const fz = z - z0
  const sx = fx * fx * (3 - 2 * fx)
  const sz = fz * fz * (3 - 2 * fz)
  const a = hash2(x0, z0)
  const b = hash2(x0 + 1, z0)
  const c = hash2(x0, z0 + 1)
  const d = hash2(x0 + 1, z0 + 1)
  return (a * (1 - sx) + b * sx) * (1 - sz) + (c * (1 - sx) + d * sx) * sz
}

/** 草むら1つ（細い葉を数本、高さ違いで束ねる） */
function pushTuft(out: BoxInstance[], x: number, z: number, n: number, grass: GrassTheme) {
  const blades = 2 + Math.floor(n * 3)
  for (let i = 0; i < blades; i += 1) {
    const a = n * 17 + i * 2.1
    const r = 0.08 + ((i * 0.37 + n) % 1) * 0.14
    const h = 0.18 + ((n * 7 + i * 0.29) % 1) * 0.26
    out.push({
      x: x + Math.cos(a) * r,
      y: GROUND_BASE_Y + h * 0.5,
      z: z + Math.sin(a) * r,
      sx: 0.05,
      sy: h,
      sz: 0.05,
      color: i % 2 === 0 ? grass.tuft : grass.greens[grass.greens.length - 1],
    })
  }
}

/**
 * 壁の外の草地。1m タイルで隙間なく敷き、緩やかなノイズで濃淡・土・雪を塗り分ける。
 * タイル同士は重ならない（同じ高さの面が重なると z-fighting になる）。
 */
function pushGrassGround(
  ground: BoxInstance[],
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
  isInside: (x: number, z: number) => boolean,
  roadSpecs: GateRoadSpec[],
  grass: GrassTheme,
  christmas: boolean,
) {
  for (let gx = Math.floor(bounds.minX); gx < bounds.maxX; gx += 1) {
    for (let gz = Math.floor(bounds.minZ); gz < bounds.maxZ; gz += 1) {
      const x = gx + 0.5
      const z = gz + 0.5
      if (isInside(x, z)) continue
      // 道の舗装の下は空ける（縁石の外から草）
      if (isOnGateRoad(x, z, roadSpecs, 2.4)) continue

      // 大きな濃淡のうねり＋小さなむら
      const broad = valueNoise(x * 0.18, z * 0.18)
      const fine = hash2(gx * 1.7, gz * 2.3)
      const shade = broad * 0.75 + fine * 0.25
      const dirtNoise = valueNoise(x * 0.33 + 40, z * 0.33 - 12)
      const snowNoise = valueNoise(x * 0.26 - 9, z * 0.26 + 31)

      let color: string
      let height = 0.02 + fine * 0.025
      if (christmas && snowNoise < 0.3) {
        color = SNOW_COLORS[fine < 0.5 ? 0 : 1]
        height += 0.03
      } else if (dirtNoise > 0.82) {
        color = grass.dirt
        height = 0.015
      } else {
        const index = Math.min(grass.greens.length - 1, Math.floor(shade * grass.greens.length))
        color = grass.greens[index]
      }
      ground.push({ x, y: GROUND_BASE_Y + height * 0.5, z, sx: 1, sy: height, sz: 1, color })

      // 草むら（雪の上には出さない）
      if (color !== SNOW_COLORS[0] && color !== SNOW_COLORS[1] && fine > 0.68) {
        pushTuft(ground, x + (fine - 0.84) * 0.6, z + (broad - 0.5) * 0.6, fine, grass)
      }
    }
  }
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
}): {
  trunks: BoxInstance[]
  crowns: BoxInstance[]
  roads: BoxInstance[]
  ground: BoxInstance[]
} {
  const trunks: BoxInstance[] = []
  const crowns: BoxInstance[] = []
  const roads: BoxInstance[] = []
  const ground: BoxInstance[] = []
  const cz = layout.groundZ
  const roadSpecs = getGateRoadSpecs(spec)

  pushGateRoads(roads, roadSpecs, theme)

  // Sea: 外周の森・島シルエットは置かない（桟橋道だけ）
  if (theme.scenery === 'seaIslets') {
    return { trunks, crowns, roads, ground }
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

  if (theme.grass) {
    // 森の帯より少し外まで草地を敷く（その先は霧と単色の地面に溶かす）
    const grassBand = maxBand + 4
    pushGrassGround(
      ground,
      {
        minX: -(wallOuterX + grassBand),
        maxX: wallOuterX + grassBand,
        minZ: wallOuterBackZ - grassBand,
        maxZ: maxZ + 4,
      },
      (x, z) => Math.abs(x) < wallOuterX + 0.2 && z > wallOuterBackZ - 0.2,
      roadSpecs,
      theme.grass,
      christmas,
    )
  }

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
      // 根元の下草（幹がいきなり地面から生えて見えないように）
      if (theme.grass) {
        pushTuft(ground, x + 0.35 * scale, z + 0.2, n2, theme.grass)
        pushTuft(ground, x - 0.3 * scale, z - 0.25, n3, theme.grass)
      }
    }
  }

  return { trunks, crowns, roads, ground }
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
  const { trunks, crowns, roads, ground } = useMemo(
    () => buildSceneryInstances({ layout, spec, theme, christmas }),
    [layout, spec, theme, christmas],
  )

  return (
    <group>
      <StaticVoxelBatch boxes={ground} />
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
