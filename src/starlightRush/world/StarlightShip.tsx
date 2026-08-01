import { STARLIGHT_RUSH } from '../config'

/**
 * Meebits Park らしいカラフルな小型宇宙船。
 * ノーズコーン・コックピット・翼・エンジン・アクセントライト。
 */
export function StarlightShip() {
  const { shipLocal } = STARLIGHT_RUSH
  const hull = '#d8e6f8'
  const hullDark = '#6a7e9c'
  const accent = '#5ce0ff'
  const magenta = '#ff6ad5'
  const gold = '#ffe66d'

  return (
    <group position={[shipLocal.x, shipLocal.y, shipLocal.z]}>
      {/* 胴体 */}
      <mesh position={[0, 0.22, 0.15]} castShadow>
        <capsuleGeometry args={[0.32, 1.35, 8, 16]} />
        <meshStandardMaterial color={hull} metalness={0.62} roughness={0.28} />
      </mesh>

      {/* ノーズコーン（進行方向 -Z） */}
      <mesh position={[0, 0.22, -0.72]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.32, 0.55, 16]} />
        <meshStandardMaterial color={accent} metalness={0.55} roughness={0.25} emissive={accent} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0.22, -0.98]} rotation={[Math.PI / 2, 0, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.8} metalness={0.4} roughness={0.2} />
      </mesh>

      {/* コックピットキャノピー */}
      <mesh position={[0, 0.52, -0.05]} rotation={[0.35, 0, 0]} castShadow>
        <sphereGeometry args={[0.36, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial
          color="#8fdfff"
          emissive={accent}
          emissiveIntensity={0.35}
          transparent
          opacity={0.55}
          metalness={0.15}
          roughness={0.12}
        />
      </mesh>
      {/* キャノピー縁 */}
      <mesh position={[0, 0.42, 0.05]} rotation={[0.2, 0, 0]}>
        <torusGeometry args={[0.34, 0.025, 8, 24]} />
        <meshStandardMaterial color={hullDark} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* サイドインテーク */}
      {([-1, 1] as const).map((side) => (
        <mesh key={`intake-${side}`} position={[side * 0.38, 0.18, 0.15]} castShadow>
          <boxGeometry args={[0.18, 0.22, 0.7]} />
          <meshStandardMaterial color={hullDark} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}

      {/* 主翼 */}
      {([-1, 1] as const).map((side) => (
        <group key={`wing-${side}`} position={[side * 0.45, 0.12, 0.35]}>
          <mesh rotation={[0.08, 0, side * 0.32]} castShadow>
            <boxGeometry args={[1.35, 0.06, 0.7]} />
            <meshStandardMaterial color="#9eb4d4" metalness={0.45} roughness={0.35} />
          </mesh>
          {/* 翼端ライト */}
          <mesh position={[side * 0.62, 0.04, -0.1]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshStandardMaterial
              color={side > 0 ? magenta : accent}
              emissive={side > 0 ? magenta : accent}
              emissiveIntensity={1.1}
            />
          </mesh>
          {/* 翼ストライプ */}
          <mesh position={[side * 0.2, 0.05, 0]} rotation={[0.08, 0, side * 0.32]}>
            <boxGeometry args={[0.9, 0.02, 0.12]} />
            <meshStandardMaterial color={gold} emissive={gold} emissiveIntensity={0.35} />
          </mesh>
        </group>
      ))}

      {/* 垂直尾翼（高さを半分にし、下寄せ） */}
      <mesh position={[0, 0.38, 0.74]} rotation={[0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.06, 0.28, 0.32]} />
        <meshStandardMaterial color={hullDark} metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.54, 0.66]}>
        <boxGeometry args={[0.08, 0.08, 0.18]} />
        <meshStandardMaterial color={magenta} emissive={magenta} emissiveIntensity={0.55} />
      </mesh>

      {/* 水平尾翼 */}
      {([-1, 1] as const).map((side) => (
        <mesh
          key={`tail-${side}`}
          position={[side * 0.35, 0.28, 0.78]}
          rotation={[0, 0, side * -0.2]}
          castShadow
        >
          <boxGeometry args={[0.55, 0.05, 0.28]} />
          <meshStandardMaterial color="#8aa0c0" metalness={0.45} roughness={0.4} />
        </mesh>
      ))}

      {/* エンジン・ナセル */}
      {([-1, 1] as const).map((side) => (
        <group key={`engine-${side}`} position={[side * 0.28, 0.05, 0.85]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.16, 0.45, 12]} />
            <meshStandardMaterial color={hullDark} metalness={0.65} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.11, 0.13, 0.12, 12]} />
            <meshStandardMaterial color="#1a2030" metalness={0.8} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0, 0.38]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color="#ff9f5a"
              emissive="#ff6a20"
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      {/* 中央スラスター */}
      <mesh position={[0, 0.12, 1.05]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#ffe0a0" emissive="#ff8a30" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0.15, 1.2]} intensity={10} distance={7} color="#ff8a40" />

      {/* 船体アクセントリング */}
      <mesh position={[0, 0.22, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.03, 8, 24]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  )
}
