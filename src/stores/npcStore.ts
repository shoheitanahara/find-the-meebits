import { create } from 'zustand'
import type { Vector3Tuple } from '../types/game'

const NPC_POSITION_EPSILON = 0.05

type NpcState = {
  nearestNpcId: string | null
  npcPositions: Record<string, Vector3Tuple>
  setNearestNpcId: (npcId: string | null) => void
  setNpcPosition: (npcId: string, position: Vector3Tuple) => void
}

export const useNpcStore = create<NpcState>((set) => ({
  nearestNpcId: null,
  npcPositions: {},
  setNearestNpcId: (nearestNpcId) => set({ nearestNpcId }),
  setNpcPosition: (npcId, position) =>
    set((state) => {
      const current = state.npcPositions[npcId]
      if (
        current &&
        Math.abs(current[0] - position[0]) < NPC_POSITION_EPSILON &&
        Math.abs(current[2] - position[2]) < NPC_POSITION_EPSILON
      ) {
        return state
      }

      return {
        npcPositions: {
          ...state.npcPositions,
          [npcId]: position,
        },
      }
    }),
}))
