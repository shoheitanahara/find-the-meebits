import { formatTraitDisplayName } from '../game/traitHunt'
import { getLocale } from '../i18n/locale'
import type { DialogueLine } from '../npc/npcTypes'
import type { DailyThemeTrait } from './dailyFeatured'
import type { ParkNpcRecord } from './parkNpcRegistry'
import { PARK_DIALOGUE_EN, PARK_DIALOGUE_JA, type ParkDialoguePools } from './parkDialoguePool'

function seededIndex(seed: number, talkCount: number, length: number) {
  if (length <= 0) return 0
  const mixed = Math.imul(seed ^ (talkCount * 2654435761), 1597334677) >>> 0
  return mixed % length
}

function pickLine(pool: string[], seed: number, talkCount: number, salt: number): string {
  return pool[seededIndex(seed + salt, talkCount, pool.length)] ?? pool[0] ?? '...'
}

function themeLabel(theme: DailyThemeTrait) {
  return `${theme.traitType} · ${formatTraitDisplayName(theme.traitType, theme.traitValue)}`
}

function fillTheme(text: string, theme: DailyThemeTrait) {
  return text.replaceAll('{theme}', themeLabel(theme)).replaceAll('{value}', theme.traitValue)
}

/**
 * パーク来場者のセリフを 1〜2 行選ぶ。
 * 挨拶 +（ゲーム紹介 / 主役 / 共通点 / フレーバー）を組み合わせる。
 */
export function selectParkDialogueLines(
  npc: ParkNpcRecord,
  talkCount: number,
  featuredId: number,
  themeTrait: DailyThemeTrait,
): DialogueLine[] {
  const locale = getLocale()
  const pools: ParkDialoguePools = locale === 'ja' ? PARK_DIALOGUE_JA : PARK_DIALOGUE_EN
  const seed = npc.meebitNumber
  const lines: DialogueLine[] = []

  const greeting = pickLine(pools.greetings, seed, talkCount, 11)
  lines.push({
    id: `${npc.id}-greet-${talkCount}`,
    text: greeting,
    category: 'greeting',
  })

  // 2行目: マッチ / 主役本人 / ゲーム紹介 / テーマ をローテート
  const branch = seededIndex(seed, talkCount, 6)
  let second = ''

  if (npc.isFeatured) {
    second =
      locale === 'ja'
        ? `実はぼくが今日の主役 #${featuredId} だよ。噴水の銅像、ぼくだ！`
        : `Fun fact — I’m today’s star #${featuredId}. That’s me on the fountain!`
  } else if (npc.matched && branch <= 2) {
    second = fillTheme(pickLine(pools.themeMatched, seed, talkCount, 23), themeTrait)
    if (branch === 0) {
      second = pickLine(pools.featuredMatched, seed, talkCount, 29)
    }
  } else if (branch === 3) {
    second = pickLine(pools.gameFind, seed, talkCount, 31)
  } else if (branch === 4) {
    second = pickLine(pools.gameTraits, seed, talkCount, 37)
  } else if (branch === 5) {
    second = pickLine(pools.gameStreet, seed, talkCount, 41)
  } else {
    // テーマ or 主役の一般言及
    second =
      talkCount % 2 === 0
        ? fillTheme(pickLine(pools.themeAny, seed, talkCount, 43), themeTrait)
        : pickLine(pools.featuredAny, seed, talkCount, 47)
  }

  // たまにフレーバーで差し替え
  if (seededIndex(seed, talkCount, 10) === 0) {
    second = pickLine(pools.parkFlavor, seed, talkCount, 53)
  }

  // マッチ時は2行目に共通点を織り込む（3行目は作らない）
  if (npc.matched && !npc.isFeatured && seededIndex(seed, talkCount, 3) === 1) {
    second =
      locale === 'ja'
        ? `ちなみに今日の共通点は「${themeLabel(themeTrait)}」だよ。`
        : `By the way, today’s link is “${themeLabel(themeTrait)}”.`
  }

  lines.push({
    id: `${npc.id}-body-${talkCount}`,
    text: second,
    category: 'daily',
  })

  return lines
}
