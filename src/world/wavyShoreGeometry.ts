import * as THREE from 'three'

/** 白いプラザ半幅（Plaza の 100×100 と一致） */
export const MUSEUM_PLAZA_HALF = 50

export type RingPoint = { x: number; y: number }

type WavyRingOptions = {
  half: number
  cornerRadius?: number
  waveAmp?: number
  wavesAround?: number
  samples?: number
  phase?: number
}

type WavyRectRingOptions = {
  halfX: number
  halfZ: number
  cornerRadius?: number
  waveAmp?: number
  wavesAround?: number
  samples?: number
  phase?: number
}

/**
 * 角丸＋ゆるい波の閉じた輪郭。
 * ShapeGeometry の穴は使わず、ストリップ境界専用。
 */
export function buildShoreRing({
  half,
  cornerRadius,
  waveAmp = 1.2,
  wavesAround = 5,
  samples = 128,
  phase = 0,
}: WavyRingOptions): RingPoint[] {
  const radius = Math.min(cornerRadius ?? half * 0.24, half * 0.45)
  return buildRoundedWavyRing(half, half, radius, waveAmp, wavesAround, samples, phase)
}

/** 矩形（東西・南北で半幅が違う）の波打ち輪郭 */
export function buildShoreRingRect({
  halfX,
  halfZ,
  cornerRadius,
  waveAmp = 1.2,
  wavesAround = 5,
  samples = 128,
  phase = 0,
}: WavyRectRingOptions): RingPoint[] {
  const radius = Math.min(
    cornerRadius ?? Math.min(halfX, halfZ) * 0.28,
    Math.min(halfX, halfZ) * 0.45,
  )
  return buildRoundedWavyRing(halfX, halfZ, radius, waveAmp, wavesAround, samples, phase)
}

/** 正方形の閉じた輪郭。点数は outer と必ず一致させる */
export function buildSquareRing(half: number, count: number): RingPoint[] {
  const points: RingPoint[] = []
  const perimeter = half * 8
  for (let i = 0; i < count; i += 1) {
    const s = (i / count) * perimeter
    points.push(pointOnSquarePerimeter(half, s))
  }
  return points
}

/** 輪郭を外向き法線方向へ押し出す（点数・対応関係を保つ） */
export function expandShoreRing(points: RingPoint[], amount: number): RingPoint[] {
  const count = points.length
  return points.map((point, index) => {
    const prev = points[(index - 1 + count) % count]
    const next = points[(index + 1) % count]
    const tx = next.x - prev.x
    const ty = next.y - prev.y
    const len = Math.hypot(tx, ty) || 1
    // 外周が反時計回りのとき外向きは (ty, -tx)
    const nx = ty / len
    const ny = -tx / len
    return {
      x: point.x + nx * amount,
      y: point.y + ny * amount,
    }
  })
}

/**
 * 内外の対応点をつないだ帯メッシュ。
 * 穴の三角分割を使わないので、中央を横切る偽の青三角が出ない。
 * inner/outer は同じ点数・同じパラメータ順であること（resample しない）。
 */
export function createRingStripGeometry(
  innerRing: RingPoint[],
  outerRing: RingPoint[],
): THREE.BufferGeometry {
  if (innerRing.length !== outerRing.length) {
    throw new Error('createRingStripGeometry: inner/outer sample counts must match')
  }
  if (innerRing.length < 3) {
    throw new Error('createRingStripGeometry: need at least 3 points')
  }

  const count = innerRing.length
  const positions = new Float32Array(count * 2 * 3)

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = innerRing[i].x
    positions[i * 3 + 1] = 0
    positions[i * 3 + 2] = innerRing[i].y

    positions[(count + i) * 3] = outerRing[i].x
    positions[(count + i) * 3 + 1] = 0
    positions[(count + i) * 3 + 2] = outerRing[i].y
  }

  const indices: number[] = []
  for (let i = 0; i < count; i += 1) {
    const iNext = (i + 1) % count
    const o = count + i
    const oNext = count + iNext
    // +Y 上向き
    indices.push(i, o, oNext)
    indices.push(i, oNext, iNext)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

function pointOnSquarePerimeter(half: number, s: number): RingPoint {
  const side = half * 2
  const perimeter = side * 4
  let d = ((s % perimeter) + perimeter) % perimeter

  if (d <= side) return { x: -half + d, y: -half }
  d -= side
  if (d <= side) return { x: half, y: -half + d }
  d -= side
  if (d <= side) return { x: half - d, y: half }
  d -= side
  return { x: -half, y: half - d }
}

function buildRoundedWavyRing(
  halfX: number,
  halfZ: number,
  cornerRadius: number,
  waveAmp: number,
  wavesAround: number,
  samples: number,
  phase: number,
): RingPoint[] {
  const points: RingPoint[] = []

  for (let i = 0; i < samples; i += 1) {
    const u = i / samples
    const { x, y, nx, ny } = pointOnRoundedRect(halfX, halfZ, cornerRadius, u)
    const wave =
      Math.sin(u * Math.PI * 2 * wavesAround + phase) * waveAmp +
      Math.sin(u * Math.PI * 2 * wavesAround * 2.15 + phase * 1.4) * waveAmp * 0.28 +
      Math.sin(u * Math.PI * 2 * wavesAround * 0.47 + phase * 2.1) * waveAmp * 0.18
    points.push({
      x: x + nx * wave,
      y: y + ny * wave,
    })
  }

  return points
}

function pointOnRoundedRect(
  halfX: number,
  halfZ: number,
  cornerRadius: number,
  u: number,
): { x: number; y: number; nx: number; ny: number } {
  const r = Math.min(cornerRadius, halfX * 0.49, halfZ * 0.49)
  const straightX = halfX * 2 - 2 * r
  const straightZ = halfZ * 2 - 2 * r
  const arc = (Math.PI / 2) * r
  // 辺: 南(X) → 東(Z) → 北(X) → 西(Z)
  const segments = [straightX, arc, straightZ, arc, straightX, arc, straightZ, arc]
  const perimeter = segments.reduce((sum, len) => sum + len, 0)
  let s = ((((u % 1) + 1) % 1) * perimeter)

  for (let i = 0; i < segments.length; i += 1) {
    const len = segments[i]
    if (s <= len) {
      const t = len > 0 ? s / len : 0
      if (i % 2 === 0) {
        return pointOnStraightSideRect(halfX, halfZ, r, i / 2, t)
      }
      return pointOnCornerArcRect(halfX, halfZ, r, (i - 1) / 2, t)
    }
    s -= len
  }

  return pointOnStraightSideRect(halfX, halfZ, r, 0, 0)
}

function pointOnStraightSideRect(
  halfX: number,
  halfZ: number,
  r: number,
  side: number,
  t: number,
) {
  const spanX = halfX * 2 - 2 * r
  const spanZ = halfZ * 2 - 2 * r
  switch (side) {
    case 0: // south (-Z)
      return { x: -halfX + r + spanX * t, y: -halfZ, nx: 0, ny: -1 }
    case 1: // east (+X)
      return { x: halfX, y: -halfZ + r + spanZ * t, nx: 1, ny: 0 }
    case 2: // north (+Z)
      return { x: halfX - r - spanX * t, y: halfZ, nx: 0, ny: 1 }
    default: // west (-X)
      return { x: -halfX, y: halfZ - r - spanZ * t, nx: -1, ny: 0 }
  }
}

function pointOnCornerArcRect(
  halfX: number,
  halfZ: number,
  r: number,
  side: number,
  t: number,
) {
  const centers: Array<[number, number, number]> = [
    [halfX - r, -halfZ + r, -Math.PI / 2], // SE
    [halfX - r, halfZ - r, 0], // NE
    [-halfX + r, halfZ - r, Math.PI / 2], // NW
    [-halfX + r, -halfZ + r, Math.PI], // SW
  ]
  const [cx, cy, startAngle] = centers[side]
  const angle = startAngle + t * (Math.PI / 2)
  const nx = Math.cos(angle)
  const ny = Math.sin(angle)
  return {
    x: cx + nx * r,
    y: cy + ny * r,
    nx,
    ny,
  }
}
