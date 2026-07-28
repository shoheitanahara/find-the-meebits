import {
  CLOSET_MATCH_PREVIEW_LIMIT,
  type ClosetTraitOption,
  type ClosetTraitSelection,
} from './traitCatalog'
import { getClosetPool } from './closetPools'

/**
 * 選択トレイトすべてを持つ Meebit ID（AND）。
 * 未選択なら空配列（「何か選んでね」）。
 */
export function findMatchingMeebitIds(selections: ClosetTraitSelection[]): number[] {
  if (selections.length === 0) return []

  let overlap: Set<number> | null = null
  for (const selection of selections) {
    const pool = getClosetPool(selection.poolKey)
    const next = new Set(pool)
    if (!overlap) {
      overlap = next
      continue
    }
    const filtered = new Set<number>()
    for (const id of overlap) {
      if (next.has(id)) filtered.add(id)
    }
    overlap = filtered
    if (overlap.size === 0) break
  }

  if (!overlap) return []
  return Array.from(overlap).sort((a, b) => a - b)
}

/** 指定カテゴリ以外の選択だけで絞った候補集合。他に選択がなければ null（= 制約なし） */
export function getOverlapExcludingType(
  selections: ClosetTraitSelection[],
  excludeType: string,
): Set<number> | null {
  const others = selections.filter((item) => item.traitType !== excludeType)
  if (others.length === 0) return null
  return new Set(findMatchingMeebitIds(others))
}

/** 現在の選択と両立するトレイトか（候補 0 になる選択肢を除外する） */
export function isTraitOptionCompatible(
  selections: ClosetTraitSelection[],
  option: ClosetTraitOption,
): boolean {
  const pool = getClosetPool(option.poolKey)
  if (pool.length === 0) return false

  const base = getOverlapExcludingType(selections, option.traitType)
  if (!base) return true

  for (const id of pool) {
    if (base.has(id)) return true
  }
  return false
}

export function filterCompatibleTraitOptions(
  selections: ClosetTraitSelection[],
  options: ClosetTraitOption[],
): ClosetTraitOption[] {
  return options.filter((option) => isTraitOptionCompatible(selections, option))
}

/**
 * 新しい選択を反映。
 * - Type を選び直したら他カテゴリはリセット
 * - それ以外は両立しない既存選択を外す
 */
export function applyTraitSelection(
  prev: ClosetTraitSelection[],
  option: ClosetTraitOption,
): ClosetTraitSelection[] {
  const same = prev.find(
    (item) => item.traitType === option.traitType && item.traitValue === option.traitValue,
  )
  if (same) {
    return prev.filter((item) => item !== same)
  }

  const nextSelection: ClosetTraitSelection = {
    traitType: option.traitType,
    traitValue: option.traitValue,
    poolKey: option.poolKey,
  }

  if (option.traitType === 'Type') {
    return [nextSelection]
  }

  const kept: ClosetTraitSelection[] = [nextSelection]
  for (const sel of prev.filter((item) => item.traitType !== option.traitType)) {
    const trial = [...kept, sel]
    if (findMatchingMeebitIds(trial).length > 0) {
      kept.push(sel)
    }
  }
  return kept
}

export function getMatchPreviewIds(
  selections: ClosetTraitSelection[],
  limit = CLOSET_MATCH_PREVIEW_LIMIT,
  preferId?: number,
) {
  const all = findMatchingMeebitIds(selections)
  if (preferId !== undefined) {
    const index = all.indexOf(preferId)
    if (index > 0) {
      all.splice(index, 1)
      all.unshift(preferId)
    }
  }
  return {
    total: all.length,
    ids: all.slice(0, limit),
  }
}
