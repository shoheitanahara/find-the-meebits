import { DEFAULT_PARK_ATTRACTION_SLOTS } from './parkAttractionSlots'
import type { AttractionId } from './topStore'
import type { ParkZoneId } from './parkZones'

export type AttractionFootprint = {
  /** 本体の半幅・半奥行き（ローカル） */
  halfWidth: number
  halfDepth: number
  doorHalfWidth: number
  /** 正面から奥へ開けるアルコーブ深さ */
  alcoveDepth: number
  /** 追加の当たりボックス（ローカル中心・半サイズ） */
  extraBoxes?: Array<{ x: number; z: number; halfX: number; halfZ: number }>
}

export type Attraction = {
  id: AttractionId
  zoneId: ParkZoneId
  title: string
  subtitle: string
  description: {
    en: string
    ja: string
  }
  storyTitle: {
    en: string
    ja: string
  }
  color: string
  roofColor: string
  /** 所属ゾーン内のワールド XZ */
  x: number
  z: number
  /** 入口トリガーのワールド Z（正面すぐ前） */
  entranceZ: number
  footprint: AttractionFootprint
  /** 説明看板のローカル xz */
  infoBoardLocal: [number, number]
  /** 入口看板を工事中表示（施設自体は enter 可） */
  underConstruction?: boolean
}

export const TOP_ATTRACTIONS: Attraction[] = [
  {
    id: 'find',
    zoneId: 'plaza',
    title: 'FIND THE MEEBIT',
    subtitle: 'The Museum',
    description: {
      en: 'Crowd in the gallery.\nOne face stands out.',
      ja: '美術館の群衆。\nひとりだけ違う。',
    },
    storyTitle: {
      en: 'FIND ONE',
      ja: 'ひとり探せ',
    },
    color: '#d4cdc2',
    roofColor: '#3a3530',
    x: 0,
    z: -7.4,
    entranceZ: -3.8,
    footprint: {
      halfWidth: 5.2,
      halfDepth: 3.4,
      doorHalfWidth: 1.35,
      alcoveDepth: 2.4,
      extraBoxes: [
        { x: -4.5, z: 0.2, halfX: 1.3, halfZ: 2.2 },
        { x: 4.5, z: 0.2, halfX: 1.3, halfZ: 2.2 },
      ],
    },
    infoBoardLocal: [5.8, 3.6],
  },
  {
    id: 'traits',
    zoneId: 'plaza',
    title: 'TRAIT HUNT',
    subtitle: 'The Match Hall',
    description: {
      en: 'Hat, hair, glasses.\nFind your match.',
      ja: '帽子、髪、服。\n同じ顔を探せ。',
    },
    storyTitle: {
      en: 'SAME TRAIT',
      ja: '同じ特徴',
    },
    color: '#143848',
    roofColor: '#0a1c28',
    x: -16,
    z: -10.2,
    entranceZ: -6.4,
    footprint: {
      halfWidth: 3.2,
      halfDepth: 3.2,
      doorHalfWidth: 1.25,
      alcoveDepth: 2.2,
    },
    // 入口正面から見て建物左側
    infoBoardLocal: [-4.6, 3.8],
  },
  {
    id: 'street',
    zoneId: 'plaza',
    title: '8TH STREET',
    subtitle: 'The Night Alley',
    description: {
      en: 'Same alley. Same night.\nOne stranger walks.',
      ja: '同じ路地、同じ夜。\n見知らぬ顔がいる。',
    },
    storyTitle: {
      en: 'WRONG FACE',
      ja: '見知らぬ顔',
    },
    color: '#7a4538',
    roofColor: '#241820',
    x: 16,
    z: -10.2,
    entranceZ: -6.4,
    footprint: {
      halfWidth: 2.6,
      halfDepth: 3.5,
      doorHalfWidth: 1.15,
      alcoveDepth: 2.3,
      extraBoxes: [{ x: -3.4, z: -0.6, halfX: 2.0, halfZ: 2.4 }],
    },
    infoBoardLocal: [-5.2, 3.5],
  },
  {
    id: 'mountain',
    zoneId: 'mountain',
    title: 'MT. MEEB',
    subtitle: 'The Summit',
    description: {
      en: 'New path every dawn.\nJump to the top.',
      ja: '毎朝、道が変わる。\n頂まで跳べ。',
    },
    storyTitle: {
      en: 'CLIMB TODAY',
      ja: '今日の山',
    },
    color: '#6a7a58',
    roofColor: '#e8eef4',
    x: DEFAULT_PARK_ATTRACTION_SLOTS.center.x,
    z: DEFAULT_PARK_ATTRACTION_SLOTS.center.z,
    entranceZ: DEFAULT_PARK_ATTRACTION_SLOTS.center.entranceZ,
    footprint: {
      halfWidth: 3.6,
      halfDepth: 3.8,
      doorHalfWidth: 1.25,
      alcoveDepth: 2.4,
      extraBoxes: [
        { x: -3.0, z: -1.4, halfX: 1.2, halfZ: 1.6 },
        { x: 3.0, z: -1.2, halfX: 1.1, halfZ: 1.5 },
      ],
    },
    infoBoardLocal: [-5.6, 4.2],
  },
  {
    id: 'neon',
    zoneId: 'mountain',
    title: 'JERRY MOUNTAIN',
    subtitle: 'Neon Cliffs',
    description: {
      en: 'Neon jelly blocks.\nStack your way up.',
      ja: 'ネオンのゼリー。\n積み上げて登れ。',
    },
    storyTitle: {
      en: 'JELLY CLIMB',
      ja: 'ゼリー登れ',
    },
    color: '#1a0a30',
    roofColor: '#ff2bd6',
    // 半棟分左寄せ（旧 -12.5 → footprint halfWidth 約 3.2）
    x: DEFAULT_PARK_ATTRACTION_SLOTS.west.x,
    z: DEFAULT_PARK_ATTRACTION_SLOTS.west.z,
    entranceZ: DEFAULT_PARK_ATTRACTION_SLOTS.west.entranceZ,
    footprint: {
      halfWidth: 3.2,
      halfDepth: 3.5,
      doorHalfWidth: 1.15,
      alcoveDepth: 2.2,
      extraBoxes: [
        { x: -2.6, z: -1.2, halfX: 1.0, halfZ: 1.4 },
        { x: 2.6, z: -1.0, halfX: 1.0, halfZ: 1.3 },
      ],
    },
    infoBoardLocal: [-5.2, 4.0],
  },
  {
    id: 'shooting',
    zoneId: 'mountain',
    title: 'SHOOTING GALLERY',
    subtitle: 'The Fair Booth',
    description: {
      en: 'Moving targets.\nGold rings. Red bites.',
      ja: '的が動く。\n金の的、赤の的。',
    },
    storyTitle: {
      en: 'AIM & FIRE',
      ja: '的を狙え',
    },
    color: '#6a5038',
    roofColor: '#c8a060',
    x: DEFAULT_PARK_ATTRACTION_SLOTS.east.x,
    z: DEFAULT_PARK_ATTRACTION_SLOTS.east.z,
    entranceZ: DEFAULT_PARK_ATTRACTION_SLOTS.east.entranceZ,
    footprint: {
      halfWidth: 3.2,
      halfDepth: 3.5,
      doorHalfWidth: 1.15,
      alcoveDepth: 2.2,
      extraBoxes: [
        { x: -2.6, z: -1.2, halfX: 1.0, halfZ: 1.4 },
        { x: 2.6, z: -1.0, halfX: 1.0, halfZ: 1.3 },
      ],
    },
    infoBoardLocal: [5.2, 4.0],
  },
  {
    id: 'runway',
    zoneId: 'culture',
    title: 'MEEBITS RUNWAY',
    subtitle: 'The Catwalk',
    description: {
      en: 'One color tonight.\nMeebits on the runway.',
      ja: '今夜決まった色。\nMeebitが歩く。',
    },
    storyTitle: {
      en: "TODAY'S COLOR",
      ja: '今日の色',
    },
    color: '#1a1a1a',
    roofColor: '#f5f5f5',
    x: DEFAULT_PARK_ATTRACTION_SLOTS.center.x,
    z: DEFAULT_PARK_ATTRACTION_SLOTS.center.z,
    entranceZ: DEFAULT_PARK_ATTRACTION_SLOTS.center.entranceZ,
    footprint: {
      halfWidth: 3.4,
      halfDepth: 3.6,
      doorHalfWidth: 1.25,
      alcoveDepth: 2.3,
      extraBoxes: [
        { x: -2.8, z: -1.0, halfX: 1.0, halfZ: 1.4 },
        { x: 2.8, z: -1.0, halfX: 1.0, halfZ: 1.4 },
      ],
    },
    infoBoardLocal: [5.4, 4.0],
  },
  {
    id: 'closet',
    zoneId: 'culture',
    title: 'LOOK LOCKER',
    subtitle: 'The Fitting Room',
    description: {
      en: 'Swap hats and hair.\nSee yourself anew.',
      ja: '帽子も髪も変えられる。\n別の自分になる。',
    },
    storyTitle: {
      en: 'TRY IT ON',
      ja: 'きせ替え',
    },
    color: '#1a2a48',
    roofColor: '#6a9ee8',
    // 半個分左寄せ（旧 -12.5 → footprint halfWidth 約 3.2）
    x: DEFAULT_PARK_ATTRACTION_SLOTS.west.x,
    z: DEFAULT_PARK_ATTRACTION_SLOTS.west.z,
    entranceZ: DEFAULT_PARK_ATTRACTION_SLOTS.west.entranceZ,
    footprint: {
      halfWidth: 3.2,
      halfDepth: 3.5,
      doorHalfWidth: 1.15,
      alcoveDepth: 2.2,
      extraBoxes: [
        { x: -2.6, z: -1.2, halfX: 1.0, halfZ: 1.4 },
        { x: 2.6, z: -1.0, halfX: 1.0, halfZ: 1.3 },
      ],
    },
    infoBoardLocal: [-5.2, 4.0],
  },
  {
    id: 'pfp',
    zoneId: 'culture',
    title: 'PHOTO BOOTH',
    subtitle: 'Visit Pass',
    description: {
      en: 'Studio light. One shot.\nYour visit pass.',
      ja: 'スタジオで一枚。\n来場証明書付き。',
    },
    storyTitle: {
      en: 'ONE SQUARE SHOT',
      ja: '正方形一枚',
    },
    color: '#1a2438',
    roofColor: '#8eb4e8',
    x: DEFAULT_PARK_ATTRACTION_SLOTS.east.x,
    z: DEFAULT_PARK_ATTRACTION_SLOTS.east.z,
    entranceZ: DEFAULT_PARK_ATTRACTION_SLOTS.east.entranceZ,
    footprint: {
      halfWidth: 3.2,
      halfDepth: 3.5,
      doorHalfWidth: 1.15,
      alcoveDepth: 2.2,
      extraBoxes: [
        { x: -2.6, z: -1.2, halfX: 1.0, halfZ: 1.4 },
        { x: 2.6, z: -1.0, halfX: 1.0, halfZ: 1.3 },
      ],
    },
    infoBoardLocal: [5.2, 4.0],
  },
  {
    id: 'fishing',
    zoneId: 'sea',
    title: 'SHORE FISHING',
    subtitle: 'Cast & Catch',
    description: {
      en: 'Shadow on the shore.\nOne cast, one bite.',
      ja: '岸辺の魚影。\n一振りで決める。',
    },
    storyTitle: {
      en: 'FISH ON!',
      ja: '魚影を狙え',
    },
    color: '#b89870',
    roofColor: '#3a6a88',
    x: DEFAULT_PARK_ATTRACTION_SLOTS.west.x,
    z: DEFAULT_PARK_ATTRACTION_SLOTS.west.z,
    // 正面ドア (z + halfDepth = -8.0) のすぐ手前 — アルコーブ奥まで入らなくても発火
    entranceZ: -7.85,
    footprint: {
      halfWidth: 3.2,
      halfDepth: 3.5,
      doorHalfWidth: 1.15,
      alcoveDepth: 2.2,
      extraBoxes: [
        { x: -2.6, z: -1.2, halfX: 1.0, halfZ: 1.4 },
        { x: 2.6, z: -1.0, halfX: 1.0, halfZ: 1.3 },
      ],
    },
    infoBoardLocal: [5.2, 4.0],
  },
  {
    id: 'opensea',
    zoneId: 'sea',
    title: 'OPENSEA MARKET',
    subtitle: 'Live Listings',
    description: {
      en: 'Meebits on pedestals.\nSome just sold.',
      ja: '台座の彫刻たち。\n売れた体もある。',
    },
    storyTitle: {
      en: 'LIVE GALLERY',
      ja: '彫刻ギャラリー',
    },
    color: '#1b4f8a',
    roofColor: '#2081e2',
    x: DEFAULT_PARK_ATTRACTION_SLOTS.center.x,
    z: DEFAULT_PARK_ATTRACTION_SLOTS.center.z,
    // 正面ドア (z + halfDepth = -3.5) のすぐ手前
    entranceZ: -3.35,
    footprint: {
      halfWidth: 3.4,
      halfDepth: 3.5,
      doorHalfWidth: 1.25,
      alcoveDepth: 2.2,
      extraBoxes: [
        { x: -2.7, z: -1.1, halfX: 1.0, halfZ: 1.35 },
        { x: 2.7, z: -1.0, halfX: 1.0, halfZ: 1.3 },
      ],
    },
    infoBoardLocal: [5.4, 4.0],
  },
  {
    id: 'sergito',
    zoneId: 'sea',
    title: 'MEET SERGITO',
    subtitle: 'The Workshop',
    description: {
      en: 'Wood shop by the sea\nFigures on shelves.',
      ja: '海辺の木の工房。\n棚に並ぶ人形たち。',
    },
    storyTitle: {
      en: 'Sergito Awaits',
      ja: 'Sergitoが待つ',
    },
    color: '#c8b898',
    roofColor: '#6a8098',
    x: 12.5,
    z: -11.0,
    // 正面ドア (z + halfDepth = -7.5) のすぐ手前 — 旧 -8.0 だとアルコーブ奥まで入らないと発火していた
    entranceZ: -7.35,
    footprint: {
      halfWidth: 3.2,
      halfDepth: 3.5,
      doorHalfWidth: 1.15,
      alcoveDepth: 2.2,
      extraBoxes: [
        { x: -2.6, z: -1.2, halfX: 1.0, halfZ: 1.4 },
        { x: 2.6, z: -1.0, halfX: 1.0, halfZ: 1.3 },
      ],
    },
    infoBoardLocal: [5.2, 4.0],
  },
  {
    id: 'starlight',
    zoneId: 'astro',
    title: 'STARLIGHT RUSH',
    subtitle: 'The Cosmic Coaster',
    description: {
      en: 'Ride the rails.\nShoot the stars.',
      ja: 'レールに乗って、\n流れ星を撃つ。',
    },
    storyTitle: {
      en: 'STAR RAILS',
      ja: '星のレール',
    },
    color: '#1a2234',
    roofColor: '#5ce0ff',
    x: DEFAULT_PARK_ATTRACTION_SLOTS.center.x,
    z: DEFAULT_PARK_ATTRACTION_SLOTS.center.z,
    entranceZ: DEFAULT_PARK_ATTRACTION_SLOTS.center.entranceZ,
    footprint: {
      halfWidth: 3.2,
      halfDepth: 3.5,
      doorHalfWidth: 1.15,
      alcoveDepth: 2.2,
      extraBoxes: [
        { x: -2.6, z: -1.2, halfX: 1.0, halfZ: 1.4 },
        { x: 2.6, z: -1.0, halfX: 1.0, halfZ: 1.3 },
      ],
    },
    infoBoardLocal: [5.2, 4.0],
  },
]

export function getAttractionsForZone(zoneId: ParkZoneId) {
  return TOP_ATTRACTIONS.filter((attraction) => attraction.zoneId === zoneId)
}

export function getAttractionById(id: AttractionId) {
  return TOP_ATTRACTIONS.find((attraction) => attraction.id === id) ?? null
}
