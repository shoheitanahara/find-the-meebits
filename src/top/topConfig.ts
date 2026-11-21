import {
  DEFAULT_INFO_BOARD_LOCAL,
  DEFAULT_PARK_ATTRACTION_SLOTS,
  infoBoardNearEntrance,
} from './parkAttractionSlots'
import { EIGHTH_STREET_ICON } from './landmarks/eighthStreetModel'
import { SERGITO_ICON } from './landmarks/meetSergitoModel'
import { SHORE_FISHING_ICON } from './landmarks/shoreFishingModel'
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
  /** 説明看板のローカル xz（標準は DEFAULT_INFO_BOARD_LOCAL） */
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
      en: 'A crowded museum.\nFind the target Meebit.',
      ja: '人でいっぱいの美術館。\nターゲットの Meebit を探そう。',
    },
    storyTitle: {
      en: 'FIND THE TARGET',
      ja: 'ターゲットを探せ',
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
    infoBoardLocal: infoBoardNearEntrance('right', 3.4),
  },
  {
    id: 'podcast',
    zoneId: 'plaza',
    title: 'MEEBITS PODCAST',
    subtitle: 'The Studio',
    description: {
      en: 'Take a seat by the mics.\nWatch the Meebits podcast.',
      ja: 'マイクの前の席に座って、\nMeebits のポッドキャストを観よう。',
    },
    storyTitle: {
      en: 'ON AIR',
      ja: 'オンエア中',
    },
    color: '#2a1c14',
    roofColor: '#ff9a3c',
    x: -16,
    z: -10.2,
    entranceZ: -6.4,
    footprint: {
      halfWidth: 3.2,
      halfDepth: 3.2,
      doorHalfWidth: 1.25,
      alcoveDepth: 2.2,
    },
    infoBoardLocal: infoBoardNearEntrance('left', 3.2),
  },
  {
    id: 'street',
    zoneId: 'plaza',
    title: '8TH STREET',
    subtitle: 'The Night Alley',
    description: {
      en: 'Remember the usual faces.\nA stranger? Turn back.',
      ja: 'いつもの顔ぶれを覚えて。\n見慣れない人がいたら引き返そう。',
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
      extraBoxes: [
        { x: -3.4, z: -0.6, halfX: 2.0, halfZ: 2.4 },
        // 建物横の街灯彫刻
        EIGHTH_STREET_ICON,
      ],
    },
    infoBoardLocal: infoBoardNearEntrance('left', 3.5),
  },
  {
    id: 'mountain',
    zoneId: 'mountain',
    title: 'MT. MEEB',
    subtitle: 'The Summit',
    description: {
      en: 'A new route every day.\nJump your way to the top.',
      ja: '毎日ルートが変わる山。\n跳んで登って、頂上をめざそう。',
    },
    storyTitle: {
      en: 'CLIMB TODAY',
      ja: '今日の山に挑む',
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
    infoBoardLocal: infoBoardNearEntrance('left', 3.8),
  },
  {
    id: 'neon',
    zoneId: 'mountain',
    title: 'JERRY MOUNTAIN',
    subtitle: 'Neon Cliffs',
    description: {
      en: 'Glowing jelly blocks.\nHop up one step at a time.',
      ja: '光るゼリーの足場。\n一段ずつ跳んで登ろう。',
    },
    storyTitle: {
      en: 'JELLY CLIMB',
      ja: 'ゼリーを登れ',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.left,
  },
  {
    id: 'shooting',
    zoneId: 'mountain',
    title: 'SHOOTING GALLERY',
    subtitle: 'The Fair Booth',
    description: {
      en: '45 seconds of moving targets.\nHit the gold. Never the red.',
      ja: '45秒で、動く的を撃ちまくろう。\n金はねらい目、赤は撃たない。',
    },
    storyTitle: {
      en: 'AIM & FIRE',
      ja: '的をねらえ',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'runway',
    zoneId: 'culture',
    title: 'MEEBITS RUNWAY',
    subtitle: 'The Catwalk',
    description: {
      en: 'A new theme color every day.\nWatch the show from your seat.',
      ja: '毎日テーマカラーが変わるショー。\n客席からゆっくり観よう。',
    },
    storyTitle: {
      en: "TODAY'S COLOR",
      ja: '今日のテーマカラー',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'closet',
    zoneId: 'culture',
    title: 'LOOK LOCKER',
    subtitle: 'The Fitting Room',
    description: {
      en: 'Try on hats and hair.\nCompare with your look now.',
      ja: '帽子や髪を試着して、\nいまの姿と見くらべよう。',
    },
    storyTitle: {
      en: 'TRY IT ON',
      ja: '試着してみよう',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.left,
  },
  {
    id: 'pfp',
    zoneId: 'culture',
    title: 'PHOTO BOOTH',
    subtitle: 'Portrait Studio',
    description: {
      en: 'Strike a pose in the studio.\nTake home your Visit Pass.',
      ja: 'スタジオでポーズを決めて、\n来場者パスをもらおう。',
    },
    storyTitle: {
      en: 'PROFILE PIC',
      ja: 'プロフィール写真',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'fishing',
    zoneId: 'sea',
    title: 'SHORE FISHING',
    subtitle: 'Cast & Catch',
    description: {
      en: 'Fish shadows by the shore.\nCast and reel in a big one.',
      ja: '岸辺に魚の影。\n投げて、大物を釣り上げよう。',
    },
    storyTitle: {
      en: 'FISH ON!',
      ja: '大物をねらえ',
    },
    color: '#b89870',
    roofColor: '#3a6a88',
    x: DEFAULT_PARK_ATTRACTION_SLOTS.west.x,
    // シーは外周が海で川がないので、奥へ寄せた旧位置のまま
    z: -11.5,
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
        // 建物横の跳ねる魚の彫刻（右）
        SHORE_FISHING_ICON,
      ],
    },
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.left,
  },
  {
    id: 'opensea',
    zoneId: 'sea',
    title: 'OPENSEA MARKET',
    subtitle: 'Live Listings',
    description: {
      en: 'Meebits listed on OpenSea,\non display as sculptures.',
      ja: 'OpenSea に出ている Meebits を、\n彫刻として展示中。',
    },
    storyTitle: {
      en: 'MEEBIT GALLERY',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'sergito',
    zoneId: 'sea',
    title: 'MEET SERGITO',
    subtitle: 'The Workshop',
    description: {
      en: 'A woodshop by the sea.\nSergito reads your look.',
      ja: '海辺の木の工房。\nSergito が見た目にひとこと。',
    },
    storyTitle: {
      en: 'SERGITO AWAITS',
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
        // 建物横の木彫り Sergito 像
        SERGITO_ICON,
      ],
    },
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'starlight',
    zoneId: 'astro',
    title: 'STARLIGHT RUSH',
    subtitle: 'The Cosmic Coaster',
    description: {
      en: 'Ride the star rails.\nShoot down falling stars.',
      ja: 'レールに乗って星空へ。\n流れ星を撃ち落とそう。',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'cinema',
    zoneId: 'astro',
    title: 'MEEBIT CINEMA',
    subtitle: 'Origins Hall',
    description: {
      en: 'Where the Meebits began,\non the big screen.',
      ja: 'Meebits のはじまりを、\n大きなスクリーンで。',
    },
    storyTitle: {
      en: 'FIRST MEEBITS',
      ja: 'はじまりの物語',
    },
    color: '#141c2c',
    roofColor: '#5ce0ff',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'traits',
    zoneId: 'astro',
    title: 'TRAIT HUNT',
    subtitle: 'The Match Hall',
    description: {
      en: 'Compare hats, hair, glasses.\nFind the matching trait.',
      ja: '帽子や髪、眼鏡を見くらべて、\n同じ特徴の Meebit を探そう。',
    },
    storyTitle: {
      en: 'SAME TRAIT',
      ja: '同じ特徴を探せ',
    },
    color: '#143848',
    roofColor: '#5ce0ff',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'hiphop',
    zoneId: 'musicArt',
    title: 'HIP HOP CLUB',
    subtitle: 'The Dance Floor',
    description: {
      en: 'No seats tonight.\nDance to the beat.',
      ja: '今夜は椅子なし。\nビートに合わせて踊ろう。',
    },
    storyTitle: {
      en: 'ON THE FLOOR',
      ja: 'フロアへ',
    },
    color: '#1c1228',
    roofColor: '#e85cff',
    x: DEFAULT_PARK_ATTRACTION_SLOTS.west.x,
    z: DEFAULT_PARK_ATTRACTION_SLOTS.west.z,
    entranceZ: DEFAULT_PARK_ATTRACTION_SLOTS.west.entranceZ,
    footprint: {
      halfWidth: 3.2,
      halfDepth: 3.4,
      doorHalfWidth: 1.25,
      alcoveDepth: 2.2,
      extraBoxes: [
        { x: -2.7, z: -1.0, halfX: 0.9, halfZ: 1.3 },
        { x: 2.7, z: -1.0, halfX: 0.9, halfZ: 1.3 },
      ],
    },
    infoBoardLocal: infoBoardNearEntrance('left', 3.4),
  },
  {
    id: 'learnArt',
    zoneId: 'musicArt',
    title: 'LEARN ART',
    subtitle: 'Art on Screen',
    description: {
      en: 'Documentaries on modern art.\nSit back and watch.',
      ja: '現代アートのドキュメンタリーを、\n座ってゆっくり観よう。',
    },
    storyTitle: {
      en: 'GALLERY SCREEN',
      ja: 'アートを観る',
    },
    color: '#2a2826',
    roofColor: '#d8c8a8',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'jazzBar',
    zoneId: 'musicArt',
    title: 'JAZZ BAR',
    subtitle: 'Stage-Side Seats',
    description: {
      en: 'Seats right by the stage.\nJazz all night long.',
      ja: 'ステージのすぐ横の席で、\n夜通しジャズを。',
    },
    storyTitle: {
      en: 'LIVE SET',
      ja: '今夜のライブ',
    },
    color: '#121a28',
    roofColor: '#4a8cff',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
]

export function getAttractionsForZone(zoneId: ParkZoneId) {
  return TOP_ATTRACTIONS.filter((attraction) => attraction.zoneId === zoneId)
}

export function getAttractionById(id: AttractionId) {
  return TOP_ATTRACTIONS.find((attraction) => attraction.id === id) ?? null
}
