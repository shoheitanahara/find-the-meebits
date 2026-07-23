import type { ParkGateDef, ParkZoneLayout } from './parkZones'

/** カージナル方位 */
export type CardinalSide = 'n' | 's' | 'e' | 'w'

export type PerimeterOpening =
  | { side: CardinalSide; kind: 'bridge-gate'; gateId: string }
  | { side: CardinalSide; kind: 'sealed' }

export type ParkPerimeterTheme = 'classic' | 'mountain'

export type ParkPerimeterDef = {
  theme: ParkPerimeterTheme
  openings: PerimeterOpening[]
  /**
   * 手前クリア辺。省略時は北（全エリア共通）。
   * 手前に壁を置くとカメラが塞がるので西などにしない。
   */
  frontClearSides?: CardinalSide[]
}

export type PerimeterBox = {
  x: number
  z: number
  halfX: number
  halfZ: number
}

/**
 * Plaza クラシック境界の寸法。
 * 見た目（ParkPerimeter）と衝突（topCollisions）が同じ数値を参照する。
 *
 * 座標メモ: 入場スポーンは +Z 側。カメラから見て手前＝北(+Z)、奥＝南(-Z／アトラクション列)。
 */
export type PerimeterSpec = {
  cx: number
  cz: number
  riverInnerX: number
  /** 北(+Z)側の川内側距離 */
  riverInnerZN: number
  /** 南(-Z)側の川内側距離。奥壁は建物クリアのため大きめ */
  riverInnerZS: number
  riverWidth: number
  wallThickness: number
  wallHeight: number
  /** ゲート辺の壁開口（川より広く取り、門のシルエットを確保） */
  wallOpeningHalf: number
  /** 川・橋の開口 */
  openingHalf: number
  bridgeDeckWidth: number
  bridgeLength: number
  /**
   * 手前クリア辺。壁・川・縁石・封印門・滝・角デコを一切置かない。
   * 置いてよいのは bridge-gate（ゲート＋橋）のみ。
   */
  frontClearSides: CardinalSide[]
  theme: ParkPerimeterTheme
  openings: PerimeterOpening[]
  gates: ParkGateDef[]
}

/** N/S 辺の川内側距離 */
export function riverInnerOnNS(spec: PerimeterSpec, side: 'n' | 's') {
  return side === 'n' ? spec.riverInnerZN : spec.riverInnerZS
}

export function buildPerimeterSpec(
  layout: ParkZoneLayout,
  perimeter: ParkPerimeterDef,
  gates: ParkGateDef[],
): PerimeterSpec {
  const isMountain = perimeter.theme === 'mountain'
  // 床スケルトンは全区共通。川内側も同じ基準で揃える
  const riverInnerX = Math.min(layout.boundsX - 4.8, 22.2)
  const riverInnerZN = Math.min(layout.maxZ - 2.2, 12.5)
  const riverInnerZS = Math.min(Math.abs(layout.minZ) - 0.4, 16.2)

  return {
    cx: 0,
    cz: layout.groundZ,
    riverInnerX,
    riverInnerZN,
    riverInnerZS,
    riverWidth: isMountain ? 3.0 : 2.5,
    wallThickness: isMountain ? 1.6 : 1.25,
    wallHeight: isMountain ? 3.6 : 2.85,
    wallOpeningHalf: isMountain ? 5.4 : 5.2,
    openingHalf: 2.35,
    // 門の通過幅に近いデッキ。川をまたぐ長さは配置側で river に合わせる
    bridgeDeckWidth: 4.0,
    bridgeLength: isMountain ? 3.6 : 3.2,
    frontClearSides: perimeter.frontClearSides ?? ['n'],
    theme: perimeter.theme,
    openings: perimeter.openings,
    gates,
  }
}

export function getOpening(spec: PerimeterSpec, side: CardinalSide) {
  return spec.openings.find((o) => o.side === side)
}

/** 手前クリア辺か（ゲートが無い限り境界物禁止） */
export function isFrontClearSide(spec: PerimeterSpec, side: CardinalSide) {
  return spec.frontClearSides.includes(side)
}

/**
 * その辺に川・壁を出してよいか。
 * 手前クリア辺（全エリア共通で北＝+Z）はゲートがあっても川・壁は出さない。
 */
export function shouldBuildPerimeterSide(spec: PerimeterSpec, side: CardinalSide) {
  if (isFrontClearSide(spec, side)) return false
  return true
}

/** 軸沿いセグメントを開口で分割 */
export function splitAxisSegments(
  center: number,
  halfSpan: number,
  openCenter: number,
  openHalf: number,
): Array<{ mid: number; half: number }> {
  const min = center - halfSpan
  const max = center + halfSpan
  const openMin = openCenter - openHalf
  const openMax = openCenter + openHalf
  const parts: Array<{ mid: number; half: number }> = []

  if (openHalf <= 0) {
    return [{ mid: center, half: halfSpan }]
  }
  if (openMin > min + 0.35) {
    parts.push({ mid: (min + openMin) * 0.5, half: (openMin - min) * 0.5 })
  }
  if (openMax < max - 0.35) {
    parts.push({ mid: (openMax + max) * 0.5, half: (max - openMax) * 0.5 })
  }
  return parts
}

/** 本ゲート／封印門のどちらも開口扱い（川・壁を切る） */
export function isPerimeterGateOpening(
  opening: PerimeterOpening | undefined,
): opening is PerimeterOpening {
  return opening?.kind === 'bridge-gate' || opening?.kind === 'sealed'
}

function bridgeGap(spec: PerimeterSpec, side: CardinalSide) {
  const opening = getOpening(spec, side)
  if (!isPerimeterGateOpening(opening)) return 0
  return spec.openingHalf
}

function bridgeWallGap(spec: PerimeterSpec, side: CardinalSide) {
  const opening = getOpening(spec, side)
  if (!isPerimeterGateOpening(opening)) return 0
  return spec.wallOpeningHalf
}

function openCenterOnSide(spec: PerimeterSpec, side: CardinalSide) {
  const opening = getOpening(spec, side)
  if (!opening || opening.kind !== 'bridge-gate') {
    return side === 'e' || side === 'w' ? spec.cz : spec.cx
  }
  const gate = spec.gates.find((g) => g.id === opening.gateId)
  if (!gate) return side === 'e' || side === 'w' ? spec.cz : spec.cx
  return side === 'e' || side === 'w' ? gate.z : gate.x
}

/**
 * カージナル門のワールド座標（本ゲートと同じ壁開口ライン）。
 * ローカル +X = 園内側（看板・ランタン側）。
 */
export function getCardinalGatePlacement(
  spec: PerimeterSpec,
  side: CardinalSide,
): { x: number; z: number; rotationY: number } {
  const { cx, cz, riverInnerX, riverInnerZN, riverInnerZS, riverWidth, wallThickness } = spec
  // 壁中央よりわずかに外側寄り（本ゲート 26.4 / -25.6 相当）
  const radialX = riverInnerX + riverWidth + wallThickness * 0.55
  const radialZN = riverInnerZN + riverWidth + wallThickness * 0.55
  const radialZS = riverInnerZS + riverWidth + wallThickness * 0.55

  if (side === 'e') return { x: cx + radialX, z: cz, rotationY: Math.PI }
  if (side === 'w') return { x: cx - radialX, z: cz, rotationY: 0 }
  if (side === 'n') return { x: cx, z: cz + radialZN, rotationY: -Math.PI / 2 }
  return { x: cx, z: cz - radialZS, rotationY: Math.PI / 2 }
}

/** 封印門の遮断ボックス（開口を歩いて抜けられないようにする） */
export function buildSealedGateObstacleBoxes(spec: PerimeterSpec): PerimeterBox[] {
  const boxes: PerimeterBox[] = []
  const doorHalfAcross = spec.openingHalf * 0.95
  const doorHalfDepth = 0.55
  const pillarHalf = 0.4
  const pillarOffset = spec.openingHalf * 0.92

  for (const opening of spec.openings) {
    if (opening.kind !== 'sealed') continue
    if (isFrontClearSide(spec, opening.side)) continue
    const { x, z, rotationY } = getCardinalGatePlacement(spec, opening.side)
    // yaw 0/π → 東西門（幅は Z）。±π/2 → 南北門（幅は X）
    const eastWest = Math.abs(Math.sin(rotationY)) < 0.1
    if (eastWest) {
      boxes.push({ x, z, halfX: doorHalfDepth, halfZ: doorHalfAcross })
      boxes.push({ x, z: z - pillarOffset, halfX: pillarHalf, halfZ: pillarHalf })
      boxes.push({ x, z: z + pillarOffset, halfX: pillarHalf, halfZ: pillarHalf })
    } else {
      boxes.push({ x, z, halfX: doorHalfAcross, halfZ: doorHalfDepth })
      boxes.push({ x: x - pillarOffset, z, halfX: pillarHalf, halfZ: pillarHalf })
      boxes.push({ x: x + pillarOffset, z, halfX: pillarHalf, halfZ: pillarHalf })
    }
  }
  return boxes
}

/**
 * 外周の歩行不可ボックス（壁・川）。
 * frontClearSides → その辺は完全スキップ。
 */
export function buildPerimeterObstacleBoxes(spec: PerimeterSpec): PerimeterBox[] {
  const boxes: PerimeterBox[] = []
  const { cx, cz, riverInnerX, riverInnerZN, riverInnerZS, riverWidth, wallThickness } = spec

  const riverMidX = riverInnerX + riverWidth * 0.5
  const wallMidX = riverInnerX + riverWidth + wallThickness * 0.5
  const riverMidZN = riverInnerZN + riverWidth * 0.5
  const riverMidZS = riverInnerZS + riverWidth * 0.5
  const wallMidZN = riverInnerZN + riverWidth + wallThickness * 0.5
  const wallMidZS = riverInnerZS + riverWidth + wallThickness * 0.5
  // 東西辺は奥まで届くよう、南北の大きい方に合わせる
  const halfSpanZ =
    Math.max(riverInnerZN, riverInnerZS) + riverWidth + wallThickness * 0.5
  const halfSpanX = riverInnerX + riverWidth + wallThickness * 0.5

  if (shouldBuildPerimeterSide(spec, 'e')) {
    for (const seg of splitAxisSegments(cz, halfSpanZ, openCenterOnSide(spec, 'e'), bridgeGap(spec, 'e'))) {
      boxes.push({ x: cx + riverMidX, z: seg.mid, halfX: riverWidth * 0.5, halfZ: seg.half })
    }
    for (const seg of splitAxisSegments(cz, halfSpanZ, openCenterOnSide(spec, 'e'), bridgeWallGap(spec, 'e'))) {
      boxes.push({ x: cx + wallMidX, z: seg.mid, halfX: wallThickness * 0.5, halfZ: seg.half })
    }
  }
  if (shouldBuildPerimeterSide(spec, 'w')) {
    for (const seg of splitAxisSegments(cz, halfSpanZ, openCenterOnSide(spec, 'w'), bridgeGap(spec, 'w'))) {
      boxes.push({ x: cx - riverMidX, z: seg.mid, halfX: riverWidth * 0.5, halfZ: seg.half })
    }
    for (const seg of splitAxisSegments(cz, halfSpanZ, openCenterOnSide(spec, 'w'), bridgeWallGap(spec, 'w'))) {
      boxes.push({ x: cx - wallMidX, z: seg.mid, halfX: wallThickness * 0.5, halfZ: seg.half })
    }
  }
  if (shouldBuildPerimeterSide(spec, 'n')) {
    for (const seg of splitAxisSegments(cx, halfSpanX, openCenterOnSide(spec, 'n'), bridgeGap(spec, 'n'))) {
      boxes.push({ x: seg.mid, z: cz + riverMidZN, halfX: seg.half, halfZ: riverWidth * 0.5 })
    }
    for (const seg of splitAxisSegments(cx, halfSpanX, openCenterOnSide(spec, 'n'), bridgeWallGap(spec, 'n'))) {
      boxes.push({ x: seg.mid, z: cz + wallMidZN, halfX: seg.half, halfZ: wallThickness * 0.5 })
    }
  }
  if (shouldBuildPerimeterSide(spec, 's')) {
    for (const seg of splitAxisSegments(cx, halfSpanX, openCenterOnSide(spec, 's'), bridgeGap(spec, 's'))) {
      boxes.push({ x: seg.mid, z: cz - riverMidZS, halfX: seg.half, halfZ: riverWidth * 0.5 })
    }
    for (const seg of splitAxisSegments(cx, halfSpanX, openCenterOnSide(spec, 's'), bridgeWallGap(spec, 's'))) {
      boxes.push({ x: seg.mid, z: cz - wallMidZS, halfX: seg.half, halfZ: wallThickness * 0.5 })
    }
  }

  for (const sx of [-1, 1] as const) {
    for (const sz of [-1, 1] as const) {
      if (sz < 0 && isFrontClearSide(spec, 's')) continue
      if (sz > 0 && isFrontClearSide(spec, 'n')) continue
      if (sx < 0 && isFrontClearSide(spec, 'w')) continue
      if (sx > 0 && isFrontClearSide(spec, 'e')) continue
      const cornerZ = (sz > 0 ? riverInnerZN : riverInnerZS) + riverWidth * 0.55
      boxes.push({
        x: cx + sx * (riverInnerX + riverWidth * 0.55),
        z: cz + sz * cornerZ,
        halfX: 0.85,
        halfZ: 0.85,
      })
    }
  }

  return boxes
}

/**
 * 橋の手すり（両脇）。XZ のみの歩行系なので、橋から川へ落ちないガード。
 */
export function buildBridgeRailingBoxes(spec: PerimeterSpec): PerimeterBox[] {
  const boxes: PerimeterBox[] = []
  for (const opening of spec.openings) {
    if (!isPerimeterGateOpening(opening)) continue
    const placement = getBridgePlacement(spec, opening.side)
    if (!placement) continue

    const { x, z, rotationY, length } = placement
    const halfL = length * 0.48
    const railHalf = 0.12
    const side = spec.bridgeDeckWidth * 0.5
    const cos = Math.cos(rotationY)
    const sin = Math.sin(rotationY)

    for (const sideSign of [-1, 1] as const) {
      // ローカル: 長手=X、幅=Z → ワールドへ
      const lx = 0
      const lz = sideSign * side
      const wx = x + lx * cos - lz * sin
      const wz = z + lx * sin + lz * cos
      // 軸平行の薄い帯で近似（カージナル橋は yaw が 0/±π/2）
      if (Math.abs(sin) < 0.1) {
        boxes.push({ x: wx, z: wz, halfX: halfL, halfZ: railHalf })
      } else {
        boxes.push({ x: wx, z: wz, halfX: railHalf, halfZ: halfL })
      }
    }
  }
  return boxes
}

/** 橋デッキ中心 — 川の真上に載せ、園路に長く突き出さない（本ゲート・封印門共通） */
export function getBridgePlacement(
  spec: PerimeterSpec,
  side: CardinalSide,
): { x: number; z: number; rotationY: number; length: number } | null {
  const opening = getOpening(spec, side)
  if (!isPerimeterGateOpening(opening)) return null

  const gate =
    opening.kind === 'bridge-gate' ? spec.gates.find((g) => g.id === opening.gateId) : undefined
  const { riverInnerX, riverInnerZN, riverInnerZS, riverWidth, cz, cx } = spec
  const length = riverWidth + 1.1
  const along = side === 'e' || side === 'w' ? (gate?.z ?? cz) : (gate?.x ?? cx)

  if (side === 'e') {
    return { x: cx + riverInnerX + riverWidth * 0.5, z: along, rotationY: 0, length }
  }
  if (side === 'w') {
    return { x: cx - riverInnerX - riverWidth * 0.5, z: along, rotationY: Math.PI, length }
  }
  if (side === 'n') {
    return { x: along, z: cz + riverInnerZN + riverWidth * 0.5, rotationY: -Math.PI / 2, length }
  }
  return { x: along, z: cz - riverInnerZS - riverWidth * 0.5, rotationY: Math.PI / 2, length }
}
