/**
 * VoxelBuilder で作ったモデルを描画する。
 * 通常ボクセル 1 + 発光ボクセル 1 の InstancedMesh だけで1棟を描く。
 */
import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color, InstancedMesh, Object3D } from 'three'
import { getVoxelAnimLevel, type VoxelCell, type VoxelModel } from './voxelBuilder'

/** 発光アニメの更新頻度（毎フレームは更新しない） */
const ANIM_STEPS_PER_SECOND = 8

const scratchObject = new Object3D()
const scratchColor = new Color()

export function VoxelModelMesh({ model }: { model: VoxelModel }) {
  return (
    <>
      <VoxelBatch cells={model.lit} variant="lit" />
      <VoxelBatch cells={model.glow} variant="glow" />
    </>
  )
}

function VoxelBatch({ cells, variant }: { cells: VoxelCell[]; variant: 'lit' | 'glow' }) {
  const meshRef = useRef<InstancedMesh>(null)
  const lastStepRef = useRef(-1)
  /** アニメ付きセルの index だけ覚えておき、更新対象を絞る */
  const animatedIndices = useMemo(
    () => cells.flatMap((cell, index) => (cell.anim ? [index] : [])),
    [cells],
  )

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    cells.forEach((cell, index) => {
      scratchObject.position.set(cell.x, cell.y, cell.z)
      scratchObject.scale.set(cell.sx, cell.sy, cell.sz)
      scratchObject.updateMatrix()
      mesh.setMatrixAt(index, scratchObject.matrix)
      mesh.setColorAt(index, scratchColor.setRGB(cell.r, cell.g, cell.b))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingBox()
    mesh.computeBoundingSphere()
    lastStepRef.current = -1
  }, [cells])

  useFrame(({ clock }) => {
    if (animatedIndices.length === 0) return
    const mesh = meshRef.current
    if (!mesh?.instanceColor) return

    const step = Math.floor(clock.elapsedTime * ANIM_STEPS_PER_SECOND)
    if (step === lastStepRef.current) return
    lastStepRef.current = step

    for (const index of animatedIndices) {
      const cell = cells[index]
      if (!cell.anim) continue
      const level = getVoxelAnimLevel(cell.anim, step)
      mesh.setColorAt(index, scratchColor.setRGB(cell.r * level, cell.g * level, cell.b * level))
    }
    mesh.instanceColor.needsUpdate = true
  })

  if (cells.length === 0) return null

  return (
    <instancedMesh
      // 個数が変わったら作り直す（InstancedMesh は後から容量を増やせない）
      key={cells.length}
      ref={meshRef}
      args={[undefined, undefined, cells.length]}
      castShadow={variant === 'lit'}
      receiveShadow={variant === 'lit'}
    >
      <boxGeometry args={[1, 1, 1]} />
      {variant === 'lit' ? (
        <meshStandardMaterial roughness={0.88} metalness={0.04} />
      ) : (
        <meshBasicMaterial toneMapped={false} />
      )}
    </instancedMesh>
  )
}
