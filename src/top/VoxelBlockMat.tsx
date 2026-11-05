/**
 * Mt. Meeb / Mountain エリア共通のボクセルブロック材質（ニアレストテクスチャ）。
 */
import { useMemo } from 'react'
import { MeshStandardMaterial, RepeatWrapping, type Material } from 'three'
import { getBlockTexture, getGrassMaterials, type BlockKind } from '../mountain/blockTextures'

export type { BlockKind }

/** JSX 用: `<mesh><boxGeometry /><VoxelBlockMat kind="stone" /></mesh>` */
export function VoxelBlockMat({
  kind,
  face = 'all',
}: {
  kind: BlockKind
  face?: 'top' | 'side' | 'all'
}) {
  const map = useMemo(() => getBlockTexture(kind, face === 'side' ? 'side' : face), [kind, face])
  return <meshStandardMaterial map={map} roughness={0.95} metalness={0.02} />
}

/**
 * 大きな面に引き伸ばさず、ワールド約1ユニット＝1タイルでリピート。
 * 橋デッキなど長いメッシュ向け（崖のボクセル粒度に合わせる）。
 */
export function TiledVoxelMat({
  kind,
  repeatX,
  repeatY,
}: {
  kind: BlockKind
  repeatX: number
  repeatY: number
}) {
  const map = useMemo(() => {
    const tex = getBlockTexture(kind).clone()
    tex.wrapS = RepeatWrapping
    tex.wrapT = RepeatWrapping
    tex.repeat.set(Math.max(0.5, repeatX), Math.max(0.5, repeatY))
    tex.needsUpdate = true
    return tex
  }, [kind, repeatX, repeatY])

  return <meshStandardMaterial map={map} roughness={0.92} metalness={0.03} />
}

/** 草ブロックの6面材質（柱・大きな箱向け） */
export function createGrassBoxMaterials(): Material[] {
  return getGrassMaterials().map(
    (face) =>
      new MeshStandardMaterial({
        map: face.map,
        roughness: 0.95,
        metalness: 0.02,
      }),
  )
}

export function createBlockMaterial(kind: BlockKind, face: 'top' | 'side' | 'all' = 'all') {
  const map = getBlockTexture(kind, face)
  return new MeshStandardMaterial({ map, roughness: 0.95, metalness: 0.02 })
}

/** ゲート等の旧カラー定数 → BlockKind */
export function blockKindFromTint(color: string): BlockKind {
  const c = color.toLowerCase()
  if (c === '#e8eef4' || c === '#d5dee8') return 'snow'
  if (c === '#6a7a58' || c === '#556348' || c === '#5a8a48' || c === '#4a5a40') return 'grass'
  if (c === '#8b6914' || c === '#6e5210' || c === '#5a4a38' || c === '#6a4a28' || c === '#5a3a20') {
    return 'dirt'
  }
  if (c === '#6b6f68' || c === '#7a7264' || c === '#635c50') return 'gravel'
  if (c === '#7a5a38' || c === '#6a4a30' || c === '#8a6a42' || c === '#5a4030') return 'path'
  if (c === '#4a4e48' || c === '#6a6e68') return 'darkStone'
  if (c === '#8d918a' || c === '#8a8e82' || c === '#7a7e78') return 'stone'
  return 'stone'
}
