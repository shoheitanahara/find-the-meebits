import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Light, MathUtils, Vector3 } from 'three'
import { getRidePoint, getRideTangent, starlightRideRuntime } from '../ridePath'

const TMP = new Vector3()
const TMP_TAN = new Vector3()
const LOOK = new Vector3()

/**
 * 出発: 航路の後ろに見える（船は駅の外からスタート）。
 * 到着: 航路の先に見える（船は手前で止まり、駅に突っ込まない）。
 */
export function StarlightStations() {
  return (
    <group>
      <StationAt
        progress={0}
        variant="departure"
        /** 進行方向の反対側＝出発駅は後ろ */
        alongOffset={-16}
        heightOffset={2}
      />
      <StationAt
        progress={1}
        variant="arrival"
        /** 曲線のさらに先＝到着駅は前方に見える */
        alongOffset={18}
        heightOffset={3}
      />
      <WaypointRing progress={0.35} />
      <WaypointRing progress={0.62} accent="#ff6ad5" />
    </group>
  )
}

function StationAt({
  progress,
  variant,
  alongOffset,
  heightOffset,
}: {
  progress: number
  variant: 'departure' | 'arrival'
  alongOffset: number
  heightOffset: number
}) {
  const ref = useRef<Group>(null)
  const accent = variant === 'departure' ? '#5ce0ff' : '#ff6ad5'
  const hull = variant === 'departure' ? '#2a3448' : '#342848'
  const hullDark = '#0e1422'

  useFrame(() => {
    const group = ref.current
    if (!group) return
    getRidePoint(progress, TMP)
    getRideTangent(progress, TMP_TAN)
    group.position.copy(TMP).addScaledVector(TMP_TAN, alongOffset)
    group.position.y += heightOffset
    // 航路方向を向く（出発は船が離れていく方向、到着は船が近づく方向）
    LOOK.copy(group.position).add(TMP_TAN)
    group.lookAt(LOOK.x, group.position.y, LOOK.z)
  })

  return (
    <group ref={ref}>
      {/* リングは航路と直交（レールがリングを貫かないよう横向き） */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[7.2, 0.5, 12, 40]} />
        <meshStandardMaterial color={hull} metalness={0.65} roughness={0.35} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[7.2, 0.12, 8, 40]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.75} />
      </mesh>

      {/* ハブはリング中心だが航路から横にずらす */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.8, 18, 14]} />
        <meshStandardMaterial color={hullDark} metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh scale={1.1}>
        <sphereGeometry args={[1.8, 14, 12]} />
        <meshBasicMaterial color={accent} transparent opacity={0.12} depthWrite={false} />
      </mesh>

      {/* ソーラー翼 */}
      {([-1, 1] as const).map((side) => (
        <group key={side} position={[0, side * 8.5, 0]}>
          <mesh>
            <boxGeometry args={[0.12, 5.5, 2.6]} />
            <meshStandardMaterial color="#1a3050" metalness={0.4} roughness={0.35} />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <boxGeometry args={[0.04, 5.1, 2.3]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.28}
              metalness={0.3}
              roughness={0.4}
            />
          </mesh>
        </group>
      ))}

      {/* ドック・ゲート（航路側に開口を向けて見える） */}
      <mesh position={[0, -5.5, 0]}>
        <boxGeometry args={[2.2, 2.8, 2.2]} />
        <meshStandardMaterial color={hull} metalness={0.55} roughness={0.38} />
      </mesh>
      <mesh position={[0, -7.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.4, 0.22, 10, 28]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.55} />
      </mesh>

      {/* 航法灯 */}
      {[-6.5, 6.5].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <sphereGeometry args={[0.28, 10, 10]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.5}
            toneMapped={false}
          />
        </mesh>
      ))}
      <pointLight intensity={26} distance={48} color={accent} />

      {variant === 'departure' ? (
        <group position={[0, 0, 5]}>
          <mesh>
            <boxGeometry args={[6, 4, 2.2]} />
            <meshStandardMaterial color={hullDark} metalness={0.5} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0, -0.9]}>
            <boxGeometry args={[4.2, 2.6, 0.25]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={0.55}
              transparent
              opacity={0.4}
            />
          </mesh>
        </group>
      ) : (
        <group position={[0, 4.5, -3]}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.55, 7, 10]} />
            <meshStandardMaterial color={hull} metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 3.8, 0]}>
            <sphereGeometry args={[0.85, 12, 12]} />
            <meshStandardMaterial
              color={accent}
              emissive={accent}
              emissiveIntensity={1.6}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}

function WaypointRing({ progress, accent = '#5ce0ff' }: { progress: number; accent?: string }) {
  const ref = useRef<Group>(null)
  const lightRef = useRef<Light>(null)

  useFrame((_, delta) => {
    const group = ref.current
    if (!group) return
    getRidePoint(progress, TMP)
    getRideTangent(progress, TMP_TAN)
    // 航路の少し脇に置き、船がリングに刺さらないようにする
    group.position.copy(TMP)
    group.position.y += 0.5
    group.lookAt(TMP.x + TMP_TAN.x, TMP.y + TMP_TAN.y, TMP.z + TMP_TAN.z)
    group.rotation.z += delta * 0.35

    const near = 1 - Math.min(1, Math.abs(starlightRideRuntime.progress - progress) * 10)
    if (lightRef.current) {
      lightRef.current.intensity = MathUtils.lerp(5, 16, near)
    }
  })

  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[5.2, 0.16, 10, 36]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.55}
          metalness={0.4}
          roughness={0.3}
        />
      </mesh>
      <mesh>
        <torusGeometry args={[4.2, 0.07, 8, 32]} />
        <meshStandardMaterial color="#dff8ff" emissive="#8fdfff" emissiveIntensity={0.35} />
      </mesh>
      <pointLight ref={lightRef} intensity={8} distance={16} color={accent} />
    </group>
  )
}
