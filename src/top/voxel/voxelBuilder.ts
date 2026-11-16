/**
 * ボクセル建物の組み立てキット（純粋データ生成・描画は VoxelModelMesh）。
 *
 * 1棟ぶんのボクセルを「通常（lit）」と「発光（glow）」の2バッチにまとめるので、
 * ドット絵や装飾をいくら足しても描画コールは 2 のまま。
 *
 * 座標系は Three.js 標準（+X 右 / +Y 上 / +Z 手前＝建物正面）。
 */
import { Color } from 'three'

type Vec3 = readonly [number, number, number]

/** 発光ボクセルの簡易アニメーション（色の明るさだけ変える） */
export type VoxelAnim =
  /** 流れる電球: index 順に光が走る */
  | { kind: 'chase'; index: number }
  /** イコライザ: column の音量レベルより下の row だけ点灯 */
  | { kind: 'eq'; column: number; row: number; rows: number }
  /** ゆっくり明滅（phase でずらす） */
  | { kind: 'pulse'; phase: number }
  /** オン／オフ点滅 */
  | { kind: 'blink'; phase: number }

export type VoxelCell = {
  x: number
  y: number
  z: number
  sx: number
  sy: number
  sz: number
  /** リニア色空間の RGB */
  r: number
  g: number
  b: number
  anim?: VoxelAnim
}

export type VoxelModel = {
  /** ライティングを受ける通常ボクセル */
  lit: VoxelCell[]
  /** 自己発光（ネオン・窓・電球） */
  glow: VoxelCell[]
}

/** ドット絵を貼る向き。front=+Z 正面 / right=+X 壁 / left=-X 壁 / up=屋上（上向き） */
export type VoxelFacing = 'front' | 'right' | 'left' | 'up'

export type BoxOptions = {
  glow?: boolean
  anim?: VoxelAnim
}

export type ShellOptions = {
  center: Vec3
  size: Vec3
  /** ブロック1個の目安サイズ（size を割り切れるよう自動調整） */
  cell: number
  color: string
  /** ブロックごとの明暗ばらつき（0〜1）。レンガ・積みブロックの質感用 */
  jitter?: number
  /** 上面を張るか（上に別の箱が載って見えない場合は false） */
  top?: boolean
}

export type PixelArtOptions = {
  /** 上の行から順に。パレットに無い文字（'.' など）は空白 */
  rows: readonly string[]
  palette: Readonly<Record<string, string>>
  /** 貼り付け面上の中心（front なら z が壁面） */
  center: Vec3
  cell: number
  facing?: VoxelFacing
  /** 面からの出っ張り */
  depth?: number
  /** true=全部発光 / 文字列=その文字だけ発光 */
  glow?: boolean | string
  anim?: (char: string, col: number, row: number) => VoxelAnim | undefined
}

const DEFAULT_JITTER = 0.06
const MIN_EQ_LEVEL = 1

const colorCache = new Map<string, Color>()

function parseColor(hex: string): Color {
  let color = colorCache.get(hex)
  if (!color) {
    color = new Color(hex)
    colorCache.set(hex, color)
  }
  return color
}

/** 0〜1 の決定的ハッシュ（毎回同じ見た目にする） */
function hash3(x: number, y: number, z: number, seed: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 19.19) * 43758.5453
  return n - Math.floor(n)
}

export class VoxelBuilder {
  private readonly lit: VoxelCell[] = []
  private readonly glow: VoxelCell[] = []
  private shellSeed = 0
  private offset: [number, number, number] = [0, 0, 0]

  /**
   * fn 内で置くボクセルをまとめて平行移動する（彫刻などを原点基準で組むため）。
   * 入れ子にした場合は加算される。
   */
  group(offset: Vec3, fn: (builder: this) => void): this {
    const previous = this.offset
    this.offset = [previous[0] + offset[0], previous[1] + offset[1], previous[2] + offset[2]]
    try {
      fn(this)
    } finally {
      this.offset = previous
    }
    return this
  }

  /** 1個の直方体（引き伸ばした1インスタンス）。梁・板・台座向け */
  box(center: Vec3, size: Vec3, color: string, options: BoxOptions = {}): this {
    this.push(center, size, parseColor(color), 1, options.glow ?? false, options.anim)
    return this
  }

  /**
   * 中空の箱をブロックで積む（底面と内部は作らない）。
   * ブロックごとに明暗をばらつかせて、ボクセルらしい壁面にする。
   */
  shell({ center, size, cell, color, jitter = DEFAULT_JITTER, top = true }: ShellOptions): this {
    const base = parseColor(color)
    const seed = this.shellSeed++
    const nx = Math.max(1, Math.round(size[0] / cell))
    const ny = Math.max(1, Math.round(size[1] / cell))
    const nz = Math.max(1, Math.round(size[2] / cell))
    const stepX = size[0] / nx
    const stepY = size[1] / ny
    const stepZ = size[2] / nz
    const minX = center[0] - size[0] / 2
    const minY = center[1] - size[1] / 2
    const minZ = center[2] - size[2] / 2

    for (let ix = 0; ix < nx; ix += 1) {
      for (let iy = 0; iy < ny; iy += 1) {
        for (let iz = 0; iz < nz; iz += 1) {
          const onWall = ix === 0 || ix === nx - 1 || iz === 0 || iz === nz - 1
          const onTop = top && iy === ny - 1
          if (!onWall && !onTop) continue

          const shade = 1 + (hash3(ix, iy, iz, seed) - 0.5) * 2 * jitter
          this.push(
            [minX + stepX * (ix + 0.5), minY + stepY * (iy + 0.5), minZ + stepZ * (iz + 0.5)],
            [stepX, stepY, stepZ],
            base,
            shade,
            false,
          )
        }
      }
    }
    return this
  }

  /**
   * 文字列のドット絵をボクセルで貼る。
   * 同じ行で同色が続く部分は1インスタンスにまとめて軽くする（アニメ付きは個別）。
   */
  pixels({
    rows,
    palette,
    center,
    cell,
    facing = 'front',
    depth = cell * 0.5,
    glow = false,
    anim,
  }: PixelArtOptions): this {
    const colCount = rows.reduce((max, line) => Math.max(max, line.length), 0)
    const midCol = (colCount - 1) / 2
    const midRow = (rows.length - 1) / 2

    rows.forEach((line, row) => {
      let col = 0
      while (col < line.length) {
        const char = line[col]
        const hex = palette[char]
        if (!hex) {
          col += 1
          continue
        }

        const cellAnim = anim?.(char, col, row)
        let run = 1
        if (!cellAnim) {
          while (
            col + run < line.length &&
            line[col + run] === char &&
            !anim?.(char, col + run, row)
          ) {
            run += 1
          }
        }

        // u=絵の横方向 / v=絵の縦方向（上が +）
        const u = (col + (run - 1) / 2 - midCol) * cell
        const v = (midRow - row) * cell
        const isGlow = typeof glow === 'string' ? glow.includes(char) : glow
        const placed = placeOnFace(facing, center, u, v, run * cell, cell, depth)
        this.push(placed.center, placed.size, parseColor(hex), 1, isGlow, cellAnim)
        col += run
      }
    })
    return this
  }

  build(): VoxelModel {
    return { lit: this.lit, glow: this.glow }
  }

  private push(
    center: Vec3,
    size: Vec3,
    color: Color,
    shade: number,
    glow: boolean,
    anim?: VoxelAnim,
  ) {
    const target = glow ? this.glow : this.lit
    target.push({
      x: center[0] + this.offset[0],
      y: center[1] + this.offset[1],
      z: center[2] + this.offset[2],
      sx: size[0],
      sy: size[1],
      sz: size[2],
      r: color.r * shade,
      g: color.g * shade,
      b: color.b * shade,
      anim,
    })
  }
}

/** ドット1個（または横に連結した run）を、貼る面の向きに合わせて配置する */
function placeOnFace(
  facing: VoxelFacing,
  center: Vec3,
  u: number,
  v: number,
  length: number,
  cell: number,
  depth: number,
): { center: Vec3; size: Vec3 } {
  const [cx, cy, cz] = center
  switch (facing) {
    case 'right':
      // +X 壁を外から見ると、絵の右方向は -Z（奥）
      return { center: [cx + depth / 2, cy + v, cz - u], size: [depth, cell, length] }
    case 'left':
      // -X 壁を外から見ると、絵の右方向は +Z（手前）
      return { center: [cx - depth / 2, cy + v, cz + u], size: [depth, cell, length] }
    case 'up':
      // 屋上: 絵の上方向を奥（-Z）に向ける
      return { center: [cx + u, cy + depth / 2, cz - v], size: [length, depth, cell] }
    case 'front':
    default:
      return { center: [cx + u, cy + v, cz + depth / 2], size: [length, cell, depth] }
  }
}

/**
 * アニメーションの明るさ係数（0〜1）。step は一定間隔で進む整数。
 * 毎フレームではなく step が変わったときだけ呼ぶ想定。
 */
export function getVoxelAnimLevel(anim: VoxelAnim, step: number): number {
  switch (anim.kind) {
    case 'chase':
      return (step + anim.index) % 3 === 0 ? 1 : 0.28
    case 'eq': {
      const wave = 0.5 + 0.5 * Math.sin(step * 0.9 + anim.column * 1.9)
      const beat = 0.5 + 0.5 * Math.sin(step * 0.35 + anim.column * 0.7)
      const level = Math.max(
        MIN_EQ_LEVEL,
        Math.round((0.2 + 0.8 * wave * (0.45 + 0.55 * beat)) * anim.rows),
      )
      return anim.row < level ? 1 : 0.1
    }
    case 'pulse':
      return 0.6 + 0.4 * Math.sin(step * 0.55 + anim.phase)
    case 'blink':
      return (Math.floor(step / 4) + anim.phase) % 2 === 0 ? 1 : 0.2
  }
}
