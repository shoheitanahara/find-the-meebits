import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { SHORE_FISHING } from '../config'
import { FishingWorldFx } from './FishingTackle'
import { SeaFishShadows } from './SeaFishShadows'

/** 朝の孤島ビーチ：中央が砂、周囲が海。 */
export function ShoreBeach() {
  const { halfX, halfZ } = SHORE_FISHING.island

  return (
    <>
      <color attach="background" args={['#b9d6f2']} />
      <fog attach="fog" args={['#c8dff2', 42, 120]} />
      <ambientLight intensity={0.78} color="#fff6ea" />
      <hemisphereLight args={['#dff0ff', '#e8c9a0', 0.85]} />
      <directionalLight
        position={[10, 18, 8]}
        intensity={1.45}
        color="#ffe2b0"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-6, 8, -4]} intensity={0.35} color="#a8c8e8" />

      {/* 明るい海 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial
          color="#3aa0c4"
          roughness={0.28}
          metalness={0.22}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* 孤島の砂 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
        scale={[halfX, halfZ, 1]}
        receiveShadow
      >
        <circleGeometry args={[1, 48]} />
        <meshStandardMaterial color="#e6c98a" roughness={0.92} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.025, 0]}
        scale={[halfX * 0.92, halfZ * 0.92, 1]}
        receiveShadow
      >
        <ringGeometry args={[0.82, 1, 48]} />
        <meshStandardMaterial color="#d2b06e" roughness={0.9} />
      </mesh>

      <FoamRing />

      {/* ヤシ */}
      {(
        [
          [-5.2, 3.5],
          [5.5, 2.8],
          [-3.8, -3.2],
          [4.2, -3.8],
        ] as const
      ).map(([x, z]) => (
        <group key={`${x}-${z}`} position={[x, 0, z]}>
          <mesh position={[0, 1.35, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.16, 2.7, 8]} />
            <meshStandardMaterial color="#7a5a40" roughness={0.9} />
          </mesh>
          {([0, 1, 2, 3, 4] as const).map((i) => (
            <mesh
              key={i}
              position={[
                Math.sin((i / 5) * Math.PI * 2) * 0.5,
                2.65,
                Math.cos((i / 5) * Math.PI * 2) * 0.5,
              ]}
              rotation={[0.4, (i / 5) * Math.PI * 2, 0.2]}
              castShadow
            >
              <boxGeometry args={[0.11, 0.04, 1.2]} />
              <meshStandardMaterial color="#4a8a58" roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}

      <SeaFishShadows />
      <FishingWorldFx />
    </>
  )
}

function FoamRing() {
  const ref = useRef<Group>(null)
  const { halfX, halfZ } = SHORE_FISHING.island
  useFrame(({ clock }) => {
    if (!ref.current) return
    const s = 1 + Math.sin(clock.elapsedTime * 0.8) * 0.012
    ref.current.scale.set(halfX * s, halfZ * s, 1)
  })
  return (
    <group ref={ref} position={[0, 0.03, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.96, 1.05, 48]} />
        <meshStandardMaterial color="#f4f8fc" transparent opacity={0.45} roughness={1} />
      </mesh>
    </group>
  )
}
