/**
 * 島の小さなボクセル岩・小山。ヤシ代わりの控えめな景観。
 * 石にコケ／草ブロックを載せて緑を足す。
 */
import { useMemo } from 'react'
import { getBlockTexture } from '../../mountain/blockTextures'
import { SHORE_FISHING } from '../config'
import { ISLAND_ROCKS, type IslandRockSpot } from '../islandRocks'

type BlockKind = 'stone' | 'darkStone' | 'gravel' | 'moss' | 'mossDark'

type Block = {
  x: number
  y: number
  z: number
  sx: number
  sy: number
  sz: number
  kind: BlockKind
}

function blocksFor(spot: IslandRockSpot): Block[] {
  const y0 = SHORE_FISHING.islandTileTopY
  if (spot.kind === 'pebble') {
    return [
      { x: 0, y: y0 + 0.14, z: 0, sx: 0.42, sy: 0.28, sz: 0.38, kind: 'stone' },
      { x: 0.22, y: y0 + 0.1, z: 0.12, sx: 0.28, sy: 0.2, sz: 0.26, kind: 'gravel' },
      { x: -0.18, y: y0 + 0.09, z: -0.1, sx: 0.24, sy: 0.18, sz: 0.22, kind: 'darkStone' },
      { x: 0.02, y: y0 + 0.3, z: 0.02, sx: 0.32, sy: 0.1, sz: 0.28, kind: 'moss' },
      { x: 0.2, y: y0 + 0.22, z: 0.1, sx: 0.2, sy: 0.08, sz: 0.18, kind: 'mossDark' },
    ]
  }
  if (spot.kind === 'boulder') {
    return [
      { x: 0, y: y0 + 0.28, z: 0, sx: 0.7, sy: 0.55, sz: 0.62, kind: 'stone' },
      { x: 0.28, y: y0 + 0.18, z: 0.18, sx: 0.4, sy: 0.36, sz: 0.38, kind: 'darkStone' },
      { x: -0.22, y: y0 + 0.16, z: -0.2, sx: 0.36, sy: 0.32, sz: 0.34, kind: 'gravel' },
      { x: 0.05, y: y0 + 0.55, z: -0.05, sx: 0.38, sy: 0.28, sz: 0.34, kind: 'stone' },
      { x: -0.05, y: y0 + 0.58, z: 0.08, sx: 0.48, sy: 0.12, sz: 0.4, kind: 'moss' },
      { x: 0.28, y: y0 + 0.4, z: 0.12, sx: 0.28, sy: 0.1, sz: 0.26, kind: 'mossDark' },
      { x: 0.08, y: y0 + 0.72, z: -0.08, sx: 0.26, sy: 0.1, sz: 0.22, kind: 'moss' },
    ]
  }
  // hill: 低い段差の小山
  return [
    { x: 0, y: y0 + 0.22, z: 0, sx: 1.05, sy: 0.44, sz: 0.95, kind: 'stone' },
    { x: 0.15, y: y0 + 0.22, z: 0.35, sx: 0.55, sy: 0.4, sz: 0.5, kind: 'gravel' },
    { x: -0.25, y: y0 + 0.2, z: -0.3, sx: 0.5, sy: 0.36, sz: 0.48, kind: 'darkStone' },
    { x: 0, y: y0 + 0.58, z: 0, sx: 0.7, sy: 0.4, sz: 0.62, kind: 'stone' },
    { x: 0.1, y: y0 + 0.55, z: 0.15, sx: 0.4, sy: 0.32, sz: 0.36, kind: 'darkStone' },
    { x: 0, y: y0 + 0.9, z: 0, sx: 0.42, sy: 0.32, sz: 0.38, kind: 'stone' },
    { x: -0.1, y: y0 + 0.48, z: 0.05, sx: 0.7, sy: 0.14, sz: 0.55, kind: 'moss' },
    { x: 0.2, y: y0 + 0.46, z: 0.3, sx: 0.4, sy: 0.12, sz: 0.36, kind: 'mossDark' },
    { x: 0.05, y: y0 + 0.82, z: 0, sx: 0.5, sy: 0.12, sz: 0.44, kind: 'moss' },
    { x: 0, y: y0 + 1.08, z: 0.02, sx: 0.3, sy: 0.1, sz: 0.26, kind: 'mossDark' },
  ]
}

function RockMesh({ spot }: { spot: IslandRockSpot }) {
  const blocks = useMemo(() => blocksFor(spot), [spot])
  const materials = useMemo(
    () => ({
      stone: getBlockTexture('stone', 'all'),
      darkStone: getBlockTexture('darkStone', 'all'),
      gravel: getBlockTexture('gravel', 'all'),
      moss: getBlockTexture('grass', 'top'),
      mossDark: getBlockTexture('grass', 'top'),
    }),
    [],
  )

  return (
    <group position={[spot.x, 0, spot.z]}>
      {blocks.map((b, i) => {
        const isMoss = b.kind === 'moss' || b.kind === 'mossDark'
        return (
          <mesh key={i} position={[b.x, b.y, b.z]} castShadow receiveShadow>
            <boxGeometry args={[b.sx, b.sy, b.sz]} />
            <meshStandardMaterial
              map={materials[b.kind]}
              color={b.kind === 'mossDark' ? '#6a9a48' : isMoss ? '#8fbc5a' : '#ffffff'}
              roughness={isMoss ? 0.98 : 0.92}
              metalness={0.02}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function IslandVoxelRocks() {
  return (
    <>
      {ISLAND_ROCKS.map((spot) => (
        <RockMesh key={`${spot.x}-${spot.z}`} spot={spot} />
      ))}
    </>
  )
}
