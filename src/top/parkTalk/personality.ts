import { getCachedMeebitTraits, type MeebitTraitMap } from '../../data/meebitTraits'
import type { PersonalityId } from './types'

export const PERSONALITIES: readonly PersonalityId[] = [
  'street',
  'sporty',
  'cool',
  'artist',
  'stylish',
  'bubbly',
  'sisterly',
  'explorer',
  'sage',
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

const MALE_POOL: readonly PersonalityId[] = ['street', 'sporty', 'cool', 'artist', 'sage']
const FEMALE_POOL: readonly PersonalityId[] = ['stylish', 'bubbly', 'sisterly', 'explorer', 'sage']

/** 体ごとの性格の候補（物知りはどちらでも。Human 以外は男性側と同じ） */
const POOLS: Record<MeebitBody, readonly PersonalityId[]> = {
  male: MALE_POOL,
  female: FEMALE_POOL,
  other: MALE_POOL,
}

/** 番号から性格を決める（同じ Meebit はいつも同じ性格） */
export function getPersonality(
  meebitNumber: number,
  traits: MeebitTraitMap | null | undefined = getCachedMeebitTraits(meebitNumber),
): PersonalityId {
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
