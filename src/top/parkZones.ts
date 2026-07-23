import type { AttractionId } from './topStore'
import type { ParkPerimeterDef } from './parkPerimeterSpec'

/** Park のエリア ID。1エリア最大3ゲーム。 */
export type ParkZoneId = 'plaza' | 'mountain'

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
  /** mountain = ボクセル山門、plaza = 広場へ戻る門 */
  theme: 'mountain' | 'plaza'
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
  theme?: 'classic' | 'mountain'
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
        { side: 'w', kind: 'sealed' },
        { side: 's', kind: 'sealed' },
        // 北（手前）はゲート以外置かない。将来北ゲートが増えたら bridge-gate のみ追加
      ],
    },
    spawn: { x: 0, z: 8, rotationY: Math.PI },
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
      [-12.5, 9.0],
      [12.5, 9.0],
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
        subtitle: { en: 'Adventure Ahead', ja: '冒険の入口' },
      },
    ],
  },
  mountain: {
    id: 'mountain',
    title: { en: 'Mountain District', ja: 'マウンテン地区' },
    attractionIds: ['mountain'],
    layout: MOUNTAIN_LAYOUT,
    perimeter: {
      theme: 'mountain',
      frontClearSides: ['n'],
      openings: [
        { side: 'w', kind: 'bridge-gate', gateId: 'mountain-to-plaza' },
        { side: 'e', kind: 'sealed' },
        { side: 's', kind: 'sealed' },
      ],
    },
    // 西門・橋の内側（川 ≈ -22 より東）
    spawn: { x: -19.5, z: 1, rotationY: Math.PI / 2 },
    hasFountain: false,
    hasFeaturedBoard: false,
    hasNpcCrowd: false,
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
    comingSoonSlots: [
      // 南西スロット（山アトラクション・西門・南封印から離す）
      {
        x: -12.5,
        z: -11.5,
        theme: 'mountain',
        title: { en: 'ALPINE LODGE', ja: '山荘ロッジ' },
        subtitle: { en: 'Under Construction', ja: '建設中' },
      },
      // 南東スロット
      {
        x: 12.5,
        z: -11.0,
        theme: 'mountain',
        title: { en: 'PEAK OUTLOOK', ja: '展望台' },
        subtitle: { en: 'Coming Soon', ja: '近日公開' },
      },
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
    if (raw === 'plaza' || raw === 'mountain') return raw
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
