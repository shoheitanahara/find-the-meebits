/**
 * パーク来場者の会話（どうぶつの森のような「性格のある短い会話」）。
 *
 * - 来場者は番号ごとに性格が決まっていて、一人称・語尾・話題の選び方が変わる。
 * - 会話は「あいさつ（ふだん／なかよし）」＋「話題ひとつ（2〜4行で完結）」。
 * - 話題には、まわりの施設の体験談・今日の主役・今日のトレイトなどがある。
 * - 日本語と英語は同じ場面を、それぞれの言葉で自然に書く（直訳しない）。
 *
 * 文中の差し込み:
 *   {you}   話しかけているプレイヤー（例 #1234 / #1234さん）
 *   {me}    話している来場者（例 #5821）
 *   {star}  今日の主役（例 #8077）
 *   {trait} 今日のトレイト（例 Hoodie）
 */
import type { ParkTimeOfDay } from '../parkTimeOfDay'
import type { ParkZoneId } from '../parkZones'

export type PersonalityId =
  | 'street'
  | 'sporty'
  | 'cool'
  | 'photographer'
  | 'stylish'
  | 'bubbly'
  | 'sisterly'
  | 'explorer'
  | 'sage'
  | 'robot'

export type TalkKind =
  /** ふだんのあいさつ（Meebits はもともと仲間なので、初対面のあいさつはない） */
  | 'greetAgain'
  /** 5回目以降のあいさつ（なかよし） */
  | 'greetFriend'
  /** ふつうの話題 */
  | 'topic'
  /** なかよしになってから聞ける身の上話 */
  | 'friend'
  /** 今日の主役（噴水の銅像）の話 */
  | 'star'
  /** 今日のトレイトの話 */
  | 'trait'
  /** 話している本人が今日の主役のとき */
  | 'starSelf'
  /** 話している本人が今日のトレイトを着ているとき */
  | 'traitSelf'
  /** 冬（クリスマスの時期）の話 */
  | 'winter'

export type TalkScript = {
  id: string
  p: PersonalityId
  kind: TalkKind
  /** 話せるエリア（省略時はどこでも） */
  zones?: ParkZoneId[]
  /** 話せる時間帯（省略時はいつでも） */
  times?: ParkTimeOfDay[]
  ja: string[]
  en: string[]
}
