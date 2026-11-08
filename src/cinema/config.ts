/** Meebit Cinema — ドキュメンタリー上映室（スクリーン向き客席）。 */

export const CINEMA_YOUTUBE_VIDEO_ID = 'sY9OyRo4E58'
export const CINEMA_FILM_TITLE = 'Meebit Origins'
export const CINEMA_FILM_CREDIT = 'By Larva Labs'

/** 客席の目標占有率（日替わりで前後に振る） */
export const CINEMA_OCCUPANCY = 0.6

export const CINEMA = {
  roomHalfX: 11.5,
  roomMinZ: -13.0,
  roomMaxZ: 14.5,
  /** 大スクリーン（約1.5倍）に合わせて天井を上げる */
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

  /** ベンチ当たり（正面向き・local X=長辺 / local Z=奥行） */
  benchCollision: {
    halfLength: 1.15,
    halfDepthSeat: 0.32,
    halfDepthAisle: 0.2,
    /** 背もたれ側（入場側 = +Z）へ中心をずらす */
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

  /**
   * 奥壁に開けたスクリーン開口（16:9）。
   * z は奥壁前面付近。映像は壁に張り付くように配置する。
   */
  screen: {
    x: 0,
    y: 4.4,
    z: -12.78,
    /** 旧 9.6×5.4 の約 1.5 倍（16:9） */
    width: 14.4,
    height: 8.1,
  },
  /** 奥壁の厚み（開口計算と共通） */
  backWallThickness: 0.4,

  /**
   * 通路 X（カーペット＋フロアライト）。
   * ±4.1 = 1-2-1 の中央すき間、±9.2 = 左右脇（壁寄り）。
   */
  aisleXs: [-9.2, -4.1, 4.1, 9.2] as const,
  aisleCarpetWidth: 1.6,
  /** 通路に沿った足元灯の Z（入口→スクリーン） */
  aisleLightZs: [-2.0, 1.8, 5.6, 9.4] as const,

  /**
   * 客席ベンチ。すべてスクリーン向き（rotationY = π → 背もたれは入口側）。
   * 各列は 1-2-1（左1・中央2・右1）。左右のすき間が通路。
   */
  benches: [
    // 前列
    { x: -6.8, z: -3.2, rotationY: Math.PI },
    { x: -1.4, z: -3.2, rotationY: Math.PI },
    { x: 1.4, z: -3.2, rotationY: Math.PI },
    { x: 6.8, z: -3.2, rotationY: Math.PI },
    // 2列目
    { x: -6.8, z: 0.6, rotationY: Math.PI },
    { x: -1.4, z: 0.6, rotationY: Math.PI },
    { x: 1.4, z: 0.6, rotationY: Math.PI },
    { x: 6.8, z: 0.6, rotationY: Math.PI },
    // 3列目
    { x: -6.8, z: 4.4, rotationY: Math.PI },
    { x: -1.4, z: 4.4, rotationY: Math.PI },
    { x: 1.4, z: 4.4, rotationY: Math.PI },
    { x: 6.8, z: 4.4, rotationY: Math.PI },
    // 後列
    { x: -6.8, z: 8.2, rotationY: Math.PI },
    { x: -1.4, z: 8.2, rotationY: Math.PI },
    { x: 1.4, z: 8.2, rotationY: Math.PI },
    { x: 6.8, z: 8.2, rotationY: Math.PI },
  ] as const,

  colors: {
    floor: '#12151c',
    wall: '#1a2030',
    ceiling: '#0a0c12',
    seat: '#2a3144',
    seatAccent: '#3a4560',
    carpet: '#1e1520',
    screenFrame: '#0e1018',
    screenBg: '#050508',
    accent: '#5ce0ff',
    accentWarm: '#ffb45c',
  },
} as const
