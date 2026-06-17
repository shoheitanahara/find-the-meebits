import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh, MeshStandardMaterial, PointLight } from 'three'

export function TargetAnswerGlow() {
  const rootRef = useRef<Group>(null)
  const ringRef = useRef<Mesh>(null)
  const innerRingRef = useRef<Mesh>(null)
  const markerRef = useRef<Mesh>(null)
  const lightRef = useRef<PointLight>(null)

  useFrame((state) => {
    const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 3.4) * 0.45
    const ringScale = 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.14

    ringRef.current?.scale.set(ringScale, ringScale, 1)
    innerRingRef.current?.scale.set(ringScale * 0.82, ringScale * 0.82, 1)

    const outerMaterial = ringRef.current?.material as MeshStandardMaterial | undefined
    if (outerMaterial) {
      outerMaterial.emissiveIntensity = pulse * 1.6
      outerMaterial.opacity = 0.55 + pulse * 0.35
    }

    const innerMaterial = innerRingRef.current?.material as MeshStandardMaterial | undefined
    if (innerMaterial) {
      innerMaterial.emissiveIntensity = pulse * 2.2
    }

    const markerMaterial = markerRef.current?.material as MeshStandardMaterial | undefined
    if (markerMaterial) {
      markerMaterial.emissiveIntensity = pulse * 2.4
    }

    if (lightRef.current) {
      lightRef.current.intensity = 1.8 + pulse * 3.2
    }

    if (markerRef.current) {
      markerRef.current.position.y = 3.05 + Math.sin(state.clock.elapsedTime * 4.2) * 0.18
    }

    if (rootRef.current) {
      rootRef.current.rotation.y = state.clock.elapsedTime * 0.35
    }
  })

  return (
    <group ref={rootRef}>
      <pointLight ref={lightRef} color="#fbbf24" intensity={3.5} distance={12} position={[0, 2.1, 0]} />

      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.72, 1.12, 48]} />
        <meshStandardMaterial
          color="#fde047"
          emissive="#f59e0b"
          emissiveIntensity={1.4}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={innerRingRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[0.38, 0.58, 32]} />
        <meshStandardMaterial
          color="#fffbeb"
          emissive="#fcd34d"
          emissiveIntensity={1.8}
          transparent
          opacity={0.95}
          toneMapped={false}
        />
      </mesh>

      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 3.1, 12]} />
        <meshStandardMaterial
          color="#fef3c7"
          emissive="#f59e0b"
          emissiveIntensity={0.9}
          transparent
          opacity={0.28}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={markerRef} position={[0, 3.05, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial
          color="#fff7ed"
          emissive="#fbbf24"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
