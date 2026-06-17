import { CREATOR_NPC_ID } from './gameConfig'
import type { NPCProfile } from '../npc/npcTypes'

export function pickRandomTargetNpcIds(
  profiles: NPCProfile[],
  count: number,
  excludeNpcIds: string[] = [],
) {
  const exclude = new Set(excludeNpcIds)
  const candidates = profiles.filter(
    (npc) => npc.id !== CREATOR_NPC_ID && !exclude.has(npc.id),
  )

  if (candidates.length === 0) {
    return ['npc-001']
  }

  const shuffled = [...candidates].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length)).map((npc) => npc.id)
}

/** @deprecated Use pickRandomTargetNpcIds */
export function pickRandomTargetNpcId(profiles: NPCProfile[], excludeNpcId?: string) {
  return pickRandomTargetNpcIds(profiles, 1, excludeNpcId ? [excludeNpcId] : [])[0]
}
