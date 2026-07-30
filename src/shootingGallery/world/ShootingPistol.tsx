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
        <group scale={[0.8, 0.8, 0.84]}>
          <VintageGrip />
          <VintageFrame />
          <VintageReceiver />

          <group ref={muzzleRef} position={[0, 0.075, 0.405]} />
          <group ref={flashRef} position={[0, 0.075, 0.435]} visible={false}>
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
      </group>
    )
  },
)

const AGED_BRASS = '#86653d'
const POLISHED_BRASS = '#b18a50'
const DARK_BRASS = '#4e3c29'
const BLUE_ENAMEL = '#9eb8c0'
const DARK_STEEL = '#25292a'

function VintageGrip() {
  return (
    <group position={[0, -0.155, -0.055]} rotation={[0.2, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.115, 0.255, 0.135]} />
        <meshStandardMaterial
          color={AGED_BRASS}
          roughness={0.34}
          metalness={0.78}
          emissive="#201406"
          emissiveIntensity={0.12}
        />
      </mesh>
      {([-0.061, 0.061] as const).map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.009, 0.19, 0.098]} />
            <meshStandardMaterial
              color={BLUE_ENAMEL}
              roughness={0.42}
              metalness={0.18}
              emissive="#17272b"
              emissiveIntensity={0.16}
            />
          </mesh>
          {[-0.065, -0.025, 0.015, 0.055].map((y, index) => (
            <mesh
              key={y}
              position={[x > 0 ? 0.006 : -0.006, y, 0]}
              rotation={[0.25 + index * 0.12, 0, 0]}
            >
              <boxGeometry args={[0.006, 0.012, 0.102]} />
              <meshStandardMaterial
                color="#dce8e5"
                roughness={0.36}
                metalness={0.08}
              />
            </mesh>
          ))}
          <mesh
            position={[x > 0 ? 0.007 : -0.007, 0.075, 0.04]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.012, 0.012, 0.009, 12]} />
            <meshStandardMaterial
              color={POLISHED_BRASS}
              metalness={0.82}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}
      <mesh position={[0, -0.143, 0]} castShadow>
        <boxGeometry args={[0.13, 0.032, 0.148]} />
        <meshStandardMaterial
          color={DARK_BRASS}
          metalness={0.76}
          roughness={0.34}
        />
      </mesh>
    </group>
  )
}

function VintageFrame() {
  return (
    <group>
      <mesh position={[0, -0.005, -0.02]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.09, 0.22]} />
        <meshStandardMaterial
          color={DARK_BRASS}
          metalness={0.78}
          roughness={0.32}
        />
      </mesh>

      {/* 参考画像の大きな角型トリガーガード。 */}
      <mesh position={[0, -0.16, 0.045]} castShadow>
        <boxGeometry args={[0.115, 0.014, 0.17]} />
        <meshStandardMaterial color={AGED_BRASS} metalness={0.8} roughness={0.3} />
      </mesh>
      {([-0.035, 0.125] as const).map((z) => (
        <mesh key={z} position={[0, -0.1, z]} castShadow>
          <boxGeometry args={[0.115, 0.135, 0.014]} />
          <meshStandardMaterial
            color={AGED_BRASS}
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* 引き金を収める機関部。ガード上部を塞ぎ、筒抜けに見せない。 */}
      <mesh position={[0, -0.062, 0.022]} castShadow receiveShadow>
        <boxGeometry args={[0.086, 0.058, 0.145]} />
        <meshStandardMaterial
          color={DARK_BRASS}
          metalness={0.76}
          roughness={0.34}
        />
      </mesh>
      <mesh position={[0, -0.085, 0.098]} castShadow>
        <boxGeometry args={[0.072, 0.055, 0.036]} />
        <meshStandardMaterial color={AGED_BRASS} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.072, -0.052]} castShadow>
        <boxGeometry args={[0.108, 0.12, 0.05]} />
        <meshStandardMaterial
          color={DARK_BRASS}
          metalness={0.76}
          roughness={0.34}
        />
      </mesh>

      {/* 引き金：支点から下へ湾曲する、厚みのある真鍮レバー。 */}
      <mesh position={[0, -0.08, 0.022]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.013, 0.013, 0.052, 14]} />
        <meshStandardMaterial
          color={POLISHED_BRASS}
          metalness={0.86}
          roughness={0.22}
        />
      </mesh>
      <mesh position={[0, -0.098, 0.016]} rotation={[-0.16, 0, 0]} castShadow>
        <boxGeometry args={[0.032, 0.05, 0.04]} />
        <meshStandardMaterial
          color={BLUE_ENAMEL}
          metalness={0.26}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, -0.121, 0.004]} rotation={[-0.42, 0, 0]} castShadow>
        <boxGeometry args={[0.032, 0.044, 0.036]} />
        <meshStandardMaterial
          color={BLUE_ENAMEL}
          metalness={0.26}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, -0.13, -0.004]} rotation={[-0.8, 0, 0]} castShadow>
        <boxGeometry args={[0.032, 0.03, 0.028]} />
        <meshStandardMaterial
          color={POLISHED_BRASS}
          metalness={0.86}
          roughness={0.22}
        />
      </mesh>

      {/* 後部の機械式ハンマーとサイト。 */}
      <mesh position={[0, 0.18, -0.13]} rotation={[-0.4, 0, 0]} castShadow>
        <boxGeometry args={[0.075, 0.075, 0.028]} />
        <meshStandardMaterial
          color={AGED_BRASS}
          metalness={0.78}
          roughness={0.3}
        />
      </mesh>
    </group>
  )
}

function VintageReceiver() {
  return (
    <group>
      {/* 真鍮製の露出エネルギーチャンバー。 */}
      <mesh
        position={[0, 0.08, 0.045]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.066, 0.066, 0.29, 24]} />
        <meshStandardMaterial
          color={AGED_BRASS}
          metalness={0.82}
          roughness={0.28}
          emissive="#261707"
          emissiveIntensity={0.1}
        />
      </mesh>
      <mesh position={[0, 0.08, 0.115]} castShadow>
        <torusGeometry args={[0.069, 0.009, 10, 24]} />
        <meshStandardMaterial
          color={POLISHED_BRASS}
          metalness={0.88}
          roughness={0.22}
        />
      </mesh>

      {/* カメラ側の後端は閉じた角型機関部にし、第二の銃口に見せない。 */}
      <mesh position={[0, 0.075, -0.145]} castShadow receiveShadow>
        <boxGeometry args={[0.12, 0.13, 0.105]} />
        <meshStandardMaterial
          color={DARK_BRASS}
          metalness={0.78}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, 0.148, -0.143]} castShadow>
        <boxGeometry args={[0.104, 0.026, 0.112]} />
        <meshStandardMaterial
          color={AGED_BRASS}
          metalness={0.82}
          roughness={0.28}
        />
      </mesh>
      {([-0.064, 0.064] as const).map((x) => (
        <mesh key={`breech-side-${x}`} position={[x, 0.075, -0.145]} castShadow>
          <boxGeometry args={[0.009, 0.1, 0.082]} />
          <meshStandardMaterial
            color={POLISHED_BRASS}
            metalness={0.86}
            roughness={0.24}
          />
        </mesh>
      ))}

      {/* 段付きの前部バレルと放熱リング。 */}
      <mesh
        position={[0, 0.08, 0.27]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.057, 0.064, 0.2, 24]} />
        <meshStandardMaterial
          color={DARK_BRASS}
          metalness={0.84}
          roughness={0.26}
        />
      </mesh>
      {[0.205, 0.245, 0.285, 0.325].map((z) => (
        <mesh key={`barrel-ring-${z}`} position={[0, 0.08, z]} castShadow>
          <torusGeometry args={[0.064, 0.009, 8, 22]} />
          <meshStandardMaterial
            color={POLISHED_BRASS}
            metalness={0.88}
            roughness={0.22}
          />
        </mesh>
      ))}
      <mesh
        position={[0, 0.08, 0.382]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.067, 0.058, 0.035, 24]} />
        <meshStandardMaterial
          color={AGED_BRASS}
          metalness={0.86}
          roughness={0.24}
        />
      </mesh>
      <mesh position={[0, 0.08, 0.401]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.012, 20]} />
        <meshStandardMaterial color="#090a09" metalness={0.2} roughness={0.66} />
      </mesh>

      <VintageCageRails />
    </group>
  )
}

function VintageCageRails() {
  return (
    <group>
      {([-0.015, 0.178] as const).map((y) => (
        <mesh key={y} position={[0, y, 0.055]} castShadow>
          <boxGeometry args={[0.128, 0.012, 0.43]} />
          <meshStandardMaterial
            color={AGED_BRASS}
            metalness={0.82}
            roughness={0.3}
          />
        </mesh>
      ))}
      {([-0.07, 0.19] as const).map((z) => (
        <group key={z}>
          {([-0.068, 0.068] as const).map((x) => (
            <mesh key={x} position={[x, 0.08, z]} castShadow>
              <boxGeometry args={[0.011, 0.19, 0.014]} />
              <meshStandardMaterial
                color={AGED_BRASS}
                metalness={0.82}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 0.21, 0.17]} castShadow>
        <boxGeometry args={[0.075, 0.065, 0.025]} />
        <meshStandardMaterial
          color={POLISHED_BRASS}
          metalness={0.86}
          roughness={0.24}
        />
      </mesh>
    </group>
  )
}
