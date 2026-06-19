import { useLayoutEffect } from 'react'
import { finalizeVrmInstancePoolEviction } from '../avatar/vrmInstancePool'
import { useGameStore } from '../stores/gameStore'
import { NPC } from './NPC'

export function NPCManager() {
  const npcProfiles = useGameStore((state) => state.npcProfiles)
  const npcLayoutVersion = useGameStore((state) => state.npcLayoutVersion)

  useLayoutEffect(() => {
    finalizeVrmInstancePoolEviction()
  }, [npcLayoutVersion])

  return (
    <group key={`layout-${npcLayoutVersion}`}>
      {npcProfiles.map((profile) => (
        <NPC key={`${profile.id}-${profile.meebitNumber}`} profile={profile} />
      ))}
    </group>
  )
}
