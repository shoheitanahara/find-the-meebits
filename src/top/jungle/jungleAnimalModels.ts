/**
 * Jungle の動物（豚・牛・羊）のボクセルモデル。
 * 胴体・頭などの動かない部分は VoxelBuilder の1モデルにまとめ、
 * 脚だけは歩行で振るので別パーツ（腰を支点にした箱）として返す。
 *
 * 座標: 足元の中心が原点、+Z が頭の向き（前）。
 */
import { VoxelBuilder, type VoxelModel } from '../voxel/voxelBuilder'
import type { AnimalSpecies } from './jungleConfig'

type Vec3 = readonly [number, number, number]

export type AnimalLeg = {
  /** 腰（回転の支点）の位置 */
  hip: Vec3
  /** 脚の太さと長さ */
  width: number
  length: number
  color: string
  hoofColor: string
}

export type AnimalModel = {
  body: VoxelModel
  legs: AnimalLeg[]
  /** 歩く速さ（m/s） */
  walkSpeed: number
  /** 脚の振りの速さ（歩幅の細かさ） */
  strideRate: number
}

/** 0〜1 の決定的ハッシュ */
function hash3(x: number, y: number, z: number, seed: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + seed * 19.19) * 43758.5453
  return n - Math.floor(n)
}

/**
 * 表面のセルごとに色を選んで箱を積む（ぶち模様・毛のむらなど）。
 * pick は各セルの中心座標と表面フラグを受け取り色を返す。
 */
function paintedBox(
  b: VoxelBuilder,
  center: Vec3,
  size: Vec3,
  cell: number,
  pick: (x: number, y: number, z: number) => string,
) {
  const nx = Math.max(1, Math.round(size[0] / cell))
  const ny = Math.max(1, Math.round(size[1] / cell))
  const nz = Math.max(1, Math.round(size[2] / cell))
  const sx = size[0] / nx
  const sy = size[1] / ny
  const sz = size[2] / nz
  for (let ix = 0; ix < nx; ix += 1) {
    for (let iy = 0; iy < ny; iy += 1) {
      for (let iz = 0; iz < nz; iz += 1) {
        const surface =
          ix === 0 || ix === nx - 1 || iy === 0 || iy === ny - 1 || iz === 0 || iz === nz - 1
        if (!surface) continue
        const x = center[0] - size[0] / 2 + sx * (ix + 0.5)
        const y = center[1] - size[1] / 2 + sy * (iy + 0.5)
        const z = center[2] - size[2] / 2 + sz * (iz + 0.5)
        b.box([x, y, z], [sx, sy, sz], pick(ix, iy, iz))
      }
    }
  }
}

/**
 * 正面（+Z）に Meebits のような目を左右対称に付ける。
 * 白目は使わず、黒い点（四角）か黒い横線だけ。個体ごとに交互に変える。
 */
function addEyes(
  b: VoxelBuilder,
  faceZ: number,
  y: number,
  spread: number,
  size: number,
  variant: number,
  style: 'alternate' | 'line' = 'alternate',
) {
  const ink = '#141012'
  const line = style === 'line' || variant % 2 === 1
  for (const side of [-1, 1] as const) {
    if (line) {
      b.box([side * spread, y, faceZ + 0.01], [size * 1.6, size * 0.4, 0.02], ink)
    } else {
      b.box([side * spread, y, faceZ + 0.01], [size, size, 0.02], ink)
    }
  }
}

/** 牛・羊は脚を短め（元の約半分）にする。胴体はこのぶん下げる */
const COW_LEG_DROP = 0.35
const SHEEP_LEG_DROP = 0.28

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.max(0, Math.round(((n >> 16) & 255) * amount)))
  const g = Math.min(255, Math.max(0, Math.round(((n >> 8) & 255) * amount)))
  const bl = Math.min(255, Math.max(0, Math.round((n & 255) * amount)))
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}`
}

/** 豚: 丸みのあるピンクの胴、大きな鼻、垂れ耳、くるっとした尻尾 */
function buildPig(variant: number): AnimalModel {
  const b = new VoxelBuilder()
  const skin = variant % 2 === 0 ? '#e8a4ac' : '#dc98a2'
  const skinDark = shade(skin, 0.86)
  const snout = '#d4808e'

  paintedBox(b, [0, 0.62, -0.02], [0.72, 0.5, 1.0], 0.125, (x, y, z) =>
    hash3(x, y, z, variant) < 0.18 ? skinDark : skin,
  )
  // 頭
  paintedBox(b, [0, 0.72, 0.62], [0.52, 0.46, 0.36], 0.13, (x, y, z) =>
    hash3(x, y, z, variant + 7) < 0.15 ? skinDark : skin,
  )
  // 鼻（鼻の穴つき）
  b.box([0, 0.64, 0.84], [0.26, 0.17, 0.08], snout)
  for (const side of [-1, 1] as const) {
    b.box([side * 0.06, 0.64, 0.885], [0.05, 0.06, 0.02], '#5a2a34')
  }
  addEyes(b, 0.8, 0.8, 0.14, 0.08, variant)
  // 垂れ耳
  for (const side of [-1, 1] as const) {
    b.box([side * 0.19, 0.95, 0.66], [0.13, 0.05, 0.16], skinDark)
    b.box([side * 0.21, 0.9, 0.75], [0.12, 0.08, 0.05], skinDark)
  }
  // 尻尾（くるっと2段）
  b.box([0, 0.72, -0.56], [0.06, 0.06, 0.08], skinDark)
  b.box([0.05, 0.78, -0.6], [0.06, 0.06, 0.06], skinDark)

  const legs: AnimalLeg[] = []
  for (const x of [-0.22, 0.22]) {
    for (const z of [-0.32, 0.32]) {
      legs.push({ hip: [x, 0.38, z], width: 0.17, length: 0.38, color: skinDark, hoofColor: '#5a4048' })
    }
  }
  return { body: b.build(), legs, walkSpeed: 0.75, strideRate: 9 }
}

/** 牛: 大きな胴にぶち模様、短い角、明るい鼻先 */
function buildCow(variant: number): AnimalModel {
  const b = new VoxelBuilder()
  const base = '#ece6dc'
  const patch = variant % 2 === 0 ? '#2a2422' : '#7a4a30'
  const patchDark = shade(patch, 0.85)

  // 脚を短くしたぶん、胴体ごと下げる
  b.group([0, -COW_LEG_DROP, 0], () => {
    // ぶち模様: 大きめのまだらにする（セル座標を粗く量子化してハッシュ）
    paintedBox(b, [0, 1.05, -0.05], [0.9, 0.75, 1.5], 0.15, (x, y, z) => {
      const blob = hash3(Math.floor(x / 2), Math.floor(y / 2), Math.floor(z / 2), variant + 3)
      return blob < 0.42 ? (hash3(x, y, z, variant) < 0.2 ? patchDark : patch) : base
    })
    // 頭
    paintedBox(b, [0, 1.22, 0.92], [0.56, 0.5, 0.44], 0.14, (x, y, z) =>
      hash3(Math.floor(x / 2), y, Math.floor(z / 2), variant + 11) < 0.5 ? patch : base,
    )
    // 鼻先
    b.box([0, 1.06, 1.17], [0.44, 0.22, 0.1], '#e4b8a8')
    for (const side of [-1, 1] as const) {
      b.box([side * 0.1, 1.06, 1.225], [0.06, 0.06, 0.02], '#5a3a34')
    }
    addEyes(b, 1.14, 1.3, 0.16, 0.09, variant)
    // 角と耳
    for (const side of [-1, 1] as const) {
      b.box([side * 0.3, 1.5, 0.88], [0.12, 0.09, 0.09], '#e0d4b0')
      b.box([side * 0.36, 1.56, 0.88], [0.06, 0.08, 0.07], '#c8b890')
      b.box([side * 0.34, 1.32, 0.84], [0.14, 0.09, 0.1], patch)
    }
    // 乳房と尻尾
    b.box([0, 0.62, -0.38], [0.3, 0.1, 0.3], '#e8b0b4')
    b.box([0, 1.0, -0.82], [0.07, 0.5, 0.07], patch)
    b.box([0, 0.72, -0.82], [0.1, 0.1, 0.1], patchDark)

  })

  const legs: AnimalLeg[] = []
  for (const x of [-0.3, 0.3]) {
    for (const z of [-0.56, 0.5]) {
      legs.push({
        hip: [x, 0.7 - COW_LEG_DROP, z],
        width: 0.22,
        length: 0.7 - COW_LEG_DROP,
        color: base,
        hoofColor: '#3a3030',
      })
    }
  }
  return { body: b.build(), legs, walkSpeed: 0.55, strideRate: 9 }
}

/** 羊: ふかふかの毛の胴（でこぼこ）、ベージュの顔、垂れ耳 */
function buildSheep(variant: number): AnimalModel {
  const b = new VoxelBuilder()
  const wool = variant % 4 === 3 ? '#9a9690' : '#ece6d6'
  const woolShade = shade(wool, 0.88)
  // 顔は明るいベージュ（黒い目が見えるように）。脚は焦げ茶
  const face = '#c8b49a'
  const legColor = '#4a3e38'

  // 脚を短くしたぶん、胴体ごと下げる
  b.group([0, -SHEEP_LEG_DROP, 0], () => {
    paintedBox(b, [0, 0.86, -0.02], [0.86, 0.66, 1.16], 0.145, (x, y, z) =>
      hash3(x, y, z, variant) < 0.3 ? woolShade : wool,
    )
    // 毛のでこぼこ（上面と側面に小さな塊）
    for (let i = 0; i < 9; i += 1) {
      const r1 = hash3(i, 1, 2, variant)
      const r2 = hash3(i, 3, 4, variant)
      const r3 = hash3(i, 5, 6, variant)
      const side = r3 < 0.33 ? -1 : r3 < 0.66 ? 1 : 0
      const size = 0.16 + r1 * 0.08
      if (side === 0) {
        b.box([(r1 - 0.5) * 0.6, 1.2, (r2 - 0.5) * 0.9], [size, 0.08, size], r2 < 0.5 ? wool : woolShade)
      } else {
        b.box([side * 0.45, 0.8 + r1 * 0.2, (r2 - 0.5) * 0.9], [0.06, size, size], r1 < 0.5 ? wool : woolShade)
      }
    }
    // 頭（顔）＋毛の帽子
    paintedBox(b, [0, 0.98, 0.68], [0.36, 0.4, 0.34], 0.12, () => face)
    b.box([0, 1.21, 0.64], [0.42, 0.1, 0.3], wool)
    b.box([0, 0.86, 0.86], [0.2, 0.1, 0.03], shade(face, 0.75))
    // 羊は黒点だと目力が強すぎるので、柔らかい横線だけにする
    addEyes(b, 0.85, 1.04, 0.1, 0.07, variant, 'line')
    // 耳: 豚・牛と同じく小さく厚みのある板。真横へ控えめに出して、先だけ少し下げる
    const earColor = shade(face, 0.82)
    for (const side of [-1, 1] as const) {
      b.box([side * 0.22, 1.09, 0.64], [0.09, 0.07, 0.13], earColor)
      b.box([side * 0.285, 1.05, 0.64], [0.07, 0.06, 0.11], earColor)
    }
    // 尻尾
    b.box([0, 0.96, -0.62], [0.14, 0.14, 0.08], woolShade)
  })

  const legs: AnimalLeg[] = []
  for (const x of [-0.24, 0.24]) {
    for (const z of [-0.38, 0.38]) {
      legs.push({
        hip: [x, 0.56 - SHEEP_LEG_DROP, z],
        width: 0.14,
        length: 0.56 - SHEEP_LEG_DROP,
        color: legColor,
        hoofColor: '#1e1a18',
      })
    }
  }
  return { body: b.build(), legs, walkSpeed: 0.62, strideRate: 10.5 }
}

export function buildAnimalModel(species: AnimalSpecies, variant: number): AnimalModel {
  switch (species) {
    case 'pig':
      return buildPig(variant)
    case 'cow':
      return buildCow(variant)
    case 'sheep':
      return buildSheep(variant)
  }
}
