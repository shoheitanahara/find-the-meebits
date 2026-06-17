import { create } from 'zustand'
import type { Vector3Tuple } from '../types/game'

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
    set((state) => ({
      npcPositions: {
        ...state.npcPositions,
        [npcId]: position,
      },
    })),
}))
