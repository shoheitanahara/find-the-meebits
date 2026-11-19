/** Meet Sergito 工房の寸法・カメラ。Runway と同系統の三人称操作。 */

export const SERGITO_MEEBIT_ID = 17600
export const SERGITO_NPC_ID = 'sergito'

/** 作業デスク天板高（立ち作業） */
export const WORKSHOP_DESK_TOP_Y = 1.05

export const MEET_SERGITO = {
  roomHalfX: 11,
  roomMinZ: -11,
  roomMaxZ: 11,
  wallHeight: 5.2,
  ceilingY: 5.0,
  entranceHalf: 2.5,

  /** 入口から一歩奥（EXIT パッド外） */
  playerStart: { x: 0, z: 5.5, rotationY: Math.PI },
  moveSpeed: 7,
  playerRadius: 0.42,
  playerGroundY: -0.05,

  /** Sergito（作業デスク手前） */
  sergito: { x: 1.6, z: -5.8, rotationY: 0 },
  sergitoTalkRadius: 2.8,
  /** 歩行NPCがこれより近づかない（会話スペース） */
  sergitoKeepAwayRadius: 4.2,

  /** 手前（+Z）入口の床パッドのみ */
  playerExit: {
    x: 0,
    z: 10.2,
    halfX: 2.0,
    halfZ: 0.5,
  },

  cameraFollow: { x: 0, y: 2.85, z: 5.6 },
  cameraLookY: 1.45,
  orbitPitchMaxUp: (28 * Math.PI) / 180,
  orbitPitchMaxDown: (18 * Math.PI) / 180,
  mouseLookSensitivity: 0.0024,
  touchLookSensitivity: 0.0065,

  /** 作業デスク中心（奥壁寄り） */
  desk: { x: -1.2, z: -8.2 },

  colors: {
    floorLight: '#a08060',
    floorDark: '#806848',
    wallPlank: '#c8a880',
    wallPlankDark: '#a89070',
    beam: '#5c4030',
    ceilingPlank: '#b89878',
    wood: '#7a5a3a',
    woodDark: '#4a3828',
    metal: '#3a3a40',
    accent: '#d4a060',
    screen: '#141c30',
    screenGlow: '#5a8ed8',
  },
} as const

export type WorkshopObstacle = {
  x: number
  z: number
  halfX: number
  halfZ: number
}

/**
 * 工房の作業場（見た目は WorkshopStations）。
 * 中央の通路と Sergito のまわりは空け、手前左右と奥の角に置く。
 */
export const WORKSHOP_STATIONS = {
  /** 手前左: 塗装台（塗料・筆・ターンテーブルの塗りかけフィギュア）。フィギュア棚から 2m 以上離す */
  paint: { x: -5.4, z: 4.5 },
  /** 手前右: 3D プリンター作業台。フィギュア棚から 2m 以上離す */
  printer: { x: 5.6, z: 5.0 },
  /** 奥左の角: 材木の束 */
  lumber: { x: -8.6, z: -9.4 },
  /** 奥右の角: 木箱の山 */
  crates: { x: 8.6, z: -9.4 },
  /** 奥左: 木挽き台と板 */
  sawhorse: { x: -5.6, z: -9.3 },
} as const

/** 歩行不可の家具・台座（棚は collisions 側で見た目長さに合わせて追加） */
export const WORKSHOP_OBSTACLES: WorkshopObstacle[] = [
  { x: -1.2, z: -8.2, halfX: 1.55, halfZ: 0.65 },
  { x: WORKSHOP_STATIONS.paint.x, z: WORKSHOP_STATIONS.paint.z, halfX: 0.95, halfZ: 0.55 },
  { x: WORKSHOP_STATIONS.printer.x, z: WORKSHOP_STATIONS.printer.z, halfX: 1.1, halfZ: 0.55 },
  { x: WORKSHOP_STATIONS.lumber.x, z: WORKSHOP_STATIONS.lumber.z, halfX: 1.15, halfZ: 0.9 },
  { x: WORKSHOP_STATIONS.crates.x, z: WORKSHOP_STATIONS.crates.z, halfX: 0.95, halfZ: 0.9 },
  { x: WORKSHOP_STATIONS.sawhorse.x, z: WORKSHOP_STATIONS.sawhorse.z, halfX: 1.05, halfZ: 0.4 },
]
