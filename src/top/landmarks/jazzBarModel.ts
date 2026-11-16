/**
 * Jazz Bar — 紺レンガのクラブ。
 * 軒先はピアノ鍵盤、入口にストライプの日よけ、建物の横に金のサックスと音符が立つ。
 */
import { VoxelBuilder, type VoxelModel } from '../voxel/voxelBuilder'
import {
  addEntrance,
  addPlinth,
  bodyBox,
  iconBesideEntrance,
  LANDMARK_LAYOUT,
  type LandmarkEntrance,
} from './landmarkParts'

const COLORS = {
  plinth: '#0c1220',
  brick: '#2c4170',
  trim: '#0e1526',
  cream: '#e4dcc8',
  keyWhite: '#ece8de',
  keyBlack: '#10131c',
  amber: '#ffb65a',
  gold: '#e8ae3c',
  goldHighlight: '#fff0c0',
  blue: '#4a8cff',
  blueSoft: '#9cc2ff',
  iconBase: '#141d34',
  iconStep: '#22325a',
  awningBlue: '#2f5fd0',
  awningCream: '#e8e2d2',
} as const

const BODY_TOP_Y = 4.75

/** サックス彫刻の位置（説明看板の反対側＝左）。当たり判定は topConfig が参照 */
export const JAZZ_BAR_ICON = iconBesideEntrance(-1, 1.25, 0.8)

/** 軒先の鍵盤 */
const KEYBOARD = {
  whiteKeyCount: 16,
  whiteHeight: 0.45,
  whiteDepth: 0.36,
  blackWidth: 0.2,
  blackHeight: 0.26,
  blackDepth: 0.4,
} as const
/** 1オクターブ（白鍵7本）のうち、右隣に黒鍵がある白鍵の位置 */
const WHITE_KEYS_WITH_SHARP = new Set([0, 1, 3, 4, 5])

const SAX_CELL = 0.17
const SAX_ROWS = [
  '.........GGG',
  '.........GG.',
  '........GG..',
  '.......GG...',
  '.......GG...',
  '......GG....',
  '......GG....',
  '.....GGG....',
  '.....GGk....',
  '....GGG.....',
  '....GkG.....',
  '....GGG.....',
  '.G..GGG.....',
  'GG..GkG.....',
  'GG.GGGG.....',
  'GGGGGGG.....',
  '.GGGGG......',
] as const

const NOTE_CELL = 0.13
const BEAMED_NOTE_ROWS = [
  '..XXXXX',
  '..X...X',
  '..X...X',
  '..X...X',
  'XXX.XXX',
  'XXX.XXX',
] as const
const SINGLE_NOTE_ROWS = ['..XX.', '..X.X', '..X..', '..X..', 'XXX..', 'XX...'] as const

const ARCH_WINDOW_ROWS = [
  '.FFFF.',
  'FAAAAF',
  'FAAAAF',
  'FFFFFF',
  'FAAAAF',
  'FAAAAF',
  'FAAAAF',
  'FFFFFF',
] as const

const PORTHOLE_ROWS = ['.FFF.', 'FAAAF', 'FAAAF', 'FAAAF', '.FFF.'] as const

/** 軒先に並ぶピアノ鍵盤（白鍵の上に黒鍵を載せる） */
function addKeyboardCornice(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ } = LANDMARK_LAYOUT
  const pitch = (bodyHalfWidth * 2) / KEYBOARD.whiteKeyCount
  const keyZ = bodyFrontZ - 0.08

  for (let i = 0; i < KEYBOARD.whiteKeyCount; i += 1) {
    const x = -bodyHalfWidth + pitch * (i + 0.5)
    b.box(
      [x, BODY_TOP_Y + KEYBOARD.whiteHeight / 2, keyZ],
      [pitch - 0.035, KEYBOARD.whiteHeight, KEYBOARD.whiteDepth],
      COLORS.keyWhite,
    )
    const hasSharp = i < KEYBOARD.whiteKeyCount - 1 && WHITE_KEYS_WITH_SHARP.has(i % 7)
    if (hasSharp) {
      b.box(
        [x + pitch / 2, BODY_TOP_Y + KEYBOARD.whiteHeight - KEYBOARD.blackHeight / 2 + 0.05, keyZ + 0.02],
        [KEYBOARD.blackWidth, KEYBOARD.blackHeight, KEYBOARD.blackDepth],
        COLORS.keyBlack,
      )
    }
  }

  // 鍵盤下の青ネオン
  b.box([0, BODY_TOP_Y - 0.05, bodyFrontZ + 0.04], [bodyHalfWidth * 2, 0.07, 0.06], COLORS.blue, {
    glow: true,
  })
}

/** 正面のアーチ窓・壁付けランタンと、側面の丸窓 */
function addWindows(b: VoxelBuilder) {
  const { bodyHalfWidth, bodyFrontZ } = LANDMARK_LAYOUT
  const windowPalette = { F: COLORS.cream, A: COLORS.amber }

  for (const side of [-1, 1] as const) {
    b.pixels({
      rows: ARCH_WINDOW_ROWS,
      palette: windowPalette,
      center: [side * 2.3, 1.75, bodyFrontZ],
      cell: 0.2,
      depth: 0.08,
      glow: 'A',
    })
    b.box([side * 2.3, 2.95, bodyFrontZ + 0.1], [0.22, 0.26, 0.2], COLORS.amber, {
      glow: true,
      anim: { kind: 'pulse', phase: side > 0 ? 0 : 1.5 },
    })

    for (const z of [1.2, -1.2]) {
      b.pixels({
        rows: PORTHOLE_ROWS,
        palette: windowPalette,
        center: [side * bodyHalfWidth, 2.5, z],
        cell: 0.22,
        depth: 0.08,
        facing: side > 0 ? 'right' : 'left',
        glow: 'A',
      })
    }
  }
}

/** 入口のストライプ日よけ（2段で前下がり＋前垂れ） */
function addAwning(b: VoxelBuilder, frontZ: number) {
  const stripeCount = 8
  const stripeWidth = 0.4
  for (let i = 0; i < stripeCount; i += 1) {
    const x = (i - (stripeCount - 1) / 2) * stripeWidth
    const color = i % 2 === 0 ? COLORS.awningBlue : COLORS.awningCream
    b.box([x, 3.2, frontZ + 0.15], [stripeWidth, 0.14, 0.4], color)
    b.box([x, 3.05, frontZ + 0.55], [stripeWidth, 0.14, 0.4], color)
    // 前垂れは1本おきに長くしてスカラップ風に
    const valance = i % 2 === 0 ? 0.24 : 0.14
    b.box([x, 2.98 - valance / 2, frontZ + 0.73], [stripeWidth, valance, 0.05], color)
  }
}

/** 建物の横に立つ金のサックスと、順番に灯る音符 */
function addSaxophoneIcon(b: VoxelBuilder) {
  const baseHeight = 0.3
  const stepHeight = 0.2
  const saxBottomY = baseHeight + stepHeight
  const saxThickness = 0.34
  const saxCenterY = saxBottomY + (SAX_ROWS.length * SAX_CELL) / 2

  b.box([0, baseHeight / 2, 0], [2.4, baseHeight, 1.5], COLORS.iconBase)
  b.box([0, baseHeight + stepHeight / 2, 0], [1.9, stepHeight, 1.1], COLORS.iconStep)
  b.box([0, baseHeight - 0.04, 0.76], [2.4, 0.06, 0.04], COLORS.blue, { glow: true })

  // 厚みのある立体ドット絵（キー部分だけ発光）
  b.pixels({
    rows: SAX_ROWS,
    palette: { G: COLORS.gold, k: COLORS.goldHighlight },
    center: [0.1, saxCenterY, -saxThickness / 2],
    cell: SAX_CELL,
    depth: saxThickness,
    glow: 'k',
  })

  const notes: Array<{ rows: readonly string[]; x: number; y: number; color: string; phase: number }> = [
    { rows: BEAMED_NOTE_ROWS, x: -0.6, y: 2.85, color: COLORS.blueSoft, phase: 0 },
    { rows: SINGLE_NOTE_ROWS, x: -1.0, y: 2.05, color: COLORS.amber, phase: 2.1 },
    { rows: SINGLE_NOTE_ROWS, x: 0.85, y: 1.2, color: COLORS.blue, phase: 4.2 },
  ]
  for (const note of notes) {
    b.pixels({
      rows: note.rows,
      palette: { X: note.color },
      center: [note.x, note.y, 0],
      cell: NOTE_CELL,
      depth: 0.1,
      glow: true,
      // 音符ごとに位相をずらして、順番に明滅させる
      anim: () => ({ kind: 'pulse', phase: note.phase }),
    })
  }
}

export function buildJazzBarModel(entrance: LandmarkEntrance): VoxelModel {
  const b = new VoxelBuilder()

  addPlinth(b, entrance.frontZ, COLORS.plinth)
  b.shell({ ...bodyBox(BODY_TOP_Y), cell: 0.5, color: COLORS.brick, jitter: 0.1 })
  addEntrance(b, entrance, { wall: COLORS.brick, trim: COLORS.trim, bulb: COLORS.amber })
  addWindows(b)
  addAwning(b, entrance.frontZ)
  addKeyboardCornice(b)
  b.group([JAZZ_BAR_ICON.x, 0, JAZZ_BAR_ICON.z], addSaxophoneIcon)

  return b.build()
}
