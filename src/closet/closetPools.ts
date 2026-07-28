import {
  loadMeebitTraitsDataset,
  type MeebitTraitsDataset,
} from '../data/meebitTraits'
import { getTraitPool } from '../game/traitHunt'

/** Trait Hunt プールに無い Type（Human 等）を closet 用に補完 */
export const CLOSET_TYPE_VALUES = [
  'Human',
  'Pig',
  'Elephant',
  'Robot',
  'Skeleton',
  'Visitor',
  'Dissected',
] as const

/** プール未構築時のカタログ表示用 */
const TYPE_COUNT_FALLBACK: Record<string, number> = {
  Human: 18881,
  Pig: 711,
  Elephant: 256,
  Robot: 72,
  Skeleton: 57,
  Visitor: 18,
  Dissected: 5,
}

const supplementalPools = new Map<string, number[]>()
let typePoolsBuilt = false

function buildTypePoolsFromDataset(dataset: MeebitTraitsDataset) {
  if (typePoolsBuilt) return

  const buckets = new Map<string, number[]>()
  for (const value of CLOSET_TYPE_VALUES) {
    buckets.set(value, [])
  }

  for (const [idText, traits] of Object.entries(dataset.byId)) {
    const typeValue = traits.Type
    if (!typeValue) continue
    const bucket = buckets.get(typeValue)
    if (!bucket) continue
    const id = Number(idText)
    if (!Number.isFinite(id)) continue
    bucket.push(id)
  }

  for (const [value, ids] of buckets) {
    ids.sort((a, b) => a - b)
    supplementalPools.set(`Type::${value}`, ids)
  }

  typePoolsBuilt = true
}

/** トレイトデータ読み込み後に Type 補完プールを用意 */
export async function ensureClosetTypePools() {
  if (typePoolsBuilt) return
  const dataset = await loadMeebitTraitsDataset()
  if (dataset) buildTypePoolsFromDataset(dataset)
}

export function getClosetPool(poolKey: string): number[] {
  const fromHunt = getTraitPool(poolKey)
  if (fromHunt.length > 0) return fromHunt
  return supplementalPools.get(poolKey) ?? []
}

export function getClosetPoolCount(poolKey: string): number {
  const pool = getClosetPool(poolKey)
  if (pool.length > 0) return pool.length

  if (poolKey.startsWith('Type::')) {
    const value = poolKey.slice('Type::'.length)
    return TYPE_COUNT_FALLBACK[value] ?? 0
  }
  return 0
}
