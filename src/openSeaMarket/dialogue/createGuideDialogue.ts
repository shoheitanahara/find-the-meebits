import { getLocale } from '../../i18n/locale'
import type { DialogueLine } from '../../npc/npcTypes'

const GUIDE_LINES_JA = [
  '奥の台座、Digital Sculpture の展示だよ。近づいて見てみて！',
  '気になる彫刻があったら、値札の近くで OpenSea を開いてね。',
  '歩いてるのは案内係。売ってるのは台座の作品だよ。',
  'OpenSea Marketへようこそ。彫刻ギャラリーをゆっくりどうぞ。',
] as const

const GUIDE_LINES_EN = [
  'Those pedestals are Digital Sculpture exhibits — go take a look!',
  'If a piece catches your eye, open OpenSea from the price tag.',
  'We’re just guides. The works for sale are on the pedestals.',
  'Welcome to OpenSea Market. Enjoy the sculpture gallery.',
] as const

/** 歩行案内NPC — 値段・自己出品には触れない */
export function createGuideDialogue(meebitId: number): DialogueLine[] {
  const locale = getLocale()
  const lines = locale === 'ja' ? GUIDE_LINES_JA : GUIDE_LINES_EN
  const pick = lines[meebitId % lines.length]!
  return [{ id: `opensea-guide-${meebitId}`, text: pick, category: 'meebits' }]
}
