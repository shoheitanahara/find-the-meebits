import {
  DEFAULT_INFO_BOARD_LOCAL,
  DEFAULT_PARK_ATTRACTION_SLOTS,
  infoBoardNearEntrance,
} from './parkAttractionSlots'
import { EIGHTH_STREET_ICON } from './landmarks/eighthStreetModel'
import { HIP_HOP_ICON } from './landmarks/hipHopClubModel'
import { JAZZ_BAR_ICON } from './landmarks/jazzBarModel'
import { LEARN_ART_ICON } from './landmarks/learnArtModel'
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
      en: 'A packed gallery.\nFind the odd face.',
      ja: '人でいっぱいの美術館。\nまぎれた一人を探す。',
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
    infoBoardLocal: infoBoardNearEntrance('right', 3.4),
  },
  {
    id: 'podcast',
    zoneId: 'plaza',
    title: 'MEEBITS PODCAST',
    subtitle: 'The Studio',
    description: {
      en: 'Sit by the mic.\nListen to the show.',
      ja: 'マイクの前の席。\n番組を観て聴ける。',
    },
    storyTitle: {
      en: 'ON AIR',
      ja: 'オンエア',
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
      en: 'The same alley.\nSpot what’s changed.',
      ja: '同じ路地、同じ夜。\nどこか一つ、おかしい。',
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
      en: 'New route each day.\nClimb to the summit.',
      ja: '毎日、ルートが変わる。\n跳んで登って、頂上へ。',
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
      en: 'Glowing jelly steps.\nHop block to block.',
      ja: '光るゼリーの足場。\n一段ずつ跳んで上がる。',
    },
    storyTitle: {
      en: 'JELLY CLIMB',
      ja: 'ゼリーを登る',
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
      en: 'Hit moving targets.\nGold and red score.',
      ja: '動く的を次々撃つ。\n金と赤の的が混ざる。',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'runway',
    zoneId: 'culture',
    title: 'MEEBITS RUNWAY',
    subtitle: 'The Catwalk',
    description: {
      en: 'Color of the day.\nSit back and watch.',
      ja: '今日の色のランウェイ。\n客席からゆっくり見る。',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'closet',
    zoneId: 'culture',
    title: 'LOOK LOCKER',
    subtitle: 'The Fitting Room',
    description: {
      en: 'Swap hats and hair.\nBefore and after.',
      ja: '帽子や髪を取り替える。\nいまの姿と比べる。',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.left,
  },
  {
    id: 'pfp',
    zoneId: 'culture',
    title: 'PHOTO BOOTH',
    subtitle: 'Visit Pass',
    description: {
      en: 'Pose in the studio.\nGet your visit pass.',
      ja: 'スタジオで撮ろう！\n来場者パスを受けよう！',
    },
    storyTitle: {
      en: 'PROFILE PIC',
      ja: 'プロフィール画像をつくろう',
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
      en: 'Cast at the shadows.\nReel in the big one.',
      ja: '岸辺に魚の影。\n投げて、大物を狙う。',
    },
    storyTitle: {
      en: 'FISH ON!',
      ja: '魚影をねらう',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'opensea',
    zoneId: 'sea',
    title: 'OPENSEA MARKET',
    subtitle: 'Live Listings',
    description: {
      en: 'Meebits on display.\nLook at each one.',
      ja: '台座に並ぶ彫刻。\n一体ずつ眺める。',
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
      en: 'Woodshop by the sea.\nSergito, in person.',
      ja: '海辺の木の工房。\n見た目に一言くれる。',
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
      en: 'Ride the rails.\nShoot falling stars.',
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
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'cinema',
    zoneId: 'astro',
    title: 'MEEBIT CINEMA',
    subtitle: 'Origins Hall',
    description: {
      en: 'The first Meebits.\nOn the big screen.',
      ja: 'はじまりの顔たち。\n大画面で観る。',
    },
    storyTitle: {
      en: 'FIRST MEEBITS',
      ja: 'はじまりの映画',
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
      en: 'Hats, hair, glasses.\nFind the same trait.',
      ja: '帽子や髪を見比べる。\n同じ特徴を探す。',
    },
    storyTitle: {
      en: 'SAME TRAIT',
      ja: '同じ特徴',
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
      en: 'Stand up and dance.\nNo seats tonight.',
      ja: '椅子はない。\n音に合わせて踊る。',
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
        // 建物横の巨大ラジカセ彫刻
        HIP_HOP_ICON,
      ],
    },
    infoBoardLocal: infoBoardNearEntrance('left', 3.4),
  },
  {
    id: 'learnArt',
    zoneId: 'musicArt',
    title: 'LEARN ART',
    subtitle: 'Contemporary Docs',
    description: {
      en: 'Sit down and watch.\nArt documentaries.',
      ja: '座って観る、\n現代アートの記録映像。',
    },
    storyTitle: {
      en: 'GALLERY SCREEN',
      ja: 'ギャラリースクリーン',
    },
    color: '#1c1228',
    roofColor: '#e85cff',
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
        // 建物横のイーゼル彫刻
        LEARN_ART_ICON,
      ],
    },
    infoBoardLocal: DEFAULT_INFO_BOARD_LOCAL.right,
  },
  {
    id: 'jazzBar',
    zoneId: 'musicArt',
    title: 'JAZZ BAR',
    subtitle: 'Blue Note Seats',
    description: {
      en: 'Sit by the stage.\nJazz plays all night.',
      ja: 'ステージ横の席。\nジャズが流れる夜。',
    },
    storyTitle: {
      en: 'LIVE SET',
      ja: '今夜のセット',
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
        // 建物横のサックス彫刻
        JAZZ_BAR_ICON,
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
