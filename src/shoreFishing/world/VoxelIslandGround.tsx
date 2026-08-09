/**
 * 岸釣り孤島のボクセル床。砂／砂利／土の 1×1 タイル。
 */
import { useLayoutEffect, useMemo, useRef } from 'react'
import {
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  type Texture,
} from 'three'
import { getBlockTexture } from '../../mountain/blockTextures'
import { SHORE_FISHING } from '../config'
import {
  getIslandTiles,
  ISLAND_TILE,
  type IslandFloorKind,
} from '../islandTiles'

const scratch = new Object3D()
const TILE_H = SHORE_FISHING.islandTileTopY

function FloorBatch({
  kind,
  positions,
}: {
  kind: IslandFloorKind
  positions: Array<{ x: number; z: number }>
}) {
  const meshRef = useRef<InstancedMesh>(null)
  const material = useMemo(() => {
    const map = getBlockTexture(kind, 'all') as Texture
    return new MeshStandardMaterial({
      map,
      roughness: 0.94,
      metalness: 0.02,
    })
  }, [kind])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    positions.forEach((pos, index) => {
      scratch.position.set(pos.x + ISLAND_TILE * 0.5, TILE_H * 0.5, pos.z + ISLAND_TILE * 0.5)
      scratch.scale.set(ISLAND_TILE * 0.98, TILE_H, ISLAND_TILE * 0.98)
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [positions])

  if (positions.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, positions.length]}
      receiveShadow
      castShadow={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  )
}

/** 島周囲の浅瀬（水色）。常時表示。岸から 1 タイル分だけ */
function ShallowShelf() {
  const meshRef = useRef<InstancedMesh>(null)

  const { shallowCells } = useMemo(() => {
    const tiles = getIslandTiles()
    const land = new Set(tiles.map((t) => `${t.tx},${t.tz}`))
    const shallow: Array<{ x: number; z: number }> = []
    const seen = new Set<string>()

    const { halfX, halfZ } = SHORE_FISHING.island
    const xMin = -Math.ceil(halfX) - 3
    const xMax = Math.ceil(halfX) + 3
    const zMin = -Math.ceil(halfZ) - 3
    const zMax = Math.ceil(halfZ) + 3

    for (let tx = xMin; tx <= xMax; tx++) {
      for (let tz = zMin; tz <= zMax; tz++) {
        if (land.has(`${tx},${tz}`)) continue
        let minDist = 99
        for (const t of tiles) {
          const d = Math.max(Math.abs(tx - t.tx), Math.abs(tz - t.tz))
          if (d < minDist) minDist = d
          if (minDist <= 1) break
        }
        if (minDist > 1) continue
        const key = `${tx},${tz}`
        if (seen.has(key)) continue
        seen.add(key)
        shallow.push({ x: tx, z: tz })
      }
    }
    return { shallowCells: shallow }
  }, [])

  const shallowMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#6ec8e8',
        transparent: true,
        opacity: 0.8,
        roughness: 0.32,
        metalness: 0.1,
        depthWrite: false,
      }),
    [],
  )

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    shallowCells.forEach((pos, index) => {
      scratch.position.set(pos.x + 0.5, 0.02, pos.z + 0.5)
      scratch.scale.set(0.98, 0.06, 0.98)
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [shallowCells])

  if (shallowCells.length === 0) return null

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, shallowCells.length]}
      receiveShadow={false}
      castShadow={false}
      renderOrder={2}
    >
      <boxGeometry args={[1, 1, 1]} />
      <primitive object={shallowMat} attach="material" />
    </instancedMesh>
  )
}

export function VoxelIslandGround() {
  const batches = useMemo(() => {
    const byKind = new Map<IslandFloorKind, Array<{ x: number; z: number }>>()
    for (const tile of getIslandTiles()) {
      const list = byKind.get(tile.kind) ?? []
      list.push({ x: tile.tx * ISLAND_TILE, z: tile.tz * ISLAND_TILE })
      byKind.set(tile.kind, list)
    }
    return (['sand', 'gravel', 'dirt'] as const).map((kind) => ({
      kind,
      positions: byKind.get(kind) ?? [],
    }))
  }, [])

  return (
    <group>
      {batches.map((batch) => (
        <FloorBatch key={batch.kind} kind={batch.kind} positions={batch.positions} />
      ))}
      <ShallowShelf />
    </group>
  )
}
