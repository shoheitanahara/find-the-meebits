import { formatTraitDisplayName } from '../game/traitHunt'
import { getMuseumCreatorDialogueJa } from '../i18n/dialogue'
import { getLocale } from '../i18n/locale'
import { getCreatorDialogueLinesEn } from '../npc/npcGeneration'
import type { DialogueLine } from '../npc/npcTypes'
import type { DailyThemeTrait } from './dailyFeatured'
import { isParkChristmasSeason } from './parkChristmas'
import { getCachedMeebitTraits } from '../data/meebitTraits'
import { isSilentMeebit } from './parkTalk/personality'
import { selectParkTalk } from './parkTalk/selectParkTalk'
import { getDailyNews } from './parkTalk/dailyNews'
import { describePlace } from './parkTalk/zonePlaces'
import { getRegisteredParkNpcs } from './parkNpcRegistry'
import { useNpcStore } from '../stores/npcStore'
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

  // Visitor と Dissected はほとんど話さない（Visitor はときどき単語をひとつだけ）
  const traits = getCachedMeebitTraits(npc.meebitNumber)
  if (isSilentMeebit(traits)) {
    return selectSilentLines(npc.id, talkCount, traits?.Type === 'Visitor' ? zoneId : null)
  }

  const top = useTopStore.getState()
  // その場のデータ：プレイヤーの見た目、同じエリアのほかの来場者（いる場所つき）、今日の主役
  const positions = useNpcStore.getState().npcPositions
  const others = getRegisteredParkNpcs()
    .filter((record) => !record.isCreator && record.meebitNumber !== npc.meebitNumber)
    .flatMap((record) => {
      const position = positions[record.id]
      if (!position) return []
      return [
        {
          meebitNumber: record.meebitNumber,
          traits: getCachedMeebitTraits(record.meebitNumber),
          place: describePlace(zoneId, position[0], position[2]),
        },
      ]
    })
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
    daily: { news: getDailyNews(), now: new Date() },
    dynamic: {
      selfTraits: traits,
      playerTraits: getCachedMeebitTraits(top.meebitNumber),
      featuredTraits: getCachedMeebitTraits(featuredId),
      others,
    },
  })
}

const SILENT_PATTERNS: Array<{ ja: string[]; en: string[] }> = [
  { ja: ['……'], en: ['…'] },
  { ja: ['…………'], en: ['……'] },
  { ja: ['……', '……'], en: ['…', '…'] },
  { ja: ['…'], en: ['…'] },
]

/** Visitor がときどき口にする単語（どこでも） */
const VISITOR_WORDS: Array<{ ja: string; en: string }> = [
  { ja: '……ホシ。', en: '…Stars.' },
  { ja: '……ヒカリ。', en: '…Light.' },
  { ja: '……キレイ。', en: '…Pretty.' },
  { ja: '……アナタ。', en: '…You.' },
  { ja: '……カエル。', en: '…Home.' },
  { ja: '……ミテル。', en: '…Watching.' },
  { ja: '……オト。', en: '…Sound.' },
  { ja: '……トモダチ？', en: '…Friend?' },
]

/** エリアに合わせた単語 */
const VISITOR_ZONE_WORDS: Partial<Record<ParkZoneId, { ja: string; en: string }>> = {
  plaza: { ja: '……ミズ。', en: '…Water.' },
  mountain: { ja: '……タカイ。', en: '…High.' },
  culture: { ja: '……イロ。', en: '…Color.' },
  sea: { ja: '……ウミ。', en: '…Sea.' },
  astro: { ja: '……ソラ。', en: '…Sky.' },
  musicArt: { ja: '……オンガク。', en: '…Music.' },
  jungle: { ja: '……ミドリ。', en: '…Green.' },
}

/**
 * 話さない来場者の「……」。
 * visitorZone を渡すと（Visitor）、2 回に 1 回くらい単語をひとつだけ言う。
 */
export function selectSilentLines(
  npcId: string,
  talkCount: number,
  visitorZone: ParkZoneId | null = null,
): DialogueLine[] {
  const ja = getLocale() === 'ja'
  let texts: string[]
  if (visitorZone && talkCount % 2 === 1) {
    const zoneWord = VISITOR_ZONE_WORDS[visitorZone]
    const words = zoneWord ? [zoneWord, ...VISITOR_WORDS] : VISITOR_WORDS
    const word = words[Math.floor(talkCount / 2) % words.length]
    texts = [ja ? word.ja : word.en]
  } else {
    const pattern = SILENT_PATTERNS[talkCount % SILENT_PATTERNS.length]
    texts = ja ? pattern.ja : pattern.en
  }
  return texts.map((text, i) => ({ id: `${npcId}-silent-${talkCount}-${i}`, text, category: 'greeting' as const }))
}
