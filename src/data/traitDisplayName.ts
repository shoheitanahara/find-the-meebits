/**
 * トレイトを、会話や解説で「色＋値＋ジャンル」まで分かる英語名にする。
 * 例: Hair Style Simple + Hair Color Black → "Black Simple Hair"
 *     Shoes Canvas + Shoes Color Yellow    → "Yellow Canvas Shoes"
 * 値だけ（"Simple" "Canvas"）だと、何の話か分からないため。
 */
import type { MeebitTraitMap } from './meebitTraits'

/** 「無い」を表す値（話題にしない） */
const NOTHING = new Set(['None', 'No', 'No Shoes', 'No Shirt', 'No Pants', 'Bare Chest', 'Bald'])

/** トレイトの種類ごとの、色のキーと、値に足すジャンル名 */
const RULES: Record<string, { colorKey?: string; noun?: (value: string) => string | null }> = {
  'Hair Style': { colorKey: 'Hair Color', noun: () => 'Hair' },
  Shoes: {
    colorKey: 'Shoes Color',
    noun: (v) => (/(boots|sneakers|sandals|slides|tops)$/i.test(v) ? null : 'Shoes'),
  },
  Glasses: {
    colorKey: 'Glasses Color',
    noun: (v) => (/(glasses|aviators|specs)$/i.test(v) ? null : 'Glasses'),
  },
  Hat: { colorKey: 'Hat Color', noun: (v) => (v === 'Brimmed' ? 'Hat' : null) },
  Overshirt: { colorKey: 'Overshirt Color' },
  Shirt: { colorKey: 'Shirt Color', noun: (v) => (v === 'Lines' || v === 'Hawaiian' ? 'Shirt' : null) },
  Pants: { colorKey: 'Pants Color' },
  Necklace: {},
  Earring: {},
}

/**
 * 話題にできる見た目のトレイトか。
 * Human 以外は髪型が固定なので、髪の話はしない。
 */
export function isTalkableTrait(traits: MeebitTraitMap, key: string) {
  const value = traits[key]
  if (!value || NOTHING.has(value)) return false
  if (key === 'Hair Style' && traits.Type !== 'Human') return false
  return key in RULES
}

/**
 * 表示名。withColor=false なら色を付けない（2体の共通点を言うときなど、色がちがうことがあるため）。
 */
export function traitDisplayName(traits: MeebitTraitMap, key: string, withColor = true): string | null {
  if (!isTalkableTrait(traits, key)) return null
  const value = traits[key]
  const rule = RULES[key]
  const color = withColor && rule.colorKey ? traits[rule.colorKey] : undefined
  const noun = rule.noun?.(value) ?? null
  return [color && color !== 'None' ? color : null, value, noun].filter(Boolean).join(' ')
}
