import type { MeebitTraitMap } from '../../data/meebitTraits'
import {
  getCachedMeebitTraits,
  getMeebitTraitsFromDataset,
  loadMeebitTraitsDataset,
  type MeebitTraitsDataset,
} from '../../data/meebitTraits'

const TRAIT_WEIGHTS: Record<string, number> = {
  Type: 5,
  'Hair Style': 4,
  'Hair Color': 3,
  Shirt: 4,
  'Shirt Color': 3,
  Pants: 2,
  'Pants Color': 2,
  Shoes: 1,
  'Shoes Color': 1,
  Hat: 3,
  'Hat Color': 2,
  Glasses: 3,
  Beard: 2,
  'Beard Color': 1,
  Necklace: 1,
  Overshirt: 3,
  'Overshirt Color': 2,
  Earring: 1,
  Tattoo: 2,
}

const similarCache = new Map<number, number[]>()

function scoreSimilarity(a: MeebitTraitMap, b: MeebitTraitMap) {
  let score = 0
  let maxScore = 0
  let matches = 0
  let compared = 0

  for (const [type, weight] of Object.entries(TRAIT_WEIGHTS)) {
    const av = a[type]
    const bv = b[type]
    if (av === undefined && bv === undefined) continue
    compared += 1
    maxScore += weight
    if (av !== undefined && bv !== undefined && av === bv) {
      score += weight
      matches += 1
    }
  }

  return { score, maxScore, matches, compared }
}

function buildCandidatesFor(
  dataset: MeebitTraitsDataset,
  baseId: number,
  excludeIds: Set<number>,
): number[] {
  const cached = similarCache.get(baseId)
  if (cached) {
    return cached.filter((id) => !excludeIds.has(id))
  }

  const baseTraits = getMeebitTraitsFromDataset(dataset, baseId)
  if (!baseTraits) return []

  const scored: Array<{ id: number; score: number; ratio: number; matches: number }> = []

  // Stride sample first — full 20k sync scan freezes the main thread.
  for (let id = 1; id <= 20000; id += 3) {
    if (id === baseId) continue
    const traits = getMeebitTraitsFromDataset(dataset, id)
    if (!traits) continue
    const result = scoreSimilarity(baseTraits, traits)
    if (result.maxScore <= 0) continue
    if (result.matches === result.compared) continue
    if (result.matches < 2) continue
    const ratio = result.score / result.maxScore
    if (ratio < 0.35 || ratio > 0.95) continue
    scored.push({ id, score: result.score, ratio, matches: result.matches })
  }

  scored.sort((a, b) => b.score - a.score || b.ratio - a.ratio)
  const top = scored.slice(0, 40).map((entry) => entry.id)
  similarCache.set(baseId, top)
  return top.filter((id) => !excludeIds.has(id))
}

/** Pick a similar-but-different Meebit id for anomaly replacement. */
export async function selectSimilarMeebitId(
  baseId: number,
  excludeIds: number[] = [],
): Promise<number | null> {
  const dataset = await loadMeebitTraitsDataset()
  if (!dataset) return null

  void getCachedMeebitTraits(baseId)

  const exclude = new Set(excludeIds)
  exclude.add(baseId)

  // Yield once so React can paint the loading overlay before the heavy scan.
  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, 0)
  })

  let candidates = buildCandidatesFor(dataset, baseId, exclude)

  if (candidates.length === 0) {
    const baseTraits = getMeebitTraitsFromDataset(dataset, baseId)
    if (!baseTraits) return null
    const loose: Array<{ id: number; score: number }> = []
    for (let id = 1; id <= 20000; id += 7) {
      if (exclude.has(id)) continue
      const traits = getMeebitTraitsFromDataset(dataset, id)
      if (!traits) continue
      const result = scoreSimilarity(baseTraits, traits)
      if (result.matches < 1 || result.matches === result.compared) continue
      loose.push({ id, score: result.score })
    }
    loose.sort((a, b) => b.score - a.score)
    candidates = loose.slice(0, 20).map((entry) => entry.id)
  }

  if (candidates.length === 0) return null
  return candidates[Math.floor(Math.random() * Math.min(candidates.length, 12))]
}
