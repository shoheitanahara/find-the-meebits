import { forwardRef, useImperativeHandle, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils } from 'three'
import { useShootingGalleryStore } from '../store'

export type ShootingPistolHandle = {
  getMuzzleWorldPosition: (out: { x: number; y: number; z: number }) => void
}

/** シンプルな射的用ピストル。特定モデルの再現はしない。 */
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
        {/* グリップ */}
        <mesh position={[0, -0.12, -0.02]} castShadow>
          <boxGeometry args={[0.08, 0.22, 0.1]} />
          <meshStandardMaterial color="#4a3224" roughness={0.85} />
        </mesh>
        {/* スライド / 銃身 */}
        <mesh position={[0, 0.02, 0.12]} castShadow>
          <boxGeometry args={[0.09, 0.1, 0.32]} />
          <meshStandardMaterial color="#6a7078" metalness={0.45} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.0, 0.32]} castShadow>
          <cylinderGeometry args={[0.028, 0.032, 0.18, 10]} />
          <meshStandardMaterial color="#5a6068" metalness={0.5} roughness={0.35} />
        </mesh>
        {/* サイト */}
        <mesh position={[0, 0.08, 0.02]}>
          <boxGeometry args={[0.03, 0.04, 0.04]} />
          <meshStandardMaterial color="#3a4048" metalness={0.35} roughness={0.45} />
        </mesh>
        <group ref={muzzleRef} position={[0, 0.0, 0.42]} />
        <group ref={flashRef} position={[0, 0.0, 0.45]} visible={false}>
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
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
