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
      en: 'Somewhere in the museum,\none Meebit is waiting.\nCan you find them?',
      ja: '美術館のどこかで、\nひとりのMeebitが待っている。\n見つけ出せるかな？',
    },
    storyTitle: {
      en: 'THE LOST MEEBIT',
      ja: '待っているMeebit',
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
      en: 'Hair, clothes, accessories!\nFind the Meebits that match\nthe trait clues.',
      ja: '髪型、服、アクセサリー！\nヒントと同じ特徴を持つ\nMeebitを探そう！',
    },
    storyTitle: {
      en: 'MATCH THE TRAITS!',
      ja: '同じ特徴を探そう！',
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
    infoBoardLocal: [4.6, 3.8],
  },
  {
    id: 'street',
    zoneId: 'plaza',
    title: '8TH STREET',
    subtitle: 'The Night Alley',
    description: {
      en: 'The alley repeats after dark.\nNotice what changed and\nfind the way out.',
      ja: '同じ夜の路地が繰り返す。\n小さな変化を見破り、\n出口へたどり着け。',
    },
    storyTitle: {
      en: 'THE REPEATING ALLEY',
      ja: '繰り返す夜の路地',
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
      en: 'Scale the voxel mountain\nwith jumps and dashes.\n20 stages up to 1000m.',
      ja: 'ジャンプとダッシュで\nボクセルの山を登ろう。\n全20ステージ・約1000m。',
    },
    storyTitle: {
      en: 'CLIMB MT. MEEB',
      ja: 'Mt. Meeb へ登れ',
    },
    color: '#6a7a58',
    roofColor: '#e8eef4',
    x: 0,
    z: -7,
    entranceZ: -3.2,
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
      en: 'Jelly cliffs. Black void.\nClimb — or drop.',
      ja: 'ゼリーの崖。奈落の空。\n登れ。落ちるな。',
    },
    storyTitle: {
      en: 'STACK UP',
      ja: '積んで登れ',
    },
    color: '#1a0a30',
    roofColor: '#ff2bd6',
    // 半棟分左寄せ（旧 -12.5 → footprint halfWidth 約 3.2）
    x: -15.7,
    z: -11.5,
    entranceZ: -8.0,
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
    id: 'runway',
    zoneId: 'culture',
    title: 'MEEBITS RUNWAY',
    subtitle: 'The Catwalk',
    description: {
      en: 'One color. Many Meebits.\nWatch the show — grab a seat if you can.',
      ja: 'ひとつの色。たくさんのMeebit。\nショーを見る。空席なら座る。',
    },
    storyTitle: {
      en: "TODAY'S COLOR WALKS",
      ja: '本日の色が歩く',
    },
    color: '#1a1a1a',
    roofColor: '#f5f5f5',
    x: 0,
    z: -7.0,
    entranceZ: -3.2,
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
      en: 'Pick hats, hair, shirts…\nSee who matches —\ntry them on as your avatar.',
      ja: '帽子、髪型、シャツ…\n合うMeebitを見つけて、\nきせかえてみよう。',
    },
    storyTitle: {
      en: 'TRY ON',
      ja: 'ためしてみよう',
    },
    color: '#1a2a48',
    roofColor: '#6a9ee8',
    // 半個分左寄せ（旧 -12.5 → footprint halfWidth 約 3.2）
    x: -15.7,
    z: -11.5,
    entranceZ: -8.0,
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
    id: 'sergito',
    zoneId: 'sea',
    title: 'MEET SERGITO',
    subtitle: 'The Workshop',
    description: {
      en: 'Step into Sergito’s workshop.\nHe’ll take a look at your Meebit\nand share a few honest words.',
      ja: 'Sergitoの工房へ。\nあなたのMeebitを見て、\n短いコメントをくれるよ。',
    },
    storyTitle: {
      en: 'YOUR MEEBIT, UP CLOSE',
      ja: 'あなたのMeebitを見てもらう',
    },
    color: '#c8b898',
    roofColor: '#6a8098',
    x: 12.5,
    z: -11.0,
    entranceZ: -8.0,
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
    underConstruction: true,
  },
]

export function getAttractionsForZone(zoneId: ParkZoneId) {
  return TOP_ATTRACTIONS.filter((attraction) => attraction.zoneId === zoneId)
}

export function getAttractionById(id: AttractionId) {
  return TOP_ATTRACTIONS.find((attraction) => attraction.id === id) ?? null
}
