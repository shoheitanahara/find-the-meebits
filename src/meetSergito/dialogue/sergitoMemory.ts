/**
 * Sergito がおぼえていること（来店をまたいで保存）。
 * - これまで話した回数（あいさつを「ふだん → 常連」へ変える）
 * - 前回いっしょに来た Meebit（ちがう Meebit で来たら、そのことに触れる）
 */
const STORAGE_KEY = 'meebits-sergito-memory-v1'

export type SergitoMemory = {
  talks: number
  lastGuest: number | null
}

export function loadSergitoMemory(): SergitoMemory {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { talks: 0, lastGuest: null }
    const data = JSON.parse(raw) as Partial<SergitoMemory>
    return {
      talks: typeof data.talks === 'number' ? data.talks : 0,
      lastGuest: typeof data.lastGuest === 'number' ? data.lastGuest : null,
    }
  } catch {
    return { talks: 0, lastGuest: null }
  }
}

export function rememberSergitoTalk(guest: number) {
  try {
    const current = loadSergitoMemory()
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ talks: current.talks + 1, lastGuest: guest } satisfies SergitoMemory),
    )
  } catch {
    // 保存できなくても会話はできる
  }
}
