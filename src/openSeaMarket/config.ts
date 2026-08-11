import { VRM_WORLD_SCALE } from '../game/gameConfig'

/** OpenSea Market 室内定数 — Digital Sculpture 展示ホール */
const ROOM_SCALE = 2.7

export const OPEN_SEA_MARKET = {
  roomHalfX: 9.5 * ROOM_SCALE,
  roomMinZ: -9.5 * ROOM_SCALE,
  roomMaxZ: 9.5 * ROOM_SCALE,
  wallHeight: 5.8,
  ceilingY: 5.6,
  entranceHalf: 2.4 * ROOM_SCALE,

  playerStart: { x: 0, z: 6.2 * ROOM_SCALE, rotationY: Math.PI },
  moveSpeed: 7.5,
  playerRadius: 0.42,
  playerGroundY: -0.05,

  playerExit: {
    x: 0,
    z: 8.4 * ROOM_SCALE,
    halfX: 2.6,
    halfZ: 0.55,
  },

  cameraFollow: { x: 0, y: 3.4, z: 6.8 },
  cameraLookY: 1.55,
  orbitPitchMaxUp: (28 * Math.PI) / 180,
  orbitPitchMaxDown: (18 * Math.PI) / 180,
  mouseLookSensitivity: 0.0024,
  touchLookSensitivity: 0.0065,

  /** 台座への接近半径 */
  talkRadius: 2.6,
  npcWalkSpeed: 1.2,

  maxPedestals: 30,
  maxWalkers: 10,
  /** 西・MAIN・東の同一レイアウトギャラリー数 */
  roomCount: 3,
  /** 初期ギャラリー（MAIN） */
  defaultRoomIndex: 1,

  /**
   * 左右ギャラリー接続ゲート（入口付近で Y 字に分岐）。
   * halfWidth = 開口の Z 半幅、triggerDepth = 壁際の入室判定深さ。
   */
  galleryGate: {
    z: 6.2 * ROOM_SCALE,
    halfWidth: 2.35,
    triggerDepth: 1.15,
    /** 到着スポーン: 壁から内側へ */
    spawnInsetX: 3.4,
    spawnZ: 6.2 * ROOM_SCALE,
  },

  /** Digital Sculpture 本体スケール（通常アバターの約2倍） */
  sculptureVrmScale: VRM_WORLD_SCALE * 2,

  /** 黒一枚板台座 */
  pedestal: {
    sizeX: 2.2,
    sizeY: 0.12,
    sizeZ: 2.2,
    topY: 0.12,
    collisionHalf: 1.2,
  },

  /** 入口〜中央の歩行帯 */
  walkerSpawnHalfX: 5.5 * ROOM_SCALE,
  walkerSpawnHalfZ: 4.2 * ROOM_SCALE,
  walkerWallMargin: 3.2,

  cameraRoomMarginX: 1.15,
  cameraRoomMarginZNear: 1.4,
  cameraRoomMarginZFar: 1.15,

  /** 案内歩行NPC向け会話カメラ */
  guideDialogueCamera: {
    distance: 4.6,
    distanceMobile: 5.8,
    heightY: 2.35,
    heightYMobile: 2.1,
    lookY: 1.55,
    lookYMobile: 1.15,
    sideScale: 0.72,
    sideScaleMobile: 0.55,
    forwardScale: 0.48,
    forwardScaleMobile: 0.35,
    /** 注視点: 0=プレイヤー、1=NPC */
    lookBiasTowardNpc: 0.5,
    orbitBiasTowardNpc: 0.5,
  },

  /** 2倍スケール Digital Sculpture — 正面斜め固定（プレイヤー位置非依存） */
  sculptureDialogueCamera: {
    distance: 6.8,
    distanceMobile: 7.8,
    heightY: 3.15,
    heightYMobile: 2.95,
    lookY: 2.35,
    lookYMobile: 2.15,
    /** 正面成分（彫刻の顔向き） */
    forwardScale: 0.78,
    forwardScaleMobile: 0.75,
    /** 横成分（斜め感） */
    sideScale: 0.62,
    sideScaleMobile: 0.58,
    lookBiasTowardNpc: 1,
    orbitBiasTowardNpc: 1,
  },

  colors: {
    floor: '#1e3350',
    floorAccent: '#2a4664',
    wall: '#1a3048',
    wallAccent: '#2081e2',
    beam: '#122033',
    accent: '#2081e2',
    glow: '#7ec4ff',
    pedestal: '#0a0a0c',
    priceTag: '#fbbf24',
  },
} as const

export type MarketObstacle = {
  x: number
  z: number
  halfX: number
  halfZ: number
}

/** 装飾用の低い障害物（台座以外）。現状なし */
export const MARKET_OBSTACLES: MarketObstacle[] = []
