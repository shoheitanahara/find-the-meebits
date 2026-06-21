import { AvatarController } from '../avatar/AvatarController'
import { PlayerAvatar } from '../avatar/PlayerAvatar'
import { FollowCamera } from '../camera/FollowCamera'
import { FootstepAudioSystem } from '../systems/FootstepAudioSystem'
import { NPCVrmLodSystem } from '../npc/NPCVrmLodSystem'
import { NPCManager } from '../npc/NPCManager'
import { WorldRoot } from '../world/WorldRoot'
import { Lighting } from '../world/Lighting'
import { getFogDistances } from './perfConfig'

export function GameScene() {
  const fog = getFogDistances()

  return (
    <>
      <color attach="background" args={['#e7e5e4']} />
      <fog attach="fog" args={['#e7e5e4', fog.near, fog.far]} />
      <Lighting />
      <WorldRoot />
      <NPCVrmLodSystem />
      <NPCManager />
      <PlayerAvatar />
      <AvatarController />
      <FootstepAudioSystem />
      <FollowCamera />
    </>
  )
}
