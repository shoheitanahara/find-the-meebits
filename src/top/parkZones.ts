import type { AttractionId } from './topStore'
import { DEFAULT_PARK_ATTRACTION_SLOTS } from './parkAttractionSlots'
import { PARK_FAR_SIDE_GATE_X, PARK_NEAR_SIDE_GATE_X, type ParkPerimeterDef } from './parkPerimeterSpec'
import { SEA_PALM_TREE_XZ } from './seaPalms'

export { PARK_FAR_SIDE_GATE_X, PARK_NEAR_SIDE_GATE_X }

/** Park のエリア ID。1エリア最大3ゲーム。 */
export type ParkZoneId = 'plaza' | 'mountain' | 'culture' | 'sea' | 'astro'

export type ParkZoneBounds = {
  boundsX: number
  minZ: number
  maxZ: number
}

/** 島・柵・地面など、ゾーンごとの見た目サイズ。海・砂浜は使わない。 */
export type ParkZoneLayout = ParkZoneBounds & {
  railingX: number
  railingHalfThickness: number
  railingZ: number
  railingHalfLength: number
  pathEdgeX: number
  treeX: number
  groundZ: number
  /** 地区床（外周崖の内側）の広さ */
  districtHalfX: number
  districtHalfZ: number
  plazaRadius: number
  pathSizeX: number
  pathSizeZ: number
  paverWidth: number
  pathEdgeLength: number
}

export type ParkGateDef = {
  id: string
  /** ゲート中心（このゾーン内ワールド座標） */
  x: number
  z: number
  /** 門柱の半幅（左右＝南北、yaw=0 時） */
  halfWidth: number
  /** 通過アルコーブ深さ */
  alcoveDepth: number
  /** mountain / culture / sea / astro = 行き先意匠、plaza = 広場へ戻る門 */
  theme: 'mountain' | 'plaza' | 'culture' | 'sea' | 'astro'
  /**
   * Yaw（ラジアン）。0 で東西通過。
   * カージナル橋では基本 0（軸平行）。
   */
  yaw?: number
  targetZone: ParkZoneId
  /** 到着ゾーンでのスポーン */
  targetSpawn: { x: number; z: number; rotationY: number }
  label: { en: string; ja: string }
  subtitle: { en: string; ja: string }
}

/** 建設予定枠（Coming Soon） */
export type ComingSoonSlot = {
  x: number
  z: number
  /** 省略時はゾーン外周テーマに追従 */
  theme?: 'classic' | 'mountain' | 'culture' | 'sea' | 'astro'
  title?: { en: string; ja: string }
  subtitle?: { en: string; ja: string }
}

export type ParkZoneDef = {
  id: ParkZoneId
  title: { en: string; ja: string }
  attractionIds: AttractionId[]
  layout: ParkZoneLayout
  gates: ParkGateDef[]
  /** 外周キット（崖・川・橋）。あるゾーンは旧メタル柵を出さない */
  perimeter?: ParkPerimeterDef
  /** ゾーン入場時（スタート／ゲート到着）の既定スポーン */
  spawn: { x: number; z: number; rotationY: number }
  /** 噴水・本日の主役看板などプラザ専用デコ */
  hasFountain: boolean
  hasFeaturedBoard: boolean
  /** NPC 群衆を出すか */
  hasNpcCrowd: boolean
  benches: ReadonlyArray<readonly [number, number, number]>
  lamps: ReadonlyArray<readonly [number, number]>
  planters: ReadonlyArray<readonly [number, number]>
  trees: ReadonlyArray<readonly [number, number]>
  /** Coming Soon 枠（建設中エリア用） */
  comingSoonSlots?: ReadonlyArray<ComingSoonSlot>
}

/**
 * 全区共通の床・園路スケルトン。
 * ゾーン差はテーマ（色・デコ・ゲート意匠）だけ。床の横幅は揃える。
 */
const SHARED_PARK_GROUND = {
  boundsX: 29,
  minZ: -20,
  maxZ: 16,
  groundZ: 1,
  districtHalfX: 24,
  districtHalfZ: 24,
  plazaRadius: 22,
  pathSizeX: 40,
  pathSizeZ: 34,
  paverWidth: 36,
  pathEdgeLength: 32,
} as const

/** Plaza: 共通床＋クラシック導線 */
const PLAZA_LAYOUT: ParkZoneLayout = {
  ...SHARED_PARK_GROUND,
  railingX: 26,
  railingHalfThickness: 0.22,
  railingZ: 1,
  railingHalfLength: 15.5,
  // 側面アトラクション外側に金縁
  pathEdgeX: 21.5,
  treeX: 22.5,
}

/** Mountain: 同じ床幅。差は pathEdge と外周テーマ */
const MOUNTAIN_LAYOUT: ParkZoneLayout = {
  ...SHARED_PARK_GROUND,
  railingX: 26,
  railingHalfThickness: 0.22,
  railingZ: 1,
  railingHalfLength: 15.5,
  pathEdgeX: 11,
  treeX: 22.5,
}

/** Culture: 同じ床幅。ギャラリー園路はやや広め */
const CULTURE_LAYOUT: ParkZoneLayout = {
  ...SHARED_PARK_GROUND,
  railingX: 26,
  railingHalfThickness: 0.22,
  railingZ: 1,
  railingHalfLength: 15.5,
  pathEdgeX: 18,
  treeX: 22.5,
}

/** Sea: 同じ床幅。砂浜のボードウォーク縁 */
const SEA_LAYOUT: ParkZoneLayout = {
  ...SHARED_PARK_GROUND,
  railingX: 26,
  railingHalfThickness: 0.22,
  railingZ: 1,
  railingHalfLength: 15.5,
  pathEdgeX: 14,
  treeX: 21.5,
}

/** Astro: 同じ床幅。金属パネルの園路縁 */
const ASTRO_LAYOUT: ParkZoneLayout = {
  ...SHARED_PARK_GROUND,
  railingX: 26,
  railingHalfThickness: 0.22,
  railingZ: 1,
  railingHalfLength: 15.5,
  pathEdgeX: 13,
  treeX: 22.5,
}

export const PARK_ZONES: Record<ParkZoneId, ParkZoneDef> = {
  plaza: {
    id: 'plaza',
    title: { en: 'Meebits Plaza', ja: 'ミービッツ広場' },
    attractionIds: ['find', 'traits', 'street'],
    layout: PLAZA_LAYOUT,
    perimeter: {
      theme: 'classic',
      openings: [
        { side: 'e', kind: 'bridge-gate', gateId: 'plaza-to-mountain' },
        { side: 'w', kind: 'bridge-gate', gateId: 'plaza-to-sea' },
        { side: 's', kind: 'bridge-gate', gateId: 'plaza-to-culture' },
        // 北（手前）はゲート以外置かない。将来北ゲートが増えたら bridge-gate のみ追加
      ],
    },
    spawn: { x: 0, z: 14.8, rotationY: Math.PI },
    hasFountain: true,
    hasFeaturedBoard: true,
    hasNpcCrowd: true,
    /**
     * 家具ルール（厳守）:
     * - セットは噴水まわりの開けた園路だけ
     * - 東: ゲート帯＋Street 脇〜壁の隙間に何も置かない (x>12)
     * - 西: 封印門まわりに何も置かない (x<-16)
     * - 建物 footprint / 入口前に木・ベンチを重ねない
     */
    benches: [
      [-6.5, 4.4, Math.PI / 2],
      [6.5, 4.4, -Math.PI / 2],
    ],
    planters: [
      [-6.5, 2.85],
      [6.5, 2.85],
    ],
    lamps: [
      [-9, 5.9],
      [9, 5.9],
      [-9, 0.5],
      [9, 0.5],
      [-9, -5.5],
      [9, -5.5],
    ],
    trees: [
      [-12.5, 8.0],
      [12.5, 8.0],
      [-12.5, -1.5],
      [12.5, -1.5],
    ],
    gates: [
      {
        id: 'plaza-to-mountain',
        x: 26.4,
        z: 1,
        halfWidth: 2.55,
        alcoveDepth: 2.8,
        theme: 'mountain',
        yaw: 0,
        targetZone: 'mountain',
        // 西川のすぐ内側（橋を降りた直後）
        targetSpawn: { x: -19.5, z: 1, rotationY: Math.PI / 2 },
        label: { en: 'MOUNTAIN DISTRICT', ja: 'マウンテン地区' },
        subtitle: { en: 'Mt. Meeb', ja: 'Mt. Meeb' },
      },
      {
        id: 'plaza-to-culture',
        x: PARK_FAR_SIDE_GATE_X,
        z: -18.4,
        halfWidth: 2.55,
        alcoveDepth: 2.6,
        theme: 'culture',
        yaw: Math.PI / 2,
        targetZone: 'culture',
        // 北門は左寄り → 着地は Culture 入口センター・手前すぐ内側
        targetSpawn: { x: PARK_NEAR_SIDE_GATE_X, z: 13.5, rotationY: Math.PI },
        label: { en: 'CULTURE DISTRICT', ja: 'カルチャー地区' },
        subtitle: { en: 'Runway · Locker · Booth', ja: 'ランウェイ・ロッカー・ブース' },
      },
      {
        id: 'plaza-to-sea',
        x: -26.4,
        z: 1,
        halfWidth: 2.55,
        alcoveDepth: 2.8,
        theme: 'sea',
        yaw: Math.PI,
        targetZone: 'sea',
        // 東の海際すぐ内側（橋を降りた直後）・西向き
        targetSpawn: { x: 19.5, z: 1, rotationY: -Math.PI / 2 },
        label: { en: 'SEA DISTRICT', ja: 'シーエリア' },
        subtitle: { en: 'Beach · Tide · Pier', ja: 'ビーチ・潮だまり・桟橋' },
      },
    ],
  },
  mountain: {
    id: 'mountain',
    title: { en: 'Mountain District', ja: 'マウンテン地区' },
    attractionIds: ['mountain', 'neon', 'shooting'],
    layout: MOUNTAIN_LAYOUT,
    perimeter: {
      theme: 'mountain',
      frontClearSides: ['n'],
      openings: [
        { side: 'w', kind: 'bridge-gate', gateId: 'mountain-to-plaza' },
        { side: 'e', kind: 'sealed' },
        // 奥（北 / −Z）→ Astro
        { side: 's', kind: 'bridge-gate', gateId: 'mountain-to-astro' },
      ],
    },
    // 西門・橋の内側（川 ≈ -22 より東）
    spawn: { x: -19.5, z: 1, rotationY: Math.PI / 2 },
    hasFountain: false,
    hasFeaturedBoard: false,
    hasNpcCrowd: true,
    benches: [
      [-6.5, 5.0, Math.PI / 2],
      [6.5, 5.0, -Math.PI / 2],
    ],
    planters: [
      [-6.5, 3.45],
      [6.5, 3.45],
    ],
    lamps: [
      [-9, 6.5],
      [9, 6.5],
      [-9, 0.5],
      [9, 0.5],
      [-9, -5.5],
      [9, -5.5],
    ],
    trees: [
      [-12.5, 9],
      [12.5, 9],
      [-12.5, -1.5],
      [12.5, -1.5],
    ],
    gates: [
      {
        id: 'mountain-to-plaza',
        x: -25.6,
        z: 1,
        halfWidth: 2.6,
        alcoveDepth: 2.0,
        theme: 'plaza',
        yaw: 0,
        targetZone: 'plaza',
        targetSpawn: { x: 20.5, z: 1, rotationY: -Math.PI / 2 },
        label: { en: 'BACK TO PLAZA', ja: '広場へ戻る' },
        subtitle: { en: 'Meebits Plaza', ja: 'ミービッツ広場' },
      },
      {
        id: 'mountain-to-astro',
        x: PARK_FAR_SIDE_GATE_X,
        z: -18.4,
        halfWidth: 2.55,
        alcoveDepth: 2.6,
        theme: 'astro',
        yaw: Math.PI / 2,
        targetZone: 'astro',
        // Astro 手前入口センター・奥向き
        targetSpawn: { x: PARK_NEAR_SIDE_GATE_X, z: 13.5, rotationY: Math.PI },
        label: { en: 'ASTRO DISTRICT', ja: 'アストロエリア' },
        subtitle: { en: 'Robots · Visitors · Orbit', ja: 'ロボ・ビジター・軌道' },
      },
    ],
  },
  culture: {
    id: 'culture',
    title: { en: 'Culture District', ja: 'カルチャー地区' },
    attractionIds: ['runway', 'closet', 'pfp'],
    layout: CULTURE_LAYOUT,
    perimeter: {
      theme: 'culture',
      frontClearSides: ['n'],
      openings: [
        // 東 → Astro
        { side: 'e', kind: 'bridge-gate', gateId: 'culture-to-astro' },
        { side: 'w', kind: 'sealed' },
        { side: 's', kind: 'sealed' },
      ],
    },
    spawn: { x: PARK_NEAR_SIDE_GATE_X, z: 13.5, rotationY: Math.PI },
    hasFountain: false,
    hasFeaturedBoard: false,
    hasNpcCrowd: true,
    benches: [
      [-6.5, 5.0, Math.PI / 2],
      [6.5, 5.0, -Math.PI / 2],
    ],
    planters: [
      [-6.5, 3.45],
      [6.5, 3.45],
    ],
    lamps: [
      [-9, 6.5],
      [9, 6.5],
      [-9, 0.5],
      [9, 0.5],
      [-9, -5.5],
      [9, -5.5],
    ],
    trees: [
      [-12.5, 9],
      [12.5, 9],
      [-12.5, -1.5],
      [12.5, -1.5],
    ],
    gates: [
      {
        id: 'culture-to-plaza',
        x: PARK_NEAR_SIDE_GATE_X,
        // 手前（南）入口はセンター。北門左寄り／到着センターの共通ルール
        z: 16.0,
        halfWidth: 2.55,
        alcoveDepth: 2.4,
        theme: 'plaza',
        // Three.js: yaw=π/2 でローカル +X → 南(-Z)。接近・敷石が地区側を向く
        yaw: Math.PI / 2,
        targetZone: 'plaza',
        // 対向のプラザ北門（左寄り）すぐ内側・噴水方向へ
        targetSpawn: { x: PARK_FAR_SIDE_GATE_X, z: -14.5, rotationY: 0 },
        label: { en: 'BACK TO PLAZA', ja: '広場へ戻る' },
        subtitle: { en: 'Meebits Plaza', ja: 'ミービッツ広場' },
      },
      {
        id: 'culture-to-astro',
        x: 26.4,
        z: 1,
        halfWidth: 2.55,
        alcoveDepth: 2.8,
        theme: 'astro',
        yaw: 0,
        targetZone: 'astro',
        // Astro 西門すぐ内側・東向き
        targetSpawn: { x: -19.5, z: 1, rotationY: Math.PI / 2 },
        label: { en: 'ASTRO DISTRICT', ja: 'アストロエリア' },
        subtitle: { en: 'Robots · Visitors · Orbit', ja: 'ロボ・ビジター・軌道' },
      },
    ],
  },
  sea: {
    id: 'sea',
    title: { en: 'Sea District', ja: 'シーエリア' },
    attractionIds: ['sergito'],
    layout: SEA_LAYOUT,
    perimeter: {
      theme: 'sea',
      // 壁なし・手前クリアなし。四方を海で囲み、東だけ桟橋
      frontClearSides: [],
      openings: [
        { side: 'e', kind: 'bridge-gate', gateId: 'sea-to-plaza' },
      ],
    },
    spawn: { x: 19.5, z: 1, rotationY: -Math.PI / 2 },
    hasFountain: false,
    hasFeaturedBoard: false,
    hasNpcCrowd: true,
    benches: [
      [-6.5, 5.0, Math.PI / 2],
      [6.5, 5.0, -Math.PI / 2],
    ],
    planters: [
      [-6.5, 3.45],
      [6.5, 3.45],
    ],
    lamps: [
      [-9, 6.5],
      [9, 6.5],
      [-9, 0.5],
      [9, 0.5],
      [-9, -5.5],
      [9, -5.5],
    ],
    trees: SEA_PALM_TREE_XZ,
    comingSoonSlots: [
      {
        x: DEFAULT_PARK_ATTRACTION_SLOTS.west.x,
        z: DEFAULT_PARK_ATTRACTION_SLOTS.west.z,
        theme: 'sea',
        title: { en: 'BEACH CLUB', ja: 'ビーチクラブ' },
        subtitle: { en: 'Sunset hangout', ja: '夕暮れのたまり場' },
      },
      {
        x: DEFAULT_PARK_ATTRACTION_SLOTS.center.x,
        z: DEFAULT_PARK_ATTRACTION_SLOTS.center.z,
        theme: 'sea',
        title: { en: 'TIDE POOL', ja: 'タイドプール' },
        subtitle: { en: 'Shoreline stroll', ja: '潮だまりウォーク' },
      },
    ],
    gates: [
      {
        id: 'sea-to-plaza',
        x: 25.6,
        z: 1,
        halfWidth: 2.6,
        alcoveDepth: 2.0,
        theme: 'plaza',
        yaw: Math.PI,
        targetZone: 'plaza',
        targetSpawn: { x: -20.5, z: 1, rotationY: Math.PI / 2 },
        label: { en: 'BACK TO PLAZA', ja: '広場へ戻る' },
        subtitle: { en: 'Meebits Plaza', ja: 'ミービッツ広場' },
      },
    ],
  },
  /**
   * Astro: Mountain の北 × Culture の東。
   * 中央は Starlight Rush。西・東は工事中。
   */
  astro: {
    id: 'astro',
    title: { en: 'Astro District', ja: 'アストロエリア' },
    attractionIds: ['starlight'],
    layout: ASTRO_LAYOUT,
    perimeter: {
      theme: 'astro',
      frontClearSides: ['n'],
      openings: [
        // 西 → Culture
        { side: 'w', kind: 'bridge-gate', gateId: 'astro-to-culture' },
        { side: 'e', kind: 'sealed' },
        // 奥は封印。Mountain へは手前（南 / +Z）の自立門で戻る
        { side: 's', kind: 'sealed' },
      ],
    },
    // Mountain 北門からの到着を既定スポーンに
    spawn: { x: PARK_NEAR_SIDE_GATE_X, z: 13.5, rotationY: Math.PI },
    hasFountain: false,
    hasFeaturedBoard: false,
    hasNpcCrowd: true,
    benches: [
      [-6.5, 5.0, Math.PI / 2],
      [6.5, 5.0, -Math.PI / 2],
    ],
    // Astroではベンチ横オブジェを置かず、通路と視界を軽く保つ。
    planters: [],
    lamps: [
      [-9, 6.5],
      [9, 6.5],
      [-9, 0.5],
      [9, 0.5],
      [-9, -5.5],
      [9, -5.5],
    ],
    // 樹木なし（宇宙小物は地面コンポーネント側）
    trees: [],
    comingSoonSlots: [
      {
        x: DEFAULT_PARK_ATTRACTION_SLOTS.west.x,
        z: DEFAULT_PARK_ATTRACTION_SLOTS.west.z,
        theme: 'astro',
        title: { en: 'LUNAR LAB', ja: 'ルナラボ' },
        subtitle: { en: 'Robot research bay', ja: 'ロボ研究ベイ' },
      },
      {
        x: DEFAULT_PARK_ATTRACTION_SLOTS.east.x,
        z: DEFAULT_PARK_ATTRACTION_SLOTS.east.z,
        theme: 'astro',
        title: { en: 'ORBITAL PORT', ja: 'オービタルポート' },
        subtitle: { en: 'Visitor docking ring', ja: 'ビジター接岸リング' },
      },
    ],
    gates: [
      {
        id: 'astro-to-mountain',
        x: PARK_NEAR_SIDE_GATE_X,
        z: 16.0,
        halfWidth: 2.55,
        alcoveDepth: 2.4,
        theme: 'mountain',
        // Astro 地区内（−Z側）から近づく向きに門正面を合わせる。
        yaw: -Math.PI / 2,
        targetZone: 'mountain',
        // Mountain 北門（左寄り）すぐ内側・地区奥向き
        targetSpawn: { x: PARK_FAR_SIDE_GATE_X, z: -14.5, rotationY: 0 },
        label: { en: 'MOUNTAIN DISTRICT', ja: 'マウンテン地区' },
        subtitle: { en: 'Peaks · Neon · Gallery', ja: '山頂・ネオン・射撃' },
      },
      {
        id: 'astro-to-culture',
        x: -25.6,
        z: 1,
        halfWidth: 2.6,
        alcoveDepth: 2.0,
        theme: 'culture',
        yaw: 0,
        targetZone: 'culture',
        // Culture 東門すぐ内側・西向き
        targetSpawn: { x: 20.5, z: 1, rotationY: -Math.PI / 2 },
        label: { en: 'CULTURE DISTRICT', ja: 'カルチャー地区' },
        subtitle: { en: 'Runway · Locker · Booth', ja: 'ランウェイ・ロッカー・ブース' },
      },
    ],
  },
}

export const DEFAULT_PARK_ZONE: ParkZoneId = 'plaza'

export function getParkZone(id: ParkZoneId): ParkZoneDef {
  return PARK_ZONES[id]
}

export function getZoneForAttraction(attractionId: AttractionId): ParkZoneId {
  for (const zone of Object.values(PARK_ZONES)) {
    if (zone.attractionIds.includes(attractionId)) return zone.id
  }
  return DEFAULT_PARK_ZONE
}

const ZONE_STORAGE_KEY = 'meebits-park-active-zone'

export function readStoredParkZone(): ParkZoneId {
  if (typeof window === 'undefined') return DEFAULT_PARK_ZONE
  try {
    const raw = sessionStorage.getItem(ZONE_STORAGE_KEY)
    if (raw === 'plaza' || raw === 'mountain' || raw === 'culture' || raw === 'sea' || raw === 'astro') {
      return raw
    }
  } catch {
    // ignore
  }
  return DEFAULT_PARK_ZONE
}

export function writeStoredParkZone(id: ParkZoneId) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(ZONE_STORAGE_KEY, id)
  } catch {
    // ignore
  }
}
