import { FishingWorldFx } from './FishingTackle'
import { IslandVoxelRocks } from './IslandVoxelRocks'
import { SeaFishShadows } from './SeaFishShadows'
import { VoxelIslandGround } from './VoxelIslandGround'

/** 朝の孤島ビーチ：ボクセル砂浜＋海。 */
export function ShoreBeach() {
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

      <VoxelIslandGround />
      <IslandVoxelRocks />

      <SeaFishShadows />
      <FishingWorldFx />
    </>
  )
}
