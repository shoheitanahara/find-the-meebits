import { useFrame } from '@react-three/fiber'
import { INTERACTION_DISTANCE } from '../../game/gameConfig'
import { getNpcProfiles } from '../../npc/npcData'
import { useGameStore } from '../../stores/gameStore'
import { useNpcStore } from '../../stores/npcStore'
import { usePlayerStore } from '../../stores/playerStore'
import { useDialogueStore } from '../../dialogue/dialogueStore'

export function InteractionSystem() {
  useFrame(() => {
    const isDialogueOpen = useDialogueStore.getState().isOpen
    const gamePhase = useGameStore.getState().gamePhase

    if (isDialogueOpen || gamePhase !== 'playing') {
      useNpcStore.getState().setNearestNpcId(null)
      return
    }

    const playerPosition = usePlayerStore.getState().position
    const npcPositions = useNpcStore.getState().npcPositions
    let nearestId: string | null = null
    let nearestDistance = Infinity

    for (const npc of getNpcProfiles()) {
      const npcPosition = npcPositions[npc.id] ?? npc.position
      const dx = playerPosition[0] - npcPosition[0]
      const dz = playerPosition[2] - npcPosition[2]
      const distance = Math.hypot(dx, dz)

      if (distance <= INTERACTION_DISTANCE && distance < nearestDistance) {
        nearestDistance = distance
        nearestId = npc.id
      }
    }

    useNpcStore.getState().setNearestNpcId(nearestId)
  })

  return null
}
