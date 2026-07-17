import type { ReactNode } from 'react'
import * as THREE from 'three'

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
  const trunk = [
    { y: 0.45, h: 0.9, r0: 0.3, r1: 0.26, lean: 0, color: TRUNK.dark },
    { y: 1.3, h: 0.85, r0: 0.26, r1: 0.22, lean: lean * 0.35, color: TRUNK.mid },
    { y: 2.1, h: 0.85, r0: 0.22, r1: 0.18, lean: lean * 0.7, color: TRUNK.mid },
    { y: 2.9, h: 0.8, r0: 0.18, r1: 0.145, lean: lean * 1.05, color: TRUNK.light },
    { y: 3.6, h: 0.7, r0: 0.145, r1: 0.11, lean: lean * 1.35, color: TRUNK.light },
  ] as const

  let x = 0
  const trunkMeshes = trunk.map((segment) => {
    x += segment.lean * 0.35
    return { ...segment, x }
  })
  const crownX = x + lean * 0.12
  const crownY = 4.05

  const fronds = [
    { angle: 0.0, length: 3.7, bend: 0.195, color: LEAF.a },
    { angle: 0.9, length: 3.4, bend: 0.18, color: LEAF.b },
    { angle: 1.8, length: 3.8, bend: 0.205, color: LEAF.c },
    { angle: 2.7, length: 3.45, bend: 0.185, color: LEAF.a },
    { angle: 3.55, length: 3.65, bend: 0.2, color: LEAF.b },
    { angle: 4.45, length: 3.35, bend: 0.175, color: LEAF.c },
    { angle: 5.3, length: 3.75, bend: 0.2, color: LEAF.a },
    { angle: 0.45, length: 2.25, bend: 0.115, color: LEAF.b, lift: -0.38 },
    { angle: 3.1, length: 2.15, bend: 0.11, color: LEAF.c, lift: -0.35 },
  ] as const

  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      <mesh receiveShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.42, 0.65, 0.08, 8]} />
        <meshStandardMaterial color="#dec58a" roughness={0.96} />
      </mesh>

      {trunkMeshes.map((segment, index) => (
        <mesh
          key={index}
          castShadow
          position={[segment.x, segment.y, 0]}
          rotation={[0, 0, segment.lean * 0.45]}
        >
          <cylinderGeometry args={[segment.r1, segment.r0, segment.h, 8]} />
          <meshStandardMaterial color={segment.color} roughness={0.9} />
        </mesh>
      ))}

      <mesh castShadow position={[crownX, crownY, 0]}>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color={CROWN} roughness={0.8} />
      </mesh>

      {[0, 1, 2].map((index) => {
        const a = (index / 3) * Math.PI * 2 + 0.4
        return (
          <mesh
            key={index}
            castShadow
            position={[crownX + Math.sin(a) * 0.22, crownY - 0.28, Math.cos(a) * 0.22]}
          >
            <sphereGeometry args={[0.11, 6, 6]} />
            <meshStandardMaterial color={COCONUT} roughness={0.88} />
          </mesh>
        )
      })}

      {fronds.map((frond, index) => (
        <group
          key={index}
          position={[crownX, crownY + 0.05, 0]}
          rotation={[0, frond.angle, 0]}
        >
          <group rotation={[frond.lift ?? -0.22, 0, 0]}>
            <FrondArc
              steps={8}
              length={frond.length}
              bendPerStep={frond.bend}
              color={frond.color}
            />
          </group>
        </group>
      ))}
    </group>
  )
}

/**
 * 葉軸はローカル +Z。
 * 小葉は XZ 平面（葉軸平面）に寝かせ、±X へ羽状に伸ばす。
 * ※ 以前の「はしご段」は XY 平面のまま立てていたのが原因。
 */
function FrondArc({
  steps,
  length,
  bendPerStep,
  color,
  step = 0,
}: {
  steps: number
  length: number
  bendPerStep: number
  color: string
  step?: number
}) {
  const segLen = length / steps
  const t = step / Math.max(steps - 1, 1)
  const radius = THREE.MathUtils.lerp(0.045, 0.016, t)
  const leafletLen = THREE.MathUtils.lerp(1.35, 0.45, t)
  const leafletWidth = THREE.MathUtils.lerp(0.34, 0.12, t)
  // 浅い V 字（左右が少し上を向く）
  const dihedral = THREE.MathUtils.lerp(0.28, 0.18, t)
  // 先端方向へわずかに流す
  const sweep = THREE.MathUtils.lerp(0.35, 0.55, t)

  const next: ReactNode =
    step < steps - 1 ? (
      <group position={[0, 0, segLen]} rotation={[bendPerStep, 0, 0]}>
        <FrondArc
          steps={steps}
          length={length}
          bendPerStep={bendPerStep}
          color={color}
          step={step + 1}
        />
      </group>
    ) : null

  return (
    <group>
      <mesh castShadow position={[0, 0, segLen * 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[radius * 0.85, radius, segLen, 5]} />
        <meshStandardMaterial color={RACHIS} roughness={0.88} />
      </mesh>

      {([-1, 1] as const).map((side) => (
        <mesh
          key={side}
          castShadow
          geometry={LEAFLET_GEOMETRY}
          // 葉軸平面へ倒す (X 回転) → 左右へ開く → 先端へスイープ
          position={[side * leafletLen * 0.48, 0.01, segLen * 0.52]}
          rotation={[
            Math.PI / 2 - dihedral * 0.35,
            side * sweep,
            side * dihedral,
          ]}
          scale={[leafletWidth * 1.15, leafletLen, 1]}
        >
          <meshStandardMaterial color={color} roughness={0.72} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {next}
    </group>
  )
}
