import { isMatchHallVenue } from '../game/venueConfig'

const NEON = ['#5ee0ff', '#ff6b9d', '#ffe066', '#a78bfa'] as const

/**
 * Trait Hunt 用の視覚デコのみ（衝突・レイアウトは変えない）。
 * プラザ四隅のネオン塔 + 低いリングで Match Hall 感を足す。
 */
export function MatchHallDecor() {
  if (!isMatchHallVenue()) return null

  const corners: Array<[number, number]> = [
    [-42, -42],
    [42, -42],
    [-42, 42],
    [42, 42],
  ]

  return (
    <group>
      {corners.map(([x, z], index) => (
        <NeonPylon key={`${x}-${z}`} position={[x, 0, z]} color={NEON[index % NEON.length]} />
      ))}

      {/* プラザ外周の低いネオン縁（ガラス壁の内側、足元ガイド） */}
      {([-34, 34] as const).map((x) => (
        <mesh key={`edge-x-${x}`} position={[x, 0.08, 0]}>
          <boxGeometry args={[0.12, 0.1, 68]} />
          <meshStandardMaterial
            color="#5ee0ff"
            emissive="#5ee0ff"
            emissiveIntensity={0.7}
            roughness={0.4}
          />
        </mesh>
      ))}
      {([-34, 34] as const).map((z) => (
        <mesh key={`edge-z-${z}`} position={[0, 0.08, z]}>
          <boxGeometry args={[68, 0.1, 0.12]} />
          <meshStandardMaterial
            color="#5ee0ff"
            emissive="#5ee0ff"
            emissiveIntensity={0.7}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

function NeonPylon({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.7, 0.3, 12]} />
        <meshStandardMaterial color="#0d1822" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 2.4, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 4.4, 10]} />
        <meshStandardMaterial color="#152836" metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 4.7, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.55, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 3.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.06, 8, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} />
      </mesh>
      <pointLight position={[0, 4.5, 0]} color={color} intensity={16} distance={18} />
    </group>
  )
}
