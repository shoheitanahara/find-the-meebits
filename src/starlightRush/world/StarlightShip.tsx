import { STARLIGHT_RUSH } from '../config'

type StarlightShipProps = {
  /** 省略時はプレイヤー船の shipLocal */
  position?: readonly [number, number, number]
  /** 僚機など少し小さく */
  scale?: number
}

/**
 * シンプルなシャトル風ライド。
 * 一人掛けシート + 左右水平の長い翼 + エンジン 3 基。ノーズは -Z。
 */
export function StarlightShip({ position, scale = 1 }: StarlightShipProps = {}) {
  const { shipLocal, seatLocal } = STARLIGHT_RUSH
  const px = position?.[0] ?? shipLocal.x
  const py = position?.[1] ?? shipLocal.y
  const pz = position?.[2] ?? shipLocal.z

  const body = '#e4ebf4'
  const trim = '#8a97ab'
  const accent = '#5ce0ff'
  const cushion = '#3d4a63'
  const cushionHi = '#4a5a78'

  return (
    <group position={[px, py, pz]} scale={scale}>
      {/* デッキ床（シートの下） */}
      <mesh position={[0, 0.06, 0.05]} castShadow>
        <boxGeometry args={[0.78, 0.08, 1.4]} />
        <meshStandardMaterial color={body} metalness={0.4} roughness={0.36} />
      </mesh>
      {/* サイドレール */}
      {([-1, 1] as const).map((side) => (
        <mesh key={`rail-${side}`} position={[side * 0.4, 0.28, 0.05]} castShadow>
          <boxGeometry args={[0.05, 0.22, 1.15]} />
          <meshStandardMaterial color={trim} metalness={0.48} roughness={0.4} />
        </mesh>
      ))}

      {/* ── 一人掛けコックピットシート ── */}
      <group position={[seatLocal.x, seatLocal.y, seatLocal.z]}>
        {/* 台座 */}
        <mesh position={[0, 0.02, 0.02]} castShadow>
          <cylinderGeometry args={[0.16, 0.2, 0.08, 12]} />
          <meshStandardMaterial color={trim} metalness={0.55} roughness={0.35} />
        </mesh>
        {/* 座面 */}
        <mesh position={[0, 0.12, -0.02]} castShadow>
          <boxGeometry args={[0.48, 0.09, 0.46]} />
          <meshStandardMaterial color={cushion} metalness={0.15} roughness={0.62} />
        </mesh>
        {/* 座面パッド（少し盛り上がり） */}
        <mesh position={[0, 0.175, -0.02]} castShadow>
          <boxGeometry args={[0.42, 0.04, 0.4]} />
          <meshStandardMaterial color={cushionHi} metalness={0.12} roughness={0.58} />
        </mesh>
        {/* 背もたれ（後ろ = +Z） */}
        <mesh position={[0, 0.42, 0.2]} rotation={[-0.12, 0, 0]} castShadow>
          <boxGeometry args={[0.46, 0.52, 0.08]} />
          <meshStandardMaterial color={cushion} metalness={0.15} roughness={0.62} />
        </mesh>
        {/* ヘッドレスト */}
        <mesh position={[0, 0.72, 0.18]} rotation={[-0.08, 0, 0]} castShadow>
          <boxGeometry args={[0.36, 0.14, 0.08]} />
          <meshStandardMaterial color={cushionHi} metalness={0.12} roughness={0.55} />
        </mesh>
        {/* 肘掛け */}
        {([-1, 1] as const).map((side) => (
          <mesh key={`arm-${side}`} position={[side * 0.26, 0.28, -0.02]} castShadow>
            <boxGeometry args={[0.07, 0.08, 0.4]} />
            <meshStandardMaterial color={trim} metalness={0.5} roughness={0.38} />
          </mesh>
        ))}
        {/* シート縁のアクセント */}
        <mesh position={[0, 0.2, 0.2]}>
          <boxGeometry args={[0.48, 0.03, 0.03]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.45} />
        </mesh>
      </group>

      {/* ノーズ（丸く短い） */}
      <mesh position={[0, 0.22, -0.72]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.35, 6, 16]} />
        <meshStandardMaterial color={body} metalness={0.42} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.22, -1.05]} castShadow>
        <sphereGeometry args={[0.28, 16, 12]} />
        <meshStandardMaterial color={body} metalness={0.42} roughness={0.34} />
      </mesh>

      {/* 薄いウィンドウ帯（前面のみ） */}
      <mesh position={[0, 0.4, -0.55]} rotation={[0.35, 0, 0]}>
        <boxGeometry args={[0.42, 0.14, 0.04]} />
        <meshStandardMaterial
          color="#9ad8ff"
          emissive={accent}
          emissiveIntensity={0.35}
          transparent
          opacity={0.55}
          metalness={0.05}
          roughness={0.12}
        />
      </mesh>

      {/* 左右に真っ直ぐな長い翼 */}
      {([-1, 1] as const).map((side) => (
        <mesh key={`wing-${side}`} position={[side * 0.95, 0.16, 0.15]} castShadow>
          <boxGeometry args={[1.45, 0.04, 0.72]} />
          <meshStandardMaterial color={trim} metalness={0.5} roughness={0.38} />
        </mesh>
      ))}
      {([-1, 1] as const).map((side) => (
        <mesh key={`tip-${side}`} position={[side * 1.68, 0.16, 0.15]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            color={side > 0 ? '#ff6ad5' : accent}
            emissive={side > 0 ? '#ff6ad5' : accent}
            emissiveIntensity={1.0}
          />
        </mesh>
      ))}

      {/* 垂直尾翼 */}
      <mesh position={[0, 0.55, 0.72]} rotation={[0.12, 0, 0]} castShadow>
        <boxGeometry args={[0.04, 0.38, 0.32]} />
        <meshStandardMaterial color={trim} metalness={0.5} roughness={0.38} />
      </mesh>

      {/* アクセントライン */}
      <mesh position={[0, 0.12, -0.35]}>
        <boxGeometry args={[0.8, 0.03, 0.5]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} metalness={0.35} roughness={0.35} />
      </mesh>

      {/* エンジン 3 基 */}
      {([-1, 0, 1] as const).map((side) => (
        <group key={`engine-${side}`} position={[side * 0.2, 0.14, 0.92]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.12, 0.22, 12]} />
            <meshStandardMaterial color="#1c2433" metalness={0.7} roughness={0.28} />
          </mesh>
          <mesh position={[0, 0, 0.14]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial
              color="#ffb060"
              emissive="#ff6a20"
              emissiveIntensity={1.45}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 0.14, 1.2]} intensity={8} distance={6.5} color="#ff8a40" />
    </group>
  )
}
