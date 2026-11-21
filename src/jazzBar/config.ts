/** Jazz Bar — ジャズクラブ風の丸テーブル＋向かい合わせ丸椅子。 */

/** Jazz プレイリスト https://www.youtube.com/watch?v=GjkT_HKJY3o&list=PLSv3kdqpcJmo */
export const JAZZ_BAR_YOUTUBE_PLAYLIST_ID = 'PLSv3kdqpcJmo'
/** プレイリスト先頭の代表動画（ロード時のシード） */
export const JAZZ_BAR_YOUTUBE_VIDEO_ID = 'GjkT_HKJY3o'
export const JAZZ_BAR_SHOW_TITLE = 'Jazz Bar'
export const JAZZ_BAR_SHOW_CREDIT = 'Live Playlist'

/** 客席の目標占有率（日替わりで前後に振る） */
export const JAZZ_BAR_OCCUPANCY = 0.55

const TABLE_ZS = [-5.6, -1.6, 2.4, 6.4] as const
/** 右列を壁から少し離す */
const TABLE_XS = [-6.4, 0, 6.4] as const
/** テーブル中心から左右・前後への椅子オフセット */
const STOOL_DX = 1.15
const STOOL_DZ = 0.92

function buildTables() {
  const tables: Array<{ x: number; z: number }> = []
  for (const x of TABLE_XS) {
    for (const z of TABLE_ZS) {
      tables.push({ x, z })
    }
  }
  return tables
}

/**
 * 各テーブルに4脚（左右×前後）。
 * approachYaw はテーブルから外側（立ち上がり方向）。
 */
function buildStools() {
  const stools: Array<{ x: number; z: number; approachYaw: number }> = []
  const offsets: Array<[number, number]> = [
    [-STOOL_DX, -STOOL_DZ],
    [-STOOL_DX, STOOL_DZ],
    [STOOL_DX, -STOOL_DZ],
    [STOOL_DX, STOOL_DZ],
  ]
  for (const table of buildTables()) {
    for (const [ox, oz] of offsets) {
      const x = table.x + ox
      const z = table.z + oz
      stools.push({
        x,
        z,
        approachYaw: Math.atan2(ox, oz),
      })
    }
  }
  return stools
}

export const JAZZ_BAR = {
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
  stoolGroundY: 0.04,
  tableGroundY: 0.04,
  /** 着席 VRM の group Y（+ = 上） */
  audienceSeatY: -0.02,

  /** 丸椅子・丸テーブルの当たり（近づけるようやや小さめ） */
  stoolCollisionHalf: 0.3,
  tableCollisionHalf: 0.52,

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

  /** 着席時の視線・体の向きの焦点（スクリーン手前） */
  stageFocusZ: -10.4,

  tables: buildTables(),
  stools: buildStools(),

  /** 組と組のあいだの通路カーペット幅 */
  aisleCarpetWidth: 2.4,
  aisleXs: [-3.2, 3.2] as const,
  aisleLightZs: [-4.0, 0.0, 4.0, 8.0] as const,

  colors: {
    floor: '#1a2434',
    wall: '#243448',
    ceiling: '#141c28',
    seat: '#3a4a62',
    seatAccent: '#4a5c78',
    table: '#2a3448',
    tableTop: '#3a4860',
    carpet: '#243040',
    screenFrame: '#1a2430',
    screenBg: '#101820',
    accent: '#6aa8ff',
    accentWarm: '#f0b878',
  },
} as const
