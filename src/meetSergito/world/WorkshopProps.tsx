import { Text } from '@react-three/drei'
import { MEET_SERGITO, WORKSHOP_DESK_TOP_Y } from '../config'

/** 立ち作業用デスク（天板 ~1.05m） */
export function WorkshopDesk() {
  const { desk, colors } = MEET_SERGITO
  const topY = WORKSHOP_DESK_TOP_Y
  const deskSurfaceY = topY + 0.035
  const legH = topY - 0.04

  return (
    <group position={[desk.x, 0, desk.z]}>
      <mesh position={[0, topY, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.07, 1.35]} />
        <meshStandardMaterial color={colors.wood} roughness={0.62} metalness={0.05} />
      </mesh>
      {[
        [-1.45, -0.55],
        [1.45, -0.55],
        [-1.45, 0.55],
        [1.45, 0.55],
      ].map(([lx, lz]) => (
        <mesh key={`${lx}-${lz}`} position={[lx, legH / 2, lz]} castShadow>
          <boxGeometry args={[0.07, legH, 0.07]} />
          <meshStandardMaterial color={colors.metal} roughness={0.42} metalness={0.55} />
        </mesh>
      ))}

      {/* モニター — 天板上面から積み上げ */}
      <group position={[0.55, deskSurfaceY, -0.2]}>
        <mesh position={[0, 0.11, 0.02]} castShadow>
          <boxGeometry args={[0.14, 0.22, 0.12]} />
          <meshStandardMaterial color={colors.metal} roughness={0.45} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.38, 0]} castShadow>
          <boxGeometry args={[0.85, 0.52, 0.05]} />
          <meshStandardMaterial color="#1a1a20" roughness={0.35} metalness={0.45} />
        </mesh>
        <mesh position={[0, 0.38, 0.03]}>
          <boxGeometry args={[0.78, 0.44, 0.015]} />
          <meshStandardMaterial
            color={colors.screen}
            emissive={colors.screenGlow}
            emissiveIntensity={0.65}
            roughness={0.25}
          />
        </mesh>
        <Text
          position={[0, 0.38, 0.045]}
          fontSize={0.11}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          MEEBCO
        </Text>
      </group>

      {/* デスクランプ — 底座が天板に乗る */}
      <group position={[-1.05, deskSurfaceY, 0.35]}>
        <mesh position={[0, 0.21, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.06, 0.42, 10]} />
          <meshStandardMaterial color="#3a3530" roughness={0.48} metalness={0.35} />
        </mesh>
        <mesh position={[0, 0.49, 0]}>
          <sphereGeometry args={[0.11, 14, 12]} />
          <meshStandardMaterial
            color="#fff6e8"
            emissive="#ffb860"
            emissiveIntensity={0.55}
            roughness={0.35}
          />
        </mesh>
        <pointLight position={[0, 0.46, 0]} intensity={8} distance={4.5} decay={2} color="#ffd090" />
      </group>

      <mesh position={[-0.35, deskSurfaceY + 0.01, 0.25]} rotation={[-0.08, 0.25, 0.12]} castShadow>
        <boxGeometry args={[0.42, 0.02, 0.32]} />
        <meshStandardMaterial color="#f2ead8" roughness={0.88} />
      </mesh>
      <mesh position={[1.15, deskSurfaceY + 0.11, 0.15]} rotation={[0, -0.35, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.22, 8]} />
        <meshStandardMaterial color="#4a6070" roughness={0.35} metalness={0.55} />
      </mesh>
    </group>
  )
}
