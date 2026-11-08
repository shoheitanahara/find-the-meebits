/** Meebits Podcast Studio — シアター型リスニングルーム（スクリーン向き客席）。 */

/** The Meebits Podcast プレイリスト */
export const PODCAST_YOUTUBE_PLAYLIST_ID = 'PLAjEcldIrSTh1UpCbai6Vf6SgXGwLk8Gr'
/** プレイリスト先頭の代表動画（ロード時のシード） */
export const PODCAST_YOUTUBE_VIDEO_ID = 'MHWFaUKmlOA'
export const PODCAST_SHOW_TITLE = 'The Meebits Podcast'
export const PODCAST_SHOW_CREDIT = 'Meebits'

/** 客席の目標占有率 */
export const PODCAST_OCCUPANCY = 0.6

export const PODCAST = {
  roomHalfX: 11.5,
  roomMinZ: -13.0,
  roomMaxZ: 14.5,
  wallHeight: 9.2,
  ceilingY: 9.0,
  entranceHalf: 3.6,

  playerStart: { x: 0, z: 11.8, rotationY: Math.PI },
  moveSpeed: 7,
  playerRadius: 0.42,
  playerGroundY: -0.05,
  benchGroundY: 0.04,
  benchLegEmbed: 0.09,
  audienceSeatY: -0.06,

  benchCollision: {
    halfLength: 1.15,
    halfDepthSeat: 0.32,
    halfDepthAisle: 0.2,
    backShift: 0.26,
  },

  playerExit: {
    x: 0,
    z: 13.2,
    halfX: 1.8,
    halfZ: 1.0,
  },

  cameraFollow: { x: 0, y: 2.7, z: 5.2 },
  cameraLookY: 1.4,
  orbitPitchMaxUp: (26 * Math.PI) / 180,
  orbitPitchMaxDown: (16 * Math.PI) / 180,
  mouseLookSensitivity: 0.0024,
  touchLookSensitivity: 0.0065,

  screen: {
    x: 0,
    y: 4.4,
    z: -12.78,
    width: 14.4,
    height: 8.1,
  },
  backWallThickness: 0.4,

  /**
   * 通路 X（カーペット＋フロアライト）。
   * ±4.1 = 1-2-1 の中央すき間、±9.2 = 左右脇（壁寄り）。
   */
  aisleXs: [-9.2, -4.1, 4.1, 9.2] as const,
  aisleCarpetWidth: 1.6,
  aisleLightZs: [-2.0, 1.8, 5.6, 9.4] as const,

  /** 各列 1-2-1 */
  benches: [
    { x: -6.8, z: -3.2, rotationY: Math.PI },
    { x: -1.4, z: -3.2, rotationY: Math.PI },
    { x: 1.4, z: -3.2, rotationY: Math.PI },
    { x: 6.8, z: -3.2, rotationY: Math.PI },
    { x: -6.8, z: 0.6, rotationY: Math.PI },
    { x: -1.4, z: 0.6, rotationY: Math.PI },
    { x: 1.4, z: 0.6, rotationY: Math.PI },
    { x: 6.8, z: 0.6, rotationY: Math.PI },
    { x: -6.8, z: 4.4, rotationY: Math.PI },
    { x: -1.4, z: 4.4, rotationY: Math.PI },
    { x: 1.4, z: 4.4, rotationY: Math.PI },
    { x: 6.8, z: 4.4, rotationY: Math.PI },
    { x: -6.8, z: 8.2, rotationY: Math.PI },
    { x: -1.4, z: 8.2, rotationY: Math.PI },
    { x: 1.4, z: 8.2, rotationY: Math.PI },
    { x: 6.8, z: 8.2, rotationY: Math.PI },
  ] as const,

  colors: {
    floor: '#1a1410',
    wall: '#2a221c',
    ceiling: '#120e0c',
    seat: '#3a2a22',
    seatAccent: '#5a4030',
    carpet: '#241810',
    screenFrame: '#1a120c',
    screenBg: '#080604',
    accent: '#ff9a3c',
    accentWarm: '#ffc878',
  },
} as const
