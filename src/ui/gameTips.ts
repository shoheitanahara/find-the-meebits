import type { VenueId } from '../game/venueConfig'
import { ui } from '../i18n/ui'

export type GameTip = {
  title: string
  body: string
}

export function getGameTipsForVenue(venueId: VenueId): GameTip[] {
  const t = ui()

  if (venueId === 'club') {
    return [
      { title: t.tipRedTitle, body: t.tipRedClub },
      { title: t.tipNpcClubTitle, body: t.tipNpcClub },
      { title: t.tipTargetTitle, body: t.tipTargetClub },
    ]
  }

  return [
    { title: t.tipRedTitle, body: t.tipRedMuseum },
    { title: t.tipNpcTitle, body: t.tipNpcMuseum },
    { title: t.tipTargetTitle, body: t.tipTargetMuseum },
  ]
}

/** @deprecated Use getGameTipsForVenue */
export const GAME_TIPS = getGameTipsForVenue('museum')

export function getLoadingLabelForVenue(venueId: VenueId) {
  return venueId === 'club' ? ui().loadingClub : ui().loadingMuseum
}
