import { formatTraitDisplayName } from '../game/traitHunt'
import { getMuseumCreatorDialogueJa } from '../i18n/dialogue'
import { getLocale } from '../i18n/locale'
import { getCreatorDialogueLinesEn } from '../npc/npcGeneration'
import type { DialogueLine } from '../npc/npcTypes'
import type { DailyThemeTrait } from './dailyFeatured'
import { isParkChristmasSeason } from './parkChristmas'
import { selectParkTalk } from './parkTalk/selectParkTalk'
import { useTopStore } from './topStore'
import type { ParkNpcRecord } from './parkNpcRegistry'
import type { ParkZoneId } from './parkZones'

function seededIndex(seed: number, talkCount: number, length: number) {
  if (length <= 0) return 0
  const mixed = Math.imul(seed ^ (talkCount * 2654435761), 1597334677) >>> 0
  return mixed % length
}

function selectCreatorParkLines(talkCount: number): DialogueLine[] {
  const locale = getLocale()
  const pool = locale === 'ja' ? getMuseumCreatorDialogueJa() : getCreatorDialogueLinesEn()
  const greet =
    locale === 'ja'
      ? 'やあ。ぼくは Shawn T. Art。このパークの作成者だよ。'
      : 'Hey — I’m Shawn T. Art, the creator of this Park.'
  const body = pool[seededIndex(CREATOR_SEED, talkCount, pool.length)] ?? pool[0]

  return [
    { id: `creator-greet-${talkCount}`, text: greet, category: 'greeting' },
    {
      id: body?.id ?? `creator-body-${talkCount}`,
      text: body?.text ?? '...',
      category: body?.category ?? 'world',
    },
  ]
}

const CREATOR_SEED = 11143

/**
 * パーク来場者のセリフを選ぶ。
 * 作成者は専用プール。来場者は性格つきの会話（parkTalk）。
 */
export function selectParkDialogueLines(
  npc: ParkNpcRecord,
  talkCount: number,
  featuredId: number,
  themeTrait: DailyThemeTrait,
  zoneId: ParkZoneId = 'plaza',
): DialogueLine[] {
  if (npc.isCreator) {
    return selectCreatorParkLines(talkCount)
  }

  const top = useTopStore.getState()
  return selectParkTalk({
    npc,
    talkCount,
    zoneId,
    timeOfDay: top.timeOfDay,
    lang: getLocale() === 'ja' ? 'ja' : 'en',
    playerNumber: top.meebitNumber,
    featuredId,
    traitName: formatTraitDisplayName(themeTrait.traitType, themeTrait.traitValue),
    winter: isParkChristmasSeason(),
  })
}
