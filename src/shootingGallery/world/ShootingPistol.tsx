import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import { useShootingGalleryStore } from '../store'

export type ShootingPistolHandle = {
  getMuzzleWorldPosition: (out: { x: number; y: number; z: number }) => void
}

/** 一般的なセミオート拳銃の構造を持つ射的用ピストル。特定モデルは再現しない。 */
export const ShootingPistol = forwardRef<ShootingPistolHandle, { visible: boolean }>(
  function ShootingPistol({ visible }, ref) {
    const rootRef = useRef<Group>(null)
    const muzzleRef = useRef<Group>(null)
    const flashRef = useRef<Group>(null)
    const recoilRef = useRef(0)

    useImperativeHandle(ref, () => ({
      getMuzzleWorldPosition: (out) => {
        const muzzle = muzzleRef.current
        if (!muzzle) {
          out.x = 0
          out.y = 0
          out.z = 0
          return
        }
        const world = muzzle.getWorldPosition(muzzle.position.clone())
        out.x = world.x
        out.y = world.y
        out.z = world.z
      },
    }))

    useFrame((_, delta) => {
      const root = rootRef.current
      if (!root) return
      const now = performance.now()
      const recoilUntil = useShootingGalleryStore.getState().recoilUntil
      const fireFlashUntil = useShootingGalleryStore.getState().fireFlashUntil
      const targetRecoil = now < recoilUntil ? 1 : 0
      recoilRef.current = MathUtils.lerp(recoilRef.current, targetRecoil, 1 - Math.exp(-delta * 22))
      root.rotation.x = -recoilRef.current * 0.28
      root.position.z = -recoilRef.current * 0.04
      if (flashRef.current) {
        flashRef.current.visible = now < fireFlashUntil
      }
    })

    if (!visible) return null

    return (
      <group ref={rootRef}>
        <PistolGrip />
        <PistolFrame />
        <PistolSlide />

        <group ref={muzzleRef} position={[0, 0.07, 0.285]} />
        <group ref={flashRef} position={[0, 0.07, 0.315]} visible={false}>
          <mesh>
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshStandardMaterial
              color="#ffe8a0"
              emissive="#ffb040"
              emissiveIntensity={2.2}
              transparent
              opacity={0.85}
            />
          </mesh>
          <pointLight intensity={6} distance={2.2} color="#ffc060" />
        </group>
      </group>
    )
  },
)

const GUNMETAL = '#596166'
const DARK_STEEL = '#272c2f'
const FRAME_METAL = '#454d51'
const GRIP_COLOR = '#49372e'

function PistolGrip() {
  return (
    <group position={[0, -0.145, -0.055]} rotation={[0.17, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.245, 0.12]} />
        <meshStandardMaterial
          color={GRIP_COLOR}
          roughness={0.78}
          metalness={0.05}
          emissive="#130c09"
          emissiveIntensity={0.24}
        />
      </mesh>
      {([-0.053, 0.053] as const).map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.008, 0.185, 0.09]} />
            <meshStandardMaterial color="#342c26" roughness={0.88} />
          </mesh>
          {[-0.065, -0.025, 0.015, 0.055].map((y) => (
            <mesh key={y} position={[x > 0 ? 0.005 : -0.005, y, 0.002]}>
              <boxGeometry args={[0.006, 0.012, 0.075]} />
              <meshStandardMaterial color="#181615" roughness={0.9} />
            </mesh>
          ))}
          <mesh position={[x > 0 ? 0.006 : -0.006, 0.065, 0.035]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.011, 0.011, 0.008, 12]} />
            <meshStandardMaterial color="#54504a" metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.135, -0.002]} castShadow>
        <boxGeometry args={[0.112, 0.026, 0.132]} />
        <meshStandardMaterial color="#17191a" metalness={0.32} roughness={0.48} />
      </mesh>
    </group>
  )
}

function PistolFrame() {
  return (
    <group>
      <mesh position={[0, -0.015, 0.035]} castShadow receiveShadow>
        <boxGeometry args={[0.098, 0.085, 0.285]} />
        <meshStandardMaterial
          color={FRAME_METAL}
          metalness={0.58}
          roughness={0.38}
          emissive="#151a1c"
          emissiveIntensity={0.22}
        />
      </mesh>
      <mesh position={[0, -0.005, 0.17]} castShadow>
        <boxGeometry args={[0.09, 0.052, 0.16]} />
        <meshStandardMaterial color="#292f32" metalness={0.55} roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.015, -0.125]} rotation={[0.22, 0, 0]} castShadow>
        <boxGeometry args={[0.11, 0.045, 0.085]} />
        <meshStandardMaterial color={FRAME_METAL} metalness={0.55} roughness={0.42} />
      </mesh>

      {/* トリガーガードと湾曲したトリガー。 */}
      <mesh
        position={[0, -0.09, 0.035]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[1, 1.12, 0.78]}
        castShadow
      >
        <torusGeometry args={[0.054, 0.011, 8, 22]} />
        <meshStandardMaterial color={DARK_STEEL} metalness={0.62} roughness={0.38} />
      </mesh>
      <mesh position={[0, -0.075, 0.002]} rotation={[-0.28, 0, 0]} castShadow>
        <boxGeometry args={[0.018, 0.065, 0.014]} />
        <meshStandardMaterial color="#111416" metalness={0.65} roughness={0.32} />
      </mesh>

      {/* スライドストップ／分解レバー。 */}
      <mesh position={[0.054, 0.015, -0.035]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.012, 14]} />
        <meshStandardMaterial color="#171b1d" metalness={0.7} roughness={0.32} />
      </mesh>
      <mesh position={[0.058, 0.02, 0.01]} castShadow>
        <boxGeometry args={[0.012, 0.018, 0.07]} />
        <meshStandardMaterial color="#171b1d" metalness={0.68} roughness={0.34} />
      </mesh>
    </group>
  )
}

function PistolSlide() {
  return (
    <group>
      {/* 銃身を覆う低く長いスライド。 */}
      <mesh position={[0, 0.075, 0.065]} castShadow receiveShadow>
        <boxGeometry args={[0.108, 0.108, 0.39]} />
        <meshStandardMaterial
          color={GUNMETAL}
          metalness={0.78}
          roughness={0.3}
          emissive="#1b2023"
          emissiveIntensity={0.26}
        />
      </mesh>
      <mesh position={[0, 0.135, 0.065]} castShadow>
        <boxGeometry args={[0.082, 0.018, 0.325]} />
        <meshStandardMaterial color="#353a3d" metalness={0.76} roughness={0.28} />
      </mesh>

      {/* 排莢口。 */}
      <mesh position={[0.025, 0.145, 0.075]}>
        <boxGeometry args={[0.055, 0.009, 0.095]} />
        <meshStandardMaterial color="#101416" metalness={0.72} roughness={0.3} />
      </mesh>
      <mesh position={[0.055, 0.09, 0.075]}>
        <boxGeometry args={[0.008, 0.048, 0.09]} />
        <meshStandardMaterial color="#171a1c" metalness={0.68} roughness={0.3} />
      </mesh>

      <SlideSerrations side={-1} />
      <SlideSerrations side={1} />

      {/* 前後サイト。 */}
      {([-0.028, 0.028] as const).map((x) => (
        <mesh key={x} position={[x, 0.162, -0.108]} castShadow>
          <boxGeometry args={[0.018, 0.032, 0.034]} />
          <meshStandardMaterial color="#111517" metalness={0.68} roughness={0.34} />
        </mesh>
      ))}
      <mesh position={[0, 0.158, 0.235]} castShadow>
        <boxGeometry args={[0.018, 0.027, 0.032]} />
        <meshStandardMaterial color="#111517" metalness={0.68} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.173, 0.245]}>
        <sphereGeometry args={[0.005, 8, 6]} />
        <meshBasicMaterial color="#e6e1cb" />
      </mesh>

      {/* 銃口面と、スライド内部に収まるバレル。 */}
      <mesh position={[0, 0.075, 0.264]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.012, 20]} />
        <meshStandardMaterial color="#454a4c" metalness={0.82} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0.075, 0.271]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.021, 0.021, 0.014, 20]} />
        <meshStandardMaterial color="#080a0b" metalness={0.3} roughness={0.62} />
      </mesh>

      {/* 後部ハンマー。 */}
      <mesh position={[0, 0.127, -0.15]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.055, 0.06, 0.03]} />
        <meshStandardMaterial color="#171a1c" metalness={0.72} roughness={0.34} />
      </mesh>
    </group>
  )
}

function SlideSerrations({ side }: { side: -1 | 1 }) {
  return (
    <group position={[side * 0.056, 0.085, -0.075]}>
      {[-0.045, -0.022, 0, 0.022, 0.045].map((z) => (
        <mesh key={z} position={[0, 0, z]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[0.007, 0.074, 0.009]} />
          <meshStandardMaterial color="#111416" metalness={0.72} roughness={0.34} />
        </mesh>
      ))}
    </group>
  )
}
