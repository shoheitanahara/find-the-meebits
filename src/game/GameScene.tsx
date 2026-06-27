import type { VenueId } from './venueConfig'
import { AvatarController } from '../avatar/AvatarController'
import { PlayerAvatar } from '../avatar/PlayerAvatar'
import { FollowCamera } from '../camera/FollowCamera'
import { FootstepAudioSystem } from '../systems/FootstepAudioSystem'
import { NPCVrmLodSystem } from '../npc/NPCVrmLodSystem'
import { NPCManager } from '../npc/NPCManager'
import { WorldRoot } from '../world/WorldRoot'
import { ClubSpotlights } from '../world/ClubSpotlights'
import { ClubMirrorBall } from '../world/ClubMirrorBall'
import { Lighting } from '../world/Lighting'
import { VenueAtmosphere } from '../world/VenueAtmosphere'

type GameSceneProps = {
  venueId: VenueId
}

export function GameScene({ venueId }: GameSceneProps) {
  return (
    <>
      <VenueAtmosphere venueId={venueId} />
      <Lighting venueId={venueId} />
      {venueId === 'club' && <ClubSpotlights />}
      {venueId === 'club' && <ClubMirrorBall />}
      <WorldRoot venueId={venueId} />
      <NPCVrmLodSystem />
      <NPCManager />
      <PlayerAvatar />
      <AvatarController />
      <FootstepAudioSystem />
      <FollowCamera />
    </>
  )
}
