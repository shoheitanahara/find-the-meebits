import { PHOTO_STUDIO } from '../config'

/**
 * Sleep ポーズ用のボクセルソファ。
 * 長辺 local X、背もたれ local -Z（Sit 椅子と同じ）。
 */
export function StudioSleepSofa() {
  const { offset, seat, back, arm, leg, colors } = PHOTO_STUDIO.sleepSofa

  return (
    <group position={[offset[0], offset[1], offset[2]]}>
      <mesh position={[0, seat.y, 0]} castShadow receiveShadow>
        <boxGeometry args={[seat.size[0], seat.size[1], seat.size[2]]} />
        <meshStandardMaterial color={colors.seat} roughness={0.8} metalness={0.04} />
      </mesh>
      <mesh position={[back.position[0], back.position[1], back.position[2]]} castShadow>
        <boxGeometry args={[back.size[0], back.size[1], back.size[2]]} />
        <meshStandardMaterial color={colors.back} roughness={0.82} metalness={0.04} />
      </mesh>
      {([-arm.x, arm.x] as const).map((x) => (
        <mesh key={x} position={[x, arm.y, 0]} castShadow>
          <boxGeometry args={[arm.size[0], arm.size[1], arm.size[2]]} />
          <meshStandardMaterial color={colors.arm} roughness={0.8} metalness={0.04} />
        </mesh>
      ))}
      {leg.positions.map(([lx, lz]) => (
        <mesh key={`${lx}-${lz}`} position={[lx, leg.y, lz]} castShadow>
          <boxGeometry args={[leg.size[0], leg.size[1], leg.size[2]]} />
          <meshStandardMaterial color={colors.leg} roughness={0.85} metalness={0.03} />
        </mesh>
      ))}
    </group>
  )
}
