/** Hip Hop Club — 正面スクリーン＋ダンスフロア（座席なし）。 */

/** Hip-Hop プレイリスト */
export const CLUB_YOUTUBE_PLAYLIST_ID = 'PLDIoUOhQQPlXFSnCfj8HuVhOUSC0QwxYD'
/** プレイリスト先頭の代表動画（ロード時のシード） */
export const CLUB_YOUTUBE_VIDEO_ID = 'YNwmYliuUfE'
export const CLUB_SHOW_TITLE = 'Hip Hop Club'
export const CLUB_SHOW_CREDIT = 'Meebits Park'

export const CLUB = {
  roomHalfX: 11.5,
  roomMinZ: -13.0,
  roomMaxZ: 14.5,
  wallHeight: 9.2,
  ceilingY: 9.0,
  entranceHalf: 3.6,

  playerStart: { x: 0, z: 11.8, rotationY: Math.PI },
  moveSpeed: 7.4,
  playerRadius: 0.42,
  playerGroundY: -0.05,

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

  /** 中央ダンスフロア（障害物なし） */
  danceFloor: {
    halfX: 7.2,
    halfZ: 6.4,
    z: 2.2,
  },

  colors: {
    floor: '#120818',
    wall: '#1c1024',
    ceiling: '#0c0610',
    dance: '#2a1438',
    danceAlt: '#3a1c48',
    danceEdge: '#e85cff',
    carpet: '#1a0c20',
    screenFrame: '#180818',
    screenBg: '#08040c',
    accent: '#e85cff',
    accentWarm: '#ffc46a',
  },
} as const
