/**
 * 園内の木（Plaza の街路樹・Mountain の針葉樹）をボクセルで作る。
 * 雪の季節は四角い雪豆腐の板を載せず、枝先にランダムな大きさの雪だまりを少し載せる。
 * ホリデー期間中は華やかなイルミ電球・多色オーナメント・ツリートップの星を飾る。
 */
import { VoxelBuilder, type VoxelModel } from '../voxel/voxelBuilder'

const PALETTE = {
  planterStone: '#383640',
  planterStoneWinter: '#687482',
  planterSoil: '#3a2b1e',
  planterTrim: '#b89454',
  bark: '#563c2a',
  barkDark: '#422d1e',
  leafDeep: '#183c26',
  leafDark: '#214d30',
  leafMid: '#2c603c',
  leafLight: '#3a7248',
  snowTop: '#ebf2fa',
  snowShade: '#cdd9e8',
  starGold: '#ffe484',
} as const

/** オーナメント色（定番クリスマス＋上質なアクセント色） */
const ORNAMENT_COLORS = [
  '#e64545', // ルビーレッド
  '#f2c94c', // ゴールド
  '#46b892', // エメラルド
  '#5aa8f0', // アイスブルー
  '#f27da8', // ローズピンク
  '#f0eff5', // パールホワイト
  '#b884f0', // アメジスト
  '#f59e42', // アンバー
] as const

/** 電球色（暖色ベースのきらめき） */
const FAIRY_LIGHT_COLORS = [
  '#ffe59c',
  '#ffb85c',
  '#fff3d4',
  '#ff8a7a',
  '#9be8ff',
] as const

/** ツリー頂上のボクセル星（立体の十字星） */
function addVoxelStar(b: VoxelBuilder, x: number, y: number, z: number, phaseOffset: number) {
  b.box([x, y, z], [0.16, 0.44, 0.16], PALETTE.starGold, {
    glow: true,
    anim: { kind: 'pulse', phase: phaseOffset },
  })
  b.box([x, y, z], [0.42, 0.16, 0.16], PALETTE.starGold, {
    glow: true,
    anim: { kind: 'pulse', phase: phaseOffset },
  })
  b.box([x, y, z], [0.24, 0.24, 0.24], '#fff6c8', {
    glow: true,
    anim: { kind: 'pulse', phase: phaseOffset },
  })
}

/**
 * 植木鉢の代わりに、地面から幹を立ち上げて根元を張らせる（森の木）。
 * topY までを幹でつなぐ（鉢があった高さ）。
 */
function addWildRoots(b: VoxelBuilder, topY: number) {
  b.box([0, topY / 2, 0], [0.34, topY, 0.34], PALETTE.bark)
  b.box([0, 0.09, 0], [0.62, 0.18, 0.62], PALETTE.barkDark)
  b.box([0.28, 0.05, 0.05], [0.3, 0.1, 0.2], PALETTE.barkDark)
  b.box([-0.22, 0.05, -0.2], [0.24, 0.1, 0.28], PALETTE.barkDark)
}

/**
 * Plaza 向けのボクセル街路樹。
 * christmas 時は葉塊の外周ぐるりに多色オーナメント＋フェアリーライト＋頂上の星を載せる。
 */
export function buildParkGroveTreeModel(
  seed: number,
  christmas: boolean,
  /** 森の木（Jungle）: 植木鉢なしで地面から生やす（冬のイルミネーションは付ける） */
  wild = false,
): VoxelModel {
  const b = new VoxelBuilder()
  const dir = Math.sin(seed * 1.7) >= 0 ? 1 : -1

  if (wild) {
    addWildRoots(b, 0.36)
  } else {
    // 石のプランター＋土
    b.box(
      [0, 0.18, 0],
      [1.32, 0.36, 1.32],
      christmas ? PALETTE.planterStoneWinter : PALETTE.planterStone,
    )
    b.box([0, 0.38, 0], [1.4, 0.06, 1.4], PALETTE.planterTrim)
    b.box([0, 0.4, 0], [1.14, 0.06, 1.14], PALETTE.planterSoil)
    if (christmas) {
      b.box([-0.48, 0.44, 0.45], [0.42, 0.07, 0.38], PALETTE.snowTop)
      b.box([0.42, 0.43, -0.42], [0.46, 0.06, 0.4], PALETTE.snowShade)
    }
  }

  // 根張り＋幹
  b.box([0, 0.56, 0], [0.56, 0.28, 0.56], PALETTE.barkDark)
  b.box([0, 1.15, 0], [0.36, 1.1, 0.36], PALETTE.bark)
  b.box([dir * 0.08, 2.05, 0], [0.3, 0.9, 0.3], PALETTE.bark)

  // 枝分かれ
  b.box([dir * 0.48, 2.32, 0.14], [0.72, 0.2, 0.2], PALETTE.barkDark)
  b.box([-dir * 0.42, 2.52, -0.14], [0.64, 0.2, 0.2], PALETTE.barkDark)
  b.box([0.06, 2.65, dir * 0.34], [0.2, 0.2, 0.56], PALETTE.barkDark)

  // 立体感のある非対称な葉塊
  b.box([0, 2.85, 0], [1.95, 0.85, 1.85], PALETTE.leafDeep)
  b.box([dir * 0.62, 2.95, 0.28], [1.35, 0.88, 1.3], PALETTE.leafDark)
  b.box([-dir * 0.58, 3.12, -0.26], [1.35, 0.9, 1.3], PALETTE.leafMid)
  b.box([dir * 0.18, 3.35, -0.45], [1.25, 0.82, 1.15], PALETTE.leafMid)
  b.box([-dir * 0.15, 3.45, 0.45], [1.2, 0.78, 1.15], PALETTE.leafLight)
  b.box([dir * 0.12, 3.85, 0], [1.35, 0.68, 1.25], PALETTE.leafLight)
  b.box([-dir * 0.1, 4.22, 0.05], [0.85, 0.44, 0.8], PALETTE.leafLight)

  if (christmas) {
    // 葉塊の上のところどころに不揃いな積雪パッチ
    b.box([-0.08, 4.48, 0.04], [0.64, 0.1, 0.58], PALETTE.snowTop)
    b.box([dir * 0.35, 4.22, -0.12], [0.72, 0.09, 0.68], PALETTE.snowTop)
    b.box([-dir * 0.68, 3.6, -0.22], [0.68, 0.09, 0.66], PALETTE.snowShade)
    b.box([dir * 0.72, 3.42, 0.32], [0.64, 0.09, 0.6], PALETTE.snowTop)
    b.box([-dir * 0.25, 3.87, 0.48], [0.58, 0.08, 0.55], PALETTE.snowTop)

    // 多色オーナメント（葉塊の側面・前後にしっかり張り出して飾る）
    const ornaments: Array<readonly [number, number, number]> = [
      // +Z 正面（カメラから最もよく見える面）
      [-0.65, 2.7, 0.99],
      [0.1, 2.65, 0.99],
      [0.65, 2.8, 0.99],
      [-0.45, 3.38, 1.07],
      [0.25, 3.45, 1.07],
      [dir * 0.85, 2.95, 0.98],
      [-dir * 0.72, 3.18, 0.46],
      [0.15, 3.85, 0.68],
      [-0.35, 3.88, 0.66],
      [-0.08, 4.22, 0.5],
      // -Z 背面
      [0.58, 2.75, -0.99],
      [-0.12, 2.68, -0.99],
      [-0.62, 3.05, -0.99],
      [dir * 0.3, 3.42, -1.07],
      [-dir * 0.52, 3.38, -0.96],
      [0.15, 3.86, -0.68],
      // 左右側面
      [dir * 1.34, 2.8, 0.15],
      [dir * 1.34, 3.18, 0.52],
      [-dir * 1.3, 2.9, -0.15],
      [-dir * 1.3, 3.3, -0.52],
      [dir * 0.86, 3.82, -0.18],
      [-dir * 0.6, 4.18, 0.12],
    ]
    // 密度を約 2/3 に間引く（見た目のバランスを保ちつつ控えめに）
    ornaments.forEach(([x, y, z], index) => {
      if (index % 3 === 2) return
      const color = ORNAMENT_COLORS[(index + Math.abs(Math.round(seed))) % ORNAMENT_COLORS.length]
      b.box([x, y, z], [0.19, 0.19, 0.19], color, { glow: true })
    })

    // 枝周りを包むきらめくフェアリーライト（葉面の外側に浮かせて視認性を確保）
    const lights: Array<readonly [number, number, number]> = [
      [-0.92, 2.52, 0.94],
      [-0.28, 2.98, 1.04],
      [0.38, 3.08, 1.04],
      [0.92, 2.55, 0.92],
      [-0.62, 3.68, 1.02],
      [0.02, 3.62, 1.08],
      [0.58, 3.66, 0.98],
      [dir * 1.28, 2.58, 0.72],
      [dir * 1.34, 3.32, 0.05],
      [dir * 1.15, 2.85, -0.62],
      [-dir * 1.24, 2.75, -0.68],
      [-dir * 1.28, 3.45, 0.15],
      [-dir * 1.02, 2.6, 0.65],
      [0.72, 3.45, -1.02],
      [-0.15, 3.55, -1.06],
      [-0.78, 3.95, -0.45],
      [dir * 0.75, 4.02, 0.45],
      [-0.45, 4.08, 0.48],
      [0.32, 4.28, 0.46],
      [-0.36, 4.3, -0.38],
      [0.0, 2.48, -0.98],
      [0.65, 2.55, -0.96],
      [-0.68, 2.58, -0.96],
      [dir * 0.85, 3.68, -0.58],
    ]
    lights.forEach(([x, y, z], index) => {
      if (index % 3 === 2) return
      const color = FAIRY_LIGHT_COLORS[index % FAIRY_LIGHT_COLORS.length]
      b.box([x, y, z], [0.11, 0.11, 0.11], color, {
        glow: true,
        anim: { kind: 'pulse', phase: index * 0.65 + seed },
      })
    })

    addVoxelStar(b, -dir * 0.08, 4.74, 0.04, seed)
  }

  return b.build()
}

/** Mountain 向けの自然な針葉樹（雪板ではなく枝ごとの積雪＋たっぷりイルミ＋オーナメント＋星） */
export function buildParkPineTreeModel(
  seed: number,
  christmas: boolean,
  /** 森の木（Jungle）: 植木鉢なしで地面から生やし、冬も飾りは付けない（雪だけ） */
  wild = false,
): VoxelModel {
  const b = new VoxelBuilder()
  const swayX = Math.sin(seed * 2.1) * 0.08
  const swayZ = Math.cos(seed * 1.3) * 0.08

  if (wild) {
    addWildRoots(b, 0.32)
  } else {
    b.box([0, 0.16, 0], [1.0, 0.32, 1.0], christmas ? PALETTE.planterStoneWinter : PALETTE.planterStone)
    b.box([0, 0.34, 0], [0.82, 0.08, 0.82], PALETTE.planterSoil)
  }
  b.box([0, 1.25, 0], [0.3, 1.85, 0.3], PALETTE.bark)

  const tiers = [
    { y: 1.55, w: 1.85, h: 0.48, color: PALETTE.leafDeep },
    { y: 2.02, w: 1.62, h: 0.48, color: PALETTE.leafDeep },
    { y: 2.48, w: 1.4, h: 0.46, color: PALETTE.leafDark },
    { y: 2.92, w: 1.15, h: 0.44, color: PALETTE.leafMid },
    { y: 3.34, w: 0.88, h: 0.42, color: PALETTE.leafMid },
    { y: 3.74, w: 0.62, h: 0.4, color: PALETTE.leafLight },
    { y: 4.12, w: 0.34, h: 0.4, color: PALETTE.leafLight },
  ] as const

  tiers.forEach((tier, index) => {
    const sign = index % 2 === 0 ? 1 : -0.7
    const cx = swayX * sign
    const cz = swayZ * sign
    b.box([cx, tier.y, cz], [tier.w, tier.h, tier.w], tier.color)

    if (christmas && index >= 2) {
      const side = index % 2 === 0 ? 1 : -1
      const snowW = tier.w * 0.46
      b.box(
        [cx + side * tier.w * 0.24, tier.y + tier.h * 0.5 + 0.04, cz + side * 0.12],
        [snowW, 0.08, snowW],
        index >= 5 ? PALETTE.snowTop : PALETTE.snowShade,
      )
    }

    // 各段の4辺にオーナメント＋イルミ電球を螺旋状に配置
    if (christmas && !wild && index <= 5) {
      const r = tier.w * 0.5 + 0.06
      const offsets: Array<readonly [number, number]> = [
        [r, r * 0.45],
        [-r, -r * 0.45],
        [-r * 0.45, r],
        [r * 0.45, -r],
      ]
      offsets.forEach(([ox, oz], corner) => {
        const idx = index * 4 + corner
        // 各段まわりも約 2/3 に間引く
        if (idx % 3 === 2) return
        const isOrnament = idx % 2 === 0
        if (isOrnament) {
          const color = ORNAMENT_COLORS[(idx + Math.abs(Math.round(seed))) % ORNAMENT_COLORS.length]
          b.box([cx + ox, tier.y - 0.04, cz + oz], [0.18, 0.18, 0.18], color, { glow: true })
        } else {
          const color = FAIRY_LIGHT_COLORS[idx % FAIRY_LIGHT_COLORS.length]
          b.box([cx + ox, tier.y + 0.06, cz + oz], [0.11, 0.11, 0.11], color, {
            glow: true,
            anim: { kind: 'pulse', phase: idx * 0.7 + seed },
          })
        }
      })
    }
  })

  if (christmas) {
    b.box([swayX * 0.6, 4.37, swayZ * 0.6], [0.26, 0.12, 0.26], PALETTE.snowTop)
    if (!wild) addVoxelStar(b, swayX * 0.6, 4.66, swayZ * 0.6, seed)
  }

  return b.build()
}
