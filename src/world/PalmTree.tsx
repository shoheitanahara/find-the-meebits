import { useMemo } from 'react'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const TRUNK = {
  dark: '#5c4026',
  mid: '#7a5532',
  light: '#916640',
} as const

const CROWN = '#2f5a24'
const COCONUT = '#6a4322'
const RACHIS = '#2a4f22'
const LEAF = {
  a: '#3a9a35',
  b: '#2f812c',
  c: '#45a83f',
} as const

/** 先端のとがった小葉。XY で作り、配置時に葉軸平面へ倒す */
const LEAFLET_GEOMETRY = (() => {
  const shape = new THREE.Shape()
  // 付け根(y=0) → 先端(y=1)。幅は中央付近が最大
  shape.moveTo(0, 0)
  shape.quadraticCurveTo(0.55, 0.12, 0.48, 0.45)
  shape.quadraticCurveTo(0.28, 0.78, 0, 1)
  shape.quadraticCurveTo(-0.28, 0.78, -0.48, 0.45)
  shape.quadraticCurveTo(-0.55, 0.12, 0, 0)
  const geometry = new THREE.ShapeGeometry(shape, 5)
  geometry.computeVertexNormals()
  return geometry
})()

/*
 * 軽量化：1 本あたり 200 以上あった部品を、幹・葉の 2 メッシュに焼き込む。
 * 色は頂点カラー、マテリアルは全ヤシで共有（描画回数 ≒ 本数 × 2）。
 */
const BASE_GEOMETRY = new THREE.CylinderGeometry(0.42, 0.65, 0.08, 8)
const BASE_MATERIAL = new THREE.MeshStandardMaterial({ color: '#dec58a', roughness: 0.96 })
const SOLID_MATERIAL = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88 })
const LEAF_MATERIAL = new THREE.MeshStandardMaterial({
  vertexColors: true,
  roughness: 0.72,
  side: THREE.DoubleSide,
})

type Part = { geometry: THREE.BufferGeometry; matrix: THREE.Matrix4; color: string }

function bake(parts: Part[]) {
  const color = new THREE.Color()
  const baked = parts.map(({ geometry, matrix, color: hex }) => {
    // 位置・法線・色だけにそろえて結合（uv は使わない）
    const g = new THREE.BufferGeometry()
    const src = geometry.index ? geometry.toNonIndexed() : geometry
    g.setAttribute('position', src.getAttribute('position').clone())
    g.setAttribute('normal', src.getAttribute('normal').clone())
    g.applyMatrix4(matrix)
    color.set(hex)
    const n = g.getAttribute('position').count
    const colors = new Float32Array(n * 3)
    for (let i = 0; i < n; i += 1) {
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return g
  })
  const merged = mergeGeometries(baked, false)
  baked.forEach((g) => g.dispose())
  return merged
}

const cache = new Map<number, { solid: THREE.BufferGeometry; leaves: THREE.BufferGeometry }>()

/** lean ごとに 1 回だけ形を組み立てる（同じ lean のヤシは同じジオメトリを共有） */
function getPalmGeometry(lean: number) {
  const key = Math.round(lean * 1000)
  const hit = cache.get(key)
  if (hit) return hit

  const solid: Part[] = []
  const leaves: Part[] = []
  const m = (
    parent: THREE.Matrix4,
    position: [number, number, number],
    rotation: [number, number, number] = [0, 0, 0],
    scale: [number, number, number] = [1, 1, 1],
  ) =>
    parent
      .clone()
      .multiply(
        new THREE.Matrix4().compose(
          new THREE.Vector3(...position),
          new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)),
          new THREE.Vector3(...scale),
        ),
      )
  const root = new THREE.Matrix4()

  const trunk = [
    { y: 0.45, h: 0.9, r0: 0.3, r1: 0.26, lean: 0, color: TRUNK.dark },
    { y: 1.3, h: 0.85, r0: 0.26, r1: 0.22, lean: lean * 0.35, color: TRUNK.mid },
    { y: 2.1, h: 0.85, r0: 0.22, r1: 0.18, lean: lean * 0.7, color: TRUNK.mid },
    { y: 2.9, h: 0.8, r0: 0.18, r1: 0.145, lean: lean * 1.05, color: TRUNK.light },
    { y: 3.6, h: 0.7, r0: 0.145, r1: 0.11, lean: lean * 1.35, color: TRUNK.light },
  ] as const

  let x = 0
  for (const segment of trunk) {
    x += segment.lean * 0.35
    solid.push({
      geometry: new THREE.CylinderGeometry(segment.r1, segment.r0, segment.h, 8),
      matrix: m(root, [x, segment.y, 0], [0, 0, segment.lean * 0.45]),
      color: segment.color,
    })
  }
  const crownX = x + lean * 0.12
  const crownY = 4.05

  solid.push({
    geometry: new THREE.SphereGeometry(0.22, 8, 8),
    matrix: m(root, [crownX, crownY, 0]),
    color: CROWN,
  })
  const coconut = new THREE.SphereGeometry(0.11, 6, 6)
  for (let index = 0; index < 3; index += 1) {
    const a = (index / 3) * Math.PI * 2 + 0.4
    solid.push({
      geometry: coconut,
      matrix: m(root, [crownX + Math.sin(a) * 0.22, crownY - 0.28, Math.cos(a) * 0.22]),
      color: COCONUT,
    })
  }

  const fronds: Array<{ angle: number; length: number; bend: number; color: string; lift?: number }> = [
    { angle: 0.0, length: 3.7, bend: 0.195, color: LEAF.a },
    { angle: 0.9, length: 3.4, bend: 0.18, color: LEAF.b },
    { angle: 1.8, length: 3.8, bend: 0.205, color: LEAF.c },
    { angle: 2.7, length: 3.45, bend: 0.185, color: LEAF.a },
    { angle: 3.55, length: 3.65, bend: 0.2, color: LEAF.b },
    { angle: 4.45, length: 3.35, bend: 0.175, color: LEAF.c },
    { angle: 5.3, length: 3.75, bend: 0.2, color: LEAF.a },
    { angle: 0.45, length: 2.25, bend: 0.115, color: LEAF.b, lift: -0.38 },
    { angle: 3.1, length: 2.15, bend: 0.11, color: LEAF.c, lift: -0.35 },
  ]

  /*
   * 葉軸はローカル +Z。小葉は XZ 平面（葉軸平面）に寝かせ、±X へ羽状に伸ばす。
   */
  const steps = 8
  for (const frond of fronds) {
    let frame = m(m(root, [crownX, crownY + 0.05, 0], [0, frond.angle, 0]), [0, 0, 0], [frond.lift ?? -0.22, 0, 0])
    const segLen = frond.length / steps
    for (let step = 0; step < steps; step += 1) {
      const t = step / Math.max(steps - 1, 1)
      const radius = THREE.MathUtils.lerp(0.045, 0.016, t)
      const leafletLen = THREE.MathUtils.lerp(1.35, 0.45, t)
      const leafletWidth = THREE.MathUtils.lerp(0.34, 0.12, t)
      // 浅い V 字（左右が少し上を向く）
      const dihedral = THREE.MathUtils.lerp(0.28, 0.18, t)
      // 先端方向へわずかに流す
      const sweep = THREE.MathUtils.lerp(0.35, 0.55, t)

      solid.push({
        geometry: new THREE.CylinderGeometry(radius * 0.85, radius, segLen, 5),
        matrix: m(frame, [0, 0, segLen * 0.5], [Math.PI / 2, 0, 0]),
        color: RACHIS,
      })
      for (const side of [-1, 1] as const) {
        leaves.push({
          geometry: LEAFLET_GEOMETRY,
          matrix: m(
            frame,
            [side * leafletLen * 0.48, 0.01, segLen * 0.52],
            [Math.PI / 2 - dihedral * 0.35, side * sweep, side * dihedral],
            [leafletWidth * 1.15, leafletLen, 1],
          ),
          color: frond.color,
        })
      }
      frame = m(frame, [0, 0, segLen], [frond.bend, 0, 0])
    }
  }

  const result = { solid: bake(solid), leaves: bake(leaves) }
  cache.set(key, result)
  return result
}

/**
 * 椰子の木（装飾専用・ヒント非対象）
 *
 * 小葉は葉軸とほぼ同一平面に寝かせ、左右へ羽状に開く。
 */
export function PalmTree({
  position,
  scale = 1,
  rotationY = 0,
  lean = 0.08,
}: {
  position: [number, number, number]
  scale?: number
  rotationY?: number
  lean?: number
}) {
  const geo = useMemo(() => getPalmGeometry(lean), [lean])

  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh receiveShadow position={[0, 0.04, 0]} geometry={BASE_GEOMETRY} material={BASE_MATERIAL} />
      <mesh castShadow geometry={geo.solid} material={SOLID_MATERIAL} />
      <mesh castShadow geometry={geo.leaves} material={LEAF_MATERIAL} />
    </group>
  )
}
