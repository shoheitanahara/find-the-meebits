import { PHOTO_STUDIO } from '../config'

/**
 * Sit ポーズ用のシンプルなボクセル長椅子。
 * 座面・背もたれ（-Z）・脚のみ。Runway ベンチの短縮版。
 */
export function StudioSitChair() {
  const { offset, seat, back, leg, colors } = PHOTO_STUDIO.sitChair

  return (
    <group position={[offset[0], offset[1], offset[2]]}>
      <mesh position={[0, seat.y, 0]} castShadow receiveShadow>
        <boxGeometry args={[seat.size[0], seat.size[1], seat.size[2]]} />
        <meshStandardMaterial color={colors.seat} roughness={0.78} metalness={0.04} />
      </mesh>
      <mesh position={[back.position[0], back.position[1], back.position[2]]} castShadow>
        <boxGeometry args={[back.size[0], back.size[1], back.size[2]]} />
        <meshStandardMaterial color={colors.back} roughness={0.8} metalness={0.04} />
      </mesh>
      {leg.positions.map(([lx, lz]) => (
        <mesh key={`${lx}-${lz}`} position={[lx, leg.y, lz]} castShadow>
          <boxGeometry args={[leg.size[0], leg.size[1], leg.size[2]]} />
          <meshStandardMaterial color={colors.leg} roughness={0.85} metalness={0.03} />
        </mesh>
      ))}
    </group>
  )
}
