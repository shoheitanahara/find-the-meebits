import { VRM_WORLD_SCALE } from '../game/gameConfig'

/** OpenSea Market 室内定数 — Digital Sculpture 展示ホール */
const ROOM_SCALE = 2.7

const ENTRANCE_HALF = 2.4 * ROOM_SCALE
const PLAYER_RADIUS = 0.42
/**
 * 出口・ギャラリー移動口に着いたとき、判定の端からさらに内側へ離す距離。
 * パークの橋の門（GATE_ARRIVAL_CLEARANCE）と同じ考え方で、入口・移動口のすぐ内側に立たせる。
 */
const ARRIVAL_CLEARANCE = 1.2

/**
 * 出口（公園へ戻る）。入口の開口幅いっぱいに取り、
 * パッドの手前端（z - halfZ）から入口の壁際までのどこを歩いても出られる（isInMarketExitZone）。
 */
const ROOM_MAX_Z = 9.5 * ROOM_SCALE
/** 出口パッドを入口の壁からどれだけ内側に置くか（入口のすぐ内側） */
const EXIT_INSET_FROM_ENTRANCE = 1.6

const PLAYER_EXIT = {
  x: 0,
  z: ROOM_MAX_Z - EXIT_INSET_FROM_ENTRANCE,
  // 入口の開口（±ENTRANCE_HALF）と同じ幅。開口の端は壁にぶつからず壁際まで歩けるため
  halfX: ENTRANCE_HALF,
  halfZ: 0.55,
} as const

/** 左右ギャラリー接続ゲートの入室判定の深さ（壁から） */
const GALLERY_GATE_TRIGGER_DEPTH = 1.15

export const OPEN_SEA_MARKET = {
  roomHalfX: 9.5 * ROOM_SCALE,
  roomMinZ: -9.5 * ROOM_SCALE,
  roomMaxZ: ROOM_MAX_Z,
  wallHeight: 5.8,
  ceilingY: 5.6,
  entranceHalf: ENTRANCE_HALF,

  /** 入場位置: 出口判定の手前端から ARRIVAL_CLEARANCE 内側（入口のすぐ内側）、奥を向く */
  playerStart: {
    x: 0,
    z: PLAYER_EXIT.z - PLAYER_EXIT.halfZ - ARRIVAL_CLEARANCE,
    rotationY: Math.PI,
  },
  moveSpeed: 7.5,
  playerRadius: PLAYER_RADIUS,
  playerGroundY: -0.05,

  playerExit: PLAYER_EXIT,

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
  /** 48時間以内の売却をギャラリーへ混ぜる上限 */
  maxRecentSales: 10,
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
    triggerDepth: GALLERY_GATE_TRIGGER_DEPTH,
    /** 到着スポーン: 入室判定の端から ARRIVAL_CLEARANCE 内側（移動口のすぐ内側） */
    spawnInsetX: GALLERY_GATE_TRIGGER_DEPTH + ARRIVAL_CLEARANCE,
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

/**
 * 出口の判定。横は入口の開口幅いっぱい、奥行きはパッドの手前端から入口の壁際まで。
 * 入口の端寄りを歩いても、パッドを飛び越えて壁際まで進んでも出られる。
 */
export function isInMarketExitZone(x: number, z: number) {
  const { playerExit } = OPEN_SEA_MARKET
  return Math.abs(x - playerExit.x) <= playerExit.halfX && z >= playerExit.z - playerExit.halfZ
}
