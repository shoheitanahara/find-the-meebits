/** Meebits Runway 会場の寸法・演出タイミング。白黒基調の暗室。 */

export const RUNWAY = {
  /** 室内の歩行可能半サイズ（壁側席で視点を回してもカメラが壁に食い込まない幅） */
  roomHalfX: 13.0,
  roomMinZ: -13.5,
  /** 手前（入口側）を広げて観客スペースを確保 */
  roomMaxZ: 16.5,
  wallHeight: 6.2,
  ceilingY: 6.0,
  /** 手前壁の入口半幅 */
  entranceHalf: 4.2,

  /** 入口付近にスポーン（ランウェイ方向を向く） */
  playerStart: { x: 0, z: 12.8, rotationY: Math.PI },
  moveSpeed: 7,
  playerRadius: 0.42,
  /**
   * プレイヤー group Y（+Y = 上）。
   * VRMLoader 内蔵 +0.06 との合成で見た目調整。Runway では +0.05 前後。
   */
  playerGroundY: -0.05,
  /** ベンチ group Y（負 = 下） */
  benchGroundY: 0.04,
  /** 脚を床方向へ延長（正 = 下へ埋める） */
  benchLegEmbed: 0.09,
  /** 着席 VRM group Y（benchGroundY に合わせて調整） */
  audienceSeatY: -0.06,
  /** ベンチ当たり判定（RunwayRoom の box 2.4×0.7、local X=長辺 / local Z=奥行） */
  benchCollision: {
    /** 列の端（前後に隣ベンチがない側） */
    halfLengthOuter: 1.15,
    /** 前後の隣ベンチとの間（local X の列間側） */
    halfLengthGap: 0.72,
    /** 座席側の半奥行（local +Z＝ランウェイ列 / 壁列では local -Z） */
    halfDepthSeat: 0.3,
    /** 2列間の通路側（local -Z＝ランウェイ列 / 壁列では local +Z） */
    halfDepthAisle: 0.18,
    /** 背もたれ側（local -Z）へ中心をずらす量 */
    backShift: 0.28,
    /** 同列ベンチの z 間隔（config.benches の並び） */
    rowSpacing: 4.0,
  },

  /** ランウェイ（中央・奥→手前）。先端は観客エリアの手前で止める */
  runwayHalfWidth: 1.15,
  runwayStartZ: -10.2,
  runwayEndZ: 2.8,
  runwayY: 0.12,
  pauseZ: 1.6,
  modelWalkSpeed: 1.55,
  pauseSeconds: 2.8,

  /** プレイヤーがパークへ戻る出口（入口すぐ手前） */
  playerExit: {
    x: 0,
    z: 14.6,
    halfX: 1.8,
    halfZ: 1.1,
  },

  /** より水平寄りの三人称視点（デフォルトはプレイヤー後方 +Z） */
  cameraFollow: { x: 0, y: 2.85, z: 5.6 },
  cameraLookY: 1.45,
  /** 三人称のまま視点を回す（マウス / タッチ） */
  orbitPitchMaxUp: (28 * Math.PI) / 180,
  orbitPitchMaxDown: (18 * Math.PI) / 180,
  mouseLookSensitivity: 0.0024,
  touchLookSensitivity: 0.0065,

  /** 背面スクリーン */
  screen: {
    x: 0,
    y: 3.15,
    z: -12.85,
    width: 8.0,
    height: 4.2,
  },

  /** 客席ベンチ（左右×2列。1列目の |x|=5.6 を基準に壁側へ ROW_GAP） */
  benches: [
    // 左・ランウェイ側
    { x: -5.6, z: -6.5, rotationY: Math.PI / 2 },
    { x: -5.6, z: -2.5, rotationY: Math.PI / 2 },
    { x: -5.6, z: 1.5, rotationY: Math.PI / 2 },
    { x: -5.6, z: 6.5, rotationY: Math.PI / 2 },
    // 左・壁側（2列目）
    { x: -7.8, z: -6.5, rotationY: Math.PI / 2 },
    { x: -7.8, z: -2.5, rotationY: Math.PI / 2 },
    { x: -7.8, z: 1.5, rotationY: Math.PI / 2 },
    { x: -7.8, z: 6.5, rotationY: Math.PI / 2 },
    // 右・ランウェイ側
    { x: 5.6, z: -6.5, rotationY: -Math.PI / 2 },
    { x: 5.6, z: -2.5, rotationY: -Math.PI / 2 },
    { x: 5.6, z: 1.5, rotationY: -Math.PI / 2 },
    { x: 5.6, z: 6.5, rotationY: -Math.PI / 2 },
    // 右・壁側（2列目）
    { x: 7.8, z: -6.5, rotationY: -Math.PI / 2 },
    { x: 7.8, z: -2.5, rotationY: -Math.PI / 2 },
    { x: 7.8, z: 1.5, rotationY: -Math.PI / 2 },
    { x: 7.8, z: 6.5, rotationY: -Math.PI / 2 },
  ] as const,

  colors: {
    floor: '#141414',
    wall: '#1a1a1a',
    ceiling: '#0c0c0c',
    runway: '#f4f4f4',
    runwayEdge: '#ffffff',
    seat: '#f2f2f2',
    seatAccent: '#e8e8e8',
    screenBg: '#050505',
    screenText: '#f5f5f5',
    accent: '#ffffff',
  },
} as const

export type RunwayAudienceSeat = {
  meebitNumber: number
  x: number
  z: number
  rotationY: number
  sitY: number
}
