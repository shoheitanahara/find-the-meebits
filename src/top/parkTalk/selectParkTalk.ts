import type { MeebitTraitMap } from '../../data/meebitTraits'
import type { DialogueLine } from '../../npc/npcTypes'
import type { ParkNpcRecord } from '../parkNpcRegistry'
import type { ParkTimeOfDay } from '../parkTimeOfDay'
import type { ParkZoneId } from '../parkZones'
import type { DailyNews } from './dailyNews'
import { buildDailyScripts, buildHolidayGreeting } from './dailyTopics'
import { buildDynamicScripts, type DynamicTalkData } from './dynamicTopics'
import { formatPlayerName, getPersonality } from './personality'
import { PARK_TALK_SCRIPTS } from './scripts'
import type { TalkKind, TalkScript } from './types'

export type ParkTalkContext = {
  npc: ParkNpcRecord
  /** この来場者と、これまで話した回数（今回を含まない） */
  talkCount: number
  zoneId: ParkZoneId
  timeOfDay: ParkTimeOfDay
  lang: 'ja' | 'en'
  playerNumber: number
  featuredId: number
  /** 今日のトレイトの表示名（例 Hoodie） */
  traitName: string
  winter: boolean
  /** 話している来場者のトレイト（省略時は読み込み済みのデータから引く） */
  traits?: MeebitTraitMap | null
  /** その場のデータ（プレイヤーの見た目・ほかの来場者・今日の主役）。あれば話題に混ぜる */
  dynamic?: DynamicTalkData
  /** 今日パークで起きていること（ランウェイの色・めずらしい来場者・OpenSea）と、今日の日付 */
  daily?: { news: DailyNews; now: Date }
}

/** 話すと「なかよし」になる回数 */
const FRIEND_TALKS = 4

/** 同じ来場者で直近に話した話題（同じ話を続けて聞かないように） */
const recentByNpc = new Map<number, string[]>()
const RECENT_LIMIT = 5

function hash(a: number, b: number) {
  return Math.imul(a ^ Math.imul(b, 2654435761), 1597334677) >>> 0
}

function fits(script: TalkScript, ctx: ParkTalkContext) {
  if (script.zones && !script.zones.includes(ctx.zoneId)) return false
  if (script.times && !script.times.includes(ctx.timeOfDay)) return false
  return true
}

function personalityOf(ctx: ParkTalkContext) {
  return ctx.traits === undefined
    ? getPersonality(ctx.npc.meebitNumber)
    : getPersonality(ctx.npc.meebitNumber, ctx.traits)
}

function pool(kind: TalkKind, ctx: ParkTalkContext, p = personalityOf(ctx)) {
  return PARK_TALK_SCRIPTS.filter((s) => s.kind === kind && s.p === p && fits(s, ctx))
}

/** 重み付きの候補から、直近に話していないものを選ぶ */
function pickScript(candidates: Array<[TalkScript, number]>, ctx: ParkTalkContext, salt: number) {
  const list: TalkScript[] = []
  for (const [script, weight] of candidates) for (let i = 0; i < weight; i += 1) list.push(script)
  if (list.length === 0) return null
  const recent = recentByNpc.get(ctx.npc.meebitNumber) ?? []
  const start = hash(ctx.npc.meebitNumber + salt, ctx.talkCount) % list.length
  for (let i = 0; i < list.length; i += 1) {
    const script = list[(start + i) % list.length]
    if (!recent.includes(script.id)) return script
  }
  return list[start]
}

function remember(ctx: ParkTalkContext, id: string) {
  const recent = recentByNpc.get(ctx.npc.meebitNumber) ?? []
  recentByNpc.set(ctx.npc.meebitNumber, [id, ...recent.filter((r) => r !== id)].slice(0, RECENT_LIMIT))
}

function fill(text: string, ctx: ParkTalkContext) {
  const p = personalityOf(ctx)
  return text
    .replaceAll('{you}', formatPlayerName(p, ctx.playerNumber, ctx.lang))
    .replaceAll('{me}', `#${ctx.npc.meebitNumber}`)
    .replaceAll('{star}', `#${ctx.featuredId}`)
    .replaceAll('{trait}', ctx.traitName)
}

function toLines(script: TalkScript, ctx: ParkTalkContext, prefix: string): DialogueLine[] {
  const texts = ctx.lang === 'ja' ? script.ja : script.en
  const lines: DialogueLine[] = texts.map((text, i) => ({
    id: `${prefix}-${script.id}-${i}`,
    text: fill(text, ctx),
    category: script.kind.startsWith('greet') ? 'greeting' : 'daily',
  }))
  return lines
}

/**
 * 来場者との会話を組み立てる。あいさつ ＋ 話題ひとつ。
 */
export function selectParkTalk(ctx: ParkTalkContext): DialogueLine[] {
  const { npc, talkCount } = ctx
  // Meebits はもともと仲間どうし。初対面のあいさつはせず、最初から顔なじみとして話す
  const stage: TalkKind = talkCount < FRIEND_TALKS ? 'greetAgain' : 'greetFriend'
  const isFriend = stage === 'greetFriend'

  // あいさつ（時間帯つきのものがあれば少し優先）
  const greetings = pool(stage, ctx)
  // 記念日の当日は、みんな記念日のあいさつをする
  const holidayGreeting = ctx.daily ? buildHolidayGreeting(personalityOf(ctx), ctx.daily.now) : null
  const greeting =
    holidayGreeting ??
    pickScript(
      greetings.map((s) => [s, s.times ? 2 : 1] as [TalkScript, number]),
      ctx,
      11,
    )

  // 話題の候補
  const candidates: Array<[TalkScript, number]> = []
  const add = (kind: TalkKind, zoneWeight: number, anyWeight: number) => {
    for (const s of pool(kind, ctx)) candidates.push([s, s.zones ? zoneWeight : anyWeight])
  }
  if (npc.isFeatured) add('starSelf', 6, 6)
  if (npc.matched) add('traitSelf', 2, 2)
  add('topic', 3, 1)
  add('star', 1, 1)
  add('trait', 1, 1)
  if (isFriend) add('friend', 2, 2)
  if (ctx.winter) add('winter', 2, 2)
  // 今日パークで起きていること・曜日・季節
  if (ctx.daily) {
    for (const { script, weight } of buildDailyScripts(personalityOf(ctx), ctx.daily.news, npc.meebitNumber, talkCount, ctx.daily.now)) {
      candidates.push([script, weight])
    }
  }
  // その場のデータから作る話題（見た目・うわさ・主役のトレイト）
  if (ctx.dynamic) {
    for (const { script, weight } of buildDynamicScripts(personalityOf(ctx), ctx.dynamic, npc.meebitNumber, talkCount)) {
      candidates.push([script, weight])
    }
  }

  const topic = pickScript(candidates, ctx, 29)

  const prefix = `${npc.id}-${talkCount}`
  const lines: DialogueLine[] = []
  if (greeting) lines.push(...toLines(greeting, ctx, prefix))
  if (topic) {
    lines.push(...toLines(topic, ctx, prefix))
    remember(ctx, topic.id)
  }
  return lines
}
