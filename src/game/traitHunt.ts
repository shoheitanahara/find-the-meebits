import { isMobilePerfMode } from './perfConfig'
import traitHuntPools from '../data/trait-hunt-pools.json'
import { CREATOR_MEEBIT_ID, CREATOR_NPC_ID } from './gameConfig'
import type { VenueId } from './venueConfig'

export type TraitQuest = {
  traitType: string
  traitValue: string
  findCount: number
  /** Look up key in trait-hunt-pools.json */
  poolKey: string
}

export type TraitHuntStep = {
  venueId: VenueId
  stageNumber: number
  npcCount: number
  targetCount: number
  kind: 'regular'
  quest: TraitQuest
}

type TraitHuntPoolsFile = {
  version: number
  pools: Record<string, number[]>
}

const STAGE_COUNT = 3
/** Match Museum stage 1–3 crowd sizes (PC 200→, SP 100→). */
const PC_TRAIT_HUNT_NPC_COUNTS = [200, 250, 300] as const
const SP_TRAIT_HUNT_NPC_COUNTS = [100, 125, 150] as const
const poolsFile = traitHuntPools as TraitHuntPoolsFile
const poolSetCache = new Map<string, Set<number>>()

export function getTraitPool(poolKey: string): number[] {
  return poolsFile.pools[poolKey] ?? []
}

function getTraitPoolSet(poolKey: string): Set<number> {
  let cached = poolSetCache.get(poolKey)
  if (!cached) {
    cached = new Set(getTraitPool(poolKey))
    poolSetCache.set(poolKey, cached)
  }
  return cached
}

export function meebitMatchesQuest(meebitId: number, quest: TraitQuest) {
  return getTraitPoolSet(quest.poolKey).has(meebitId)
}

function questFromPoolKey(poolKey: string): TraitQuest | null {
  const sep = poolKey.indexOf('::')
  if (sep <= 0) return null

  const traitType = poolKey.slice(0, sep)
  const traitValue = poolKey.slice(sep + 2)
  const poolSize = getTraitPool(poolKey).length
  const findCount = 3
  if (poolSize < findCount) return null

  return { traitType, traitValue, findCount, poolKey }
}

/** Pick N quests from the full pool, preferring different trait categories. */
function pickRandomTraitQuests(count: number, avoidPoolKeys: Set<string> = new Set()): TraitQuest[] {
  const byType = new Map<string, TraitQuest[]>()

  for (const poolKey of Object.keys(poolsFile.pools)) {
    if (avoidPoolKeys.has(poolKey)) continue
    const quest = questFromPoolKey(poolKey)
    if (!quest) continue
    const list = byType.get(quest.traitType) ?? []
    list.push(quest)
    byType.set(quest.traitType, list)
  }

  // If avoid filtered everything, fall back to full pool.
  if (byType.size === 0) {
    if (avoidPoolKeys.size === 0) return []
    return pickRandomTraitQuests(count, new Set())
  }

  const types = shuffle([...byType.keys()])
  const selected: TraitQuest[] = []
  const usedKeys = new Set<string>()

  for (const type of types) {
    if (selected.length >= count) break
    const options = shuffle(byType.get(type) ?? [])
    const pick = options[0]
    if (!pick) continue
    selected.push(pick)
    usedKeys.add(pick.poolKey)
  }

  if (selected.length < count) {
    const leftovers = shuffle(
      [...byType.values()].flat().filter((quest) => !usedKeys.has(quest.poolKey)),
    )
    for (const quest of leftovers) {
      if (selected.length >= count) break
      selected.push(quest)
      usedKeys.add(quest.poolKey)
    }
  }

  return shuffle(selected).slice(0, count)
}

let cachedTraitHuntSteps: TraitHuntStep[] | null = null

/**
 * Prototype stages for /v2 — Museum only, short loop.
 * Quests are rolled once per page load from the expanded trait pool.
 */
export function getTraitHuntProgressionSteps(): TraitHuntStep[] {
  if (cachedTraitHuntSteps) {
    return cachedTraitHuntSteps
  }

  const npcCounts = isMobilePerfMode() ? SP_TRAIT_HUNT_NPC_COUNTS : PC_TRAIT_HUNT_NPC_COUNTS
  const quests = pickRandomTraitQuests(STAGE_COUNT)

  cachedTraitHuntSteps = quests.map((quest, index) => {
    const npcCount = npcCounts[index] ?? npcCounts[npcCounts.length - 1]

    return {
      venueId: 'museum' as const,
      stageNumber: index + 1,
      npcCount,
      targetCount: quest.findCount,
      kind: 'regular' as const,
      quest,
    }
  })

  return cachedTraitHuntSteps
}

/** True when the quest is about a part/type, not a color trait. */
export function questIgnoresColorAndPattern(quest: TraitQuest) {
  return !/color/i.test(quest.traitType)
}

/** Display label for a trait (e.g. Tattoo Yes instead of bare Yes). */
export function formatTraitDisplayName(traitType: string, traitValue: string) {
  if (traitType === 'Tattoo') {
    return `Tattoo ${traitValue}`
  }

  return traitValue
}

export function getTraitHuntStep(index: number): TraitHuntStep | null {
  return getTraitHuntProgressionSteps()[index] ?? null
}

/**
 * Replace the quest at a stage index (used by Start Screen Random).
 * Avoids duplicating other stages' pool keys when possible.
 */
export function rerollTraitHuntQuestAt(index: number): TraitHuntStep | null {
  const steps = getTraitHuntProgressionSteps()
  const current = steps[index]
  if (!current) return null

  const avoid = new Set(
    steps
      .filter((_, stepIndex) => stepIndex !== index)
      .map((step) => step.quest.poolKey),
  )
  avoid.add(current.quest.poolKey)

  const [nextQuest] = pickRandomTraitQuests(1, avoid)
  if (!nextQuest) return current

  const nextStep: TraitHuntStep = {
    ...current,
    targetCount: nextQuest.findCount,
    quest: nextQuest,
  }
  steps[index] = nextStep
  return nextStep
}

/** Pick meebit IDs for a stage: guaranteed quest matches + fillers without that trait. */
export function pickTraitHuntMeebitNumbers(quest: TraitQuest, totalCount: number): number[] {
  const pool = getTraitPool(quest.poolKey).filter((id) => id !== CREATOR_MEEBIT_ID)
  if (pool.length < quest.findCount) {
    throw new Error(`Trait pool ${quest.poolKey} has only ${pool.length} ids (need ${quest.findCount})`)
  }

  const shuffledPool = shuffle([...pool])
  const targets = shuffledPool.slice(0, quest.findCount)
  // Exclude the whole trait pool so every matching Meebit in the venue is a valid target.
  const traitPoolSet = getTraitPoolSet(quest.poolKey)

  const fillers: number[] = []
  const fillerSource: number[] = []
  for (let id = 1; id <= 20000; id += 1) {
    if (id === CREATOR_MEEBIT_ID || traitPoolSet.has(id)) continue
    fillerSource.push(id)
  }
  shuffleInPlace(fillerSource)

  for (const id of fillerSource) {
    if (fillers.length >= totalCount - targets.length) break
    fillers.push(id)
  }

  const all = [...targets, ...fillers]
  shuffleInPlace(all)
  return all
}

export function pickTraitHuntTargetIds(
  profiles: Array<{ id: string; meebitNumber: number }>,
  quest: TraitQuest,
  excludeNpcIds: string[] = [],
) {
  const exclude = new Set(excludeNpcIds)
  const matches = profiles.filter(
    (npc) =>
      npc.id !== CREATOR_NPC_ID &&
      !exclude.has(npc.id) &&
      meebitMatchesQuest(npc.meebitNumber, quest),
  )
  shuffleInPlace(matches)

  if (matches.length > 0) {
    return matches.map((npc) => npc.id)
  }

  const allMatches = profiles.filter(
    (npc) => npc.id !== CREATOR_NPC_ID && meebitMatchesQuest(npc.meebitNumber, quest),
  )
  shuffleInPlace(allMatches)
  return allMatches.map((npc) => npc.id)
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array]
  shuffleInPlace(copy)
  return copy
}

function shuffleInPlace<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}
