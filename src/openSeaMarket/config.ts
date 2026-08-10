/** OpenSea Market 室内定数（床面積おおよそ3倍: 線形 ~√3） */

const ROOM_SCALE = 1.75

export const OPEN_SEA_MARKET = {
  roomHalfX: 9.5 * ROOM_SCALE,
  roomMinZ: -9.5 * ROOM_SCALE,
  roomMaxZ: 9.5 * ROOM_SCALE,
  wallHeight: 5.4,
  ceilingY: 5.2,
  entranceHalf: 2.4 * ROOM_SCALE,

  playerStart: { x: 0, z: 5.8 * ROOM_SCALE, rotationY: Math.PI },
  moveSpeed: 7.5,
  playerRadius: 0.42,
  playerGroundY: -0.05,

  playerExit: {
    x: 0,
    z: 8.6 * ROOM_SCALE,
    halfX: 2.4,
    halfZ: 0.55,
  },

  cameraFollow: { x: 0, y: 3.1, z: 6.2 },
  cameraLookY: 1.45,
  orbitPitchMaxUp: (28 * Math.PI) / 180,
  orbitPitchMaxDown: (18 * Math.PI) / 180,
  mouseLookSensitivity: 0.0024,
  touchLookSensitivity: 0.0065,

  talkRadius: 2.35,
  npcWalkSpeed: 1.2,

  /** 同時表示上限 */
  maxNpcsDesktop: 30,
  maxNpcsMobile: 30,

  /** 徘徊スポーン／歩行の壁からの余白（対話カメラが壁抜けしないよう広め） */
  walkerSpawnHalfX: 6.4 * ROOM_SCALE,
  walkerSpawnHalfZ: 5.8 * ROOM_SCALE,
  walkerWallMargin: 2.4,

  /** 通常追従／対話カメラの室内クランプ余白 */
  cameraRoomMarginX: 1.15,
  cameraRoomMarginZNear: 1.4,
  cameraRoomMarginZFar: 1.15,

  colors: {
    floor: '#1e3350',
    floorAccent: '#2a4664',
    wall: '#1a3048',
    wallAccent: '#2081e2',
    beam: '#122033',
    accent: '#2081e2',
    glow: '#7ec4ff',
  },
} as const

export type MarketObstacle = {
  x: number
  z: number
  halfX: number
  halfZ: number
}

export const MARKET_OBSTACLES: MarketObstacle[] = [
  { x: -5.2 * ROOM_SCALE, z: -4.5 * ROOM_SCALE, halfX: 1.1 * ROOM_SCALE, halfZ: 0.7 * ROOM_SCALE },
  { x: 5.2 * ROOM_SCALE, z: -4.5 * ROOM_SCALE, halfX: 1.1 * ROOM_SCALE, halfZ: 0.7 * ROOM_SCALE },
  { x: -5.2 * ROOM_SCALE, z: 2.2 * ROOM_SCALE, halfX: 1.0 * ROOM_SCALE, halfZ: 0.65 * ROOM_SCALE },
  { x: 5.2 * ROOM_SCALE, z: 2.2 * ROOM_SCALE, halfX: 1.0 * ROOM_SCALE, halfZ: 0.65 * ROOM_SCALE },
  { x: 0, z: -6.8 * ROOM_SCALE, halfX: 2.2 * ROOM_SCALE, halfZ: 0.55 * ROOM_SCALE },
  { x: -10 * ROOM_SCALE * 0.55, z: 8 * ROOM_SCALE * 0.35, halfX: 1.0, halfZ: 0.7 },
  { x: 10 * ROOM_SCALE * 0.55, z: 8 * ROOM_SCALE * 0.35, halfX: 1.0, halfZ: 0.7 },
]
