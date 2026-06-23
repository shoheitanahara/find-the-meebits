import { buildNpcProfiles } from './npcGeneration'
import { useGameStore } from '../stores/gameStore'
import type { NPCProfile } from './npcTypes'

export function getNpcProfiles(): NPCProfile[] {
  return useGameStore.getState().npcProfiles
}

export function getNpcById(id: string) {
  return getNpcProfiles().find((npc) => npc.id === id)
}

export function ensureNpcProfiles(count: number) {
  const venueId = useGameStore.getState().venueId
  const profiles = buildNpcProfiles(count, venueId)
  useGameStore.getState().setNpcProfiles(profiles)
  return profiles
}
