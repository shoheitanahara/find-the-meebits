import { EIGHT_STREET } from '../config'
import { selectSimilarMeebitId } from './selectSimilarMeebit'
import type { WalkerPatternSlot } from './walkerPath'

export type RoundKind = 'normal' | 'anomaly'

export type WalkerSpawn = {
  slotIndex: number
  meebitNumber: number
  speed: number
  lane: number
  initialProgress: number
}

export type GeneratedRound = {
  kind: RoundKind
  meebitIds: number[]
  walkers: WalkerSpawn[]
  replacedBaseId?: number
  replacementId?: number
}

function pickRoundKind(
  streetProgress: number,
  normalStreak: number,
  anomalyStreak: number,
): RoundKind {
  // 0th Street is the tutorial beat — always safe / continue-forward.
  if (streetProgress <= 0) return 'normal'

  let anomalyChance = 1 - EIGHT_STREET.normalRoundChance
  if (normalStreak >= EIGHT_STREET.maxSameKindStreak) anomalyChance = 0.85
  if (anomalyStreak >= EIGHT_STREET.maxSameKindStreak) anomalyChance = 0.15

  return Math.random() < anomalyChance ? 'anomaly' : 'normal'
}

/** Place cast onto the fixed session pattern (order & lanes never reshuffle). */
function layoutWalkers(
  meebitIds: number[],
  pattern: WalkerPatternSlot[],
): WalkerSpawn[] {
  return pattern.map((slot) => ({
    slotIndex: slot.slotIndex,
    meebitNumber: meebitIds[slot.slotIndex] ?? meebitIds[0],
    speed: slot.speed,
    lane: slot.lane,
    initialProgress: slot.initialProgress,
  }))
}

export async function generateRound(options: {
  roundNumber: number
  /** Street number shown on the wall while this round is played (0 = 0th Street). */
  streetProgress: number
  baseMeebitIds: number[]
  walkerPattern: WalkerPatternSlot[]
  normalStreak: number
  anomalyStreak: number
}): Promise<GeneratedRound> {
  const kind = pickRoundKind(
    options.streetProgress,
    options.normalStreak,
    options.anomalyStreak,
  )
  let meebitIds = [...options.baseMeebitIds]
  let replacedBaseId: number | undefined
  let replacementId: number | undefined

  if (kind === 'anomaly') {
    // Always swap a fixed-feeling slot so the rest of the formation stays recognizable.
    const replaceIndex = Math.floor(Math.random() * meebitIds.length)
    replacedBaseId = meebitIds[replaceIndex]
    const similar = await selectSimilarMeebitId(replacedBaseId, meebitIds)
    if (similar !== null) {
      replacementId = similar
      meebitIds = meebitIds.map((id, index) => (index === replaceIndex ? similar : id))
    } else {
      return {
        kind: 'normal',
        meebitIds: [...options.baseMeebitIds],
        walkers: layoutWalkers(options.baseMeebitIds, options.walkerPattern),
      }
    }
  }

  return {
    kind,
    meebitIds,
    walkers: layoutWalkers(meebitIds, options.walkerPattern),
    replacedBaseId,
    replacementId,
  }
}
