import { create } from 'zustand'
import type { Vector3Tuple } from '../types/game'

const NPC_POSITION_EPSILON = 0.05

type NpcState = {
  nearestNpcId: string | null
  npcPositions: Record<string, Vector3Tuple>
  setNearestNpcId: (npcId: string | null) => void
  setNpcPosition: (npcId: string, position: Vector3Tuple) => void
  /** 指定 ID 以外の座標を捨てる（ゾーン切替・パーク入場時の幽霊座標対策） */
  retainNpcPositions: (npcIds: Iterable<string>) => void
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
  retainNpcPositions: (npcIds) =>
    set((state) => {
      const keep = new Set(npcIds)
      const next: Record<string, Vector3Tuple> = {}
      for (const [id, position] of Object.entries(state.npcPositions)) {
        if (keep.has(id)) next[id] = position
      }
      const nearestNpcId =
        state.nearestNpcId && keep.has(state.nearestNpcId) ? state.nearestNpcId : null
      return { npcPositions: next, nearestNpcId }
    }),
}))
