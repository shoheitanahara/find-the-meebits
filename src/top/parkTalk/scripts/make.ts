import type { ParkTimeOfDay } from '../../parkTimeOfDay'
import type { ParkZoneId } from '../../parkZones'
import type { PersonalityId, TalkKind, TalkScript } from '../types'

type Options = {
  zones?: ParkZoneId[]
  times?: ParkTimeOfDay[]
}

/** 性格ごとのセリフを短く書くための関数 */
export function scriptMaker(p: PersonalityId) {
  return (id: string, kind: TalkKind, ja: string[], en: string[], options: Options = {}): TalkScript => ({
    id: `${p}-${id}`,
    p,
    kind,
    ja,
    en,
    ...options,
  })
}
