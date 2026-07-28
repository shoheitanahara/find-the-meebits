import type { MeebitTraitMap } from '../../data/meebitTraits'
import { getLocale } from '../../i18n/locale'
import type { DialogueLine } from '../../npc/npcTypes'
import { SERGITO_MEEBIT_ID } from '../config'
import {
  SERGITO_CATEGORY_COMMENTS,
  SERGITO_FALLBACK_DIALOGUES,
  SERGITO_GREETINGS,
  SERGITO_SPECIAL_DIALOGUES,
  SERGITO_TRAIT_SPECIFIC,
  TRAIT_CATEGORY_PRIORITY,
  TRAIT_KEY_PRIORITY,
  TRAIT_KEY_TO_CATEGORY,
  type LocalizedText,
  type SergitoDialogueCategory,
} from './sergitoDialogueData'

export type SergitoDialogueContext = {
  meebitId: number
  traits: MeebitTraitMap | null
  talkCount: number
}

/** パーク NPC と同様、1 回の会話は 2 行 */
const SERGITO_LINES_PER_TALK = 2

function pickLocalized(text: LocalizedText) {
  return getLocale() === 'ja' ? text.ja : text.en
}

function seededIndex(seed: number, talkCount: number, length: number) {
  if (length <= 0) return 0
  return Math.abs((seed * 17 + talkCount * 31 + 7) % length)
}

function toLine(id: string, text: string, category: SergitoDialogueCategory): DialogueLine {
  return { id, text, category: category === 'special' || category === 'fallback' ? 'greeting' : category === 'closing' ? 'greeting' : category === 'body' ? 'meebits' : 'daily' }
}

function pickFromPool(pool: LocalizedText[], seed: number, talkCount: number, usedTexts: Set<string>) {
  if (pool.length === 0) return null
  for (let attempt = 0; attempt < pool.length; attempt += 1) {
    const index = (seededIndex(seed, talkCount + attempt, pool.length) + attempt) % pool.length
    const text = pickLocalized(pool[index])
    if (!usedTexts.has(text)) {
      usedTexts.add(text)
      return text
    }
  }
  const fallback = pickLocalized(pool[seededIndex(seed, talkCount, pool.length)])
  usedTexts.add(fallback)
  return fallback
}

function getTraitSpecificComment(traitKey: string, traitValue: string, seed: number, talkCount: number, usedTexts: Set<string>) {
  const pool = SERGITO_TRAIT_SPECIFIC[traitKey]?.[traitValue]
  if (!pool?.length) return null
  return pickFromPool(pool, seed + traitKey.length, talkCount, usedTexts)
}

function getCategoryComment(category: SergitoDialogueCategory, seed: number, talkCount: number, usedTexts: Set<string>) {
  if (category === 'greeting' || category === 'closing' || category === 'special' || category === 'fallback') {
    return null
  }
  const pool = SERGITO_CATEGORY_COMMENTS[category]
  return pickFromPool(pool, seed + category.length, talkCount, usedTexts)
}

function selectCommentableTrait(traits: MeebitTraitMap | null) {
  if (!traits) return null

  const candidates: Array<{ traitKey: string; traitValue: string; category: SergitoDialogueCategory }> = []

  for (const traitKey of TRAIT_KEY_PRIORITY) {
    const traitValue = traits[traitKey]
    if (!traitValue || traitValue === 'No') continue
    const category = TRAIT_KEY_TO_CATEGORY[traitKey]
    if (!category) continue
    candidates.push({ traitKey, traitValue, category })
  }

  for (const category of TRAIT_CATEGORY_PRIORITY) {
    const match = candidates.find((c) => c.category === category)
    if (match) return match
  }

  return candidates[0] ?? null
}

function buildSpecialDialogue(talkCount: number): DialogueLine[] {
  const pool = SERGITO_SPECIAL_DIALOGUES[seededIndex(SERGITO_MEEBIT_ID, talkCount, SERGITO_SPECIAL_DIALOGUES.length)]
  return pool
    .slice(0, SERGITO_LINES_PER_TALK)
    .map((line, index) => toLine(`sergito-special-${index}`, pickLocalized(line), 'special'))
}

function buildFallbackDialogue(talkCount: number): DialogueLine[] {
  const pool = SERGITO_FALLBACK_DIALOGUES[seededIndex(0, talkCount, SERGITO_FALLBACK_DIALOGUES.length)]
  return pool
    .slice(0, SERGITO_LINES_PER_TALK)
    .map((line, index) => toLine(`sergito-fallback-${index}`, pickLocalized(line), 'fallback'))
}

export function createSergitoDialogue(context: SergitoDialogueContext): DialogueLine[] {
  if (context.meebitId === SERGITO_MEEBIT_ID) {
    return buildSpecialDialogue(context.talkCount)
  }

  const usedTexts = new Set<string>()
  const seed = context.meebitId
  const lines: DialogueLine[] = []

  const greeting = pickFromPool(SERGITO_GREETINGS, seed, context.talkCount, usedTexts)
  if (greeting) {
    lines.push(toLine('sergito-greeting', greeting, 'greeting'))
  }

  const trait = selectCommentableTrait(context.traits)

  if (!trait) {
    return buildFallbackDialogue(context.talkCount)
  }

  const comment =
    getTraitSpecificComment(trait.traitKey, trait.traitValue, seed, context.talkCount, usedTexts) ??
    getCategoryComment(trait.category, seed + 19, context.talkCount, usedTexts)

  if (comment) {
    lines.push(toLine('sergito-trait-0', comment, trait.category))
  }

  if (lines.length < SERGITO_LINES_PER_TALK) {
    return buildFallbackDialogue(context.talkCount)
  }

  return lines.slice(0, SERGITO_LINES_PER_TALK)
}
