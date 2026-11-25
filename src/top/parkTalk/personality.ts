import { getCachedMeebitTraits, type MeebitTraitMap } from '../../data/meebitTraits'
import type { PersonalityId } from './types'

export const PERSONALITIES: readonly PersonalityId[] = [
  'street',
  'sporty',
  'cool',
  'photographer',
  'stylish',
  'bubbly',
  'sisterly',
  'explorer',
  'sage',
  'robot',
]

/**
 * Human には男女の体がある。トレイトに性別はないが、女性の体だけが持つ値がある。
 * パンツがいちばん確実で、女性の体はかならず次のどれかを履いている
 * （全 20,000 体で確認：この 4 つを履く Human はちょうど女性側の 8,011 体）。
 */
const FEMALE_PANTS = new Set(['Skirt', 'Leggings', 'Short Leggings', 'Trackpants'])

export type MeebitBody = 'male' | 'female' | 'other'

export function getMeebitBody(traits: MeebitTraitMap | null | undefined): MeebitBody {
  if (!traits || traits.Type !== 'Human') return 'other'
  return FEMALE_PANTS.has(traits.Pants) ? 'female' : 'male'
}

/** 物知りは出すぎないよう、男性側だけに半分の重みで入れる（全体の 1 割弱） */
const MALE_POOL: readonly PersonalityId[] = [
  'street', 'street', 'sporty', 'sporty', 'cool', 'cool', 'photographer', 'photographer', 'sage',
]
const FEMALE_POOL: readonly PersonalityId[] = ['stylish', 'bubbly', 'sisterly', 'explorer']

/** 体ごとの性格の候補（Human 以外は男性側と同じ） */
const POOLS: Record<MeebitBody, readonly PersonalityId[]> = {
  male: MALE_POOL,
  female: FEMALE_POOL,
  other: MALE_POOL,
}

/** 話さない種類（話しかけても「……」だけ） */
const SILENT_TYPES = new Set(['Visitor', 'Dissected'])

export function isSilentMeebit(traits: MeebitTraitMap | null | undefined) {
  return Boolean(traits && SILENT_TYPES.has(traits.Type))
}

/** 番号から性格を決める（同じ Meebit はいつも同じ性格。Robot は必ずロボット） */
export function getPersonality(
  meebitNumber: number,
  traits: MeebitTraitMap | null | undefined = getCachedMeebitTraits(meebitNumber),
): PersonalityId {
  if (traits?.Type === 'Robot') return 'robot'
  const pool = POOLS[getMeebitBody(traits)]
  const mixed = Math.imul(meebitNumber ^ 0x5bd1e995, 0x27d4eb2d) >>> 0
  return pool[(mixed >>> 7) % pool.length]
}

/** 性格ごとの、相手の呼び方 */
export function formatPlayerName(personality: PersonalityId, playerNumber: number, lang: 'ja' | 'en') {
  const base = `#${playerNumber}`
  if (lang === 'ja' && personality === 'sage') return `${base}さん`
  return base
}
