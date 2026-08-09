import { SHORE_FISHING } from '../config'
import { isIslandTile, worldToTile } from '../islandTiles'
import { FishingWorldFx } from './FishingTackle'
import { SeaFishShadows } from './SeaFishShadows'
import { VoxelIslandGround } from './VoxelIslandGround'

const PALM_SPOTS = [
  [-5, 3],
  [5, 2],
  [-4, -3],
  [4, -4],
] as const

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

      {/* ヤシ（島タイル上にスナップ） */}
      {PALM_SPOTS.map(([x, z]) => {
        const { tx, tz } = worldToTile(x, z)
        if (!isIslandTile(tx, tz)) return null
        const px = tx + 0.5
        const pz = tz + 0.5
        return (
          <group key={`${tx}-${tz}`} position={[px, SHORE_FISHING.islandTileTopY, pz]}>
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
        )
      })}

      <SeaFishShadows />
      <FishingWorldFx />
    </>
  )
}
