/**
 * Visitor Pass 日替わりカラー（UTC 日付固定）。
 * どれも落ち着いた紙質・低彩度。派手なネオン／グラデは使わない。
 */

import { createSeededRng, getUtcDateKey, hashStringToSeed } from '../../top/dailyFeatured'

export type VisitPassThemeId =
  | 'ivorySlate'
  | 'creamClay'
  | 'mistSage'
  | 'blushInk'
  | 'fogNavy'

export type VisitPassTheme = {
  id: VisitPassThemeId
  /** 紙のグラデ 3 点 */
  paper: [string, string, string]
  paperEdge: string
  ink: string
  inkMuted: string
  inkFaint: string
  rule: string
  accent: string
  /** Verified 印章 */
  seal: string
  sealSoft: string
  photoInnerLine: string
}

/** 5 種。ペーパー感を保ちつつ、日付で色味だけ変わる。 */
export const VISIT_PASS_THEMES: readonly VisitPassTheme[] = [
  {
    id: 'ivorySlate',
    paper: ['#f7f3ec', '#f4f0e8', '#efe9df'],
    paperEdge: '#e6e0d4',
    ink: '#1a2438',
    inkMuted: 'rgba(26, 36, 56, 0.55)',
    inkFaint: 'rgba(26, 36, 56, 0.32)',
    rule: 'rgba(26, 36, 56, 0.18)',
    accent: '#3d5a80',
    seal: 'rgba(132, 42, 48, 0.78)',
    sealSoft: 'rgba(132, 42, 48, 0.55)',
    photoInnerLine: 'rgba(244, 240, 232, 0.35)',
  },
  {
    id: 'creamClay',
    paper: ['#f8f1e6', '#f3ebe0', '#ebe2d4'],
    paperEdge: '#e2d6c6',
    ink: '#2a221c',
    inkMuted: 'rgba(42, 34, 28, 0.55)',
    inkFaint: 'rgba(42, 34, 28, 0.32)',
    rule: 'rgba(42, 34, 28, 0.18)',
    accent: '#8a6a4a',
    seal: 'rgba(120, 58, 36, 0.78)',
    sealSoft: 'rgba(120, 58, 36, 0.55)',
    photoInnerLine: 'rgba(243, 235, 224, 0.35)',
  },
  {
    id: 'mistSage',
    paper: ['#f2f4ef', '#eef1eb', '#e6ebe3'],
    paperEdge: '#d8dfd4',
    ink: '#1e2a24',
    inkMuted: 'rgba(30, 42, 36, 0.55)',
    inkFaint: 'rgba(30, 42, 36, 0.32)',
    rule: 'rgba(30, 42, 36, 0.18)',
    accent: '#5a7264',
    seal: 'rgba(70, 92, 78, 0.78)',
    sealSoft: 'rgba(70, 92, 78, 0.55)',
    photoInnerLine: 'rgba(238, 241, 235, 0.35)',
  },
  {
    id: 'blushInk',
    paper: ['#f7f0ee', '#f3ebe8', '#ebe2df'],
    paperEdge: '#e0d4d0',
    ink: '#2a1e22',
    inkMuted: 'rgba(42, 30, 34, 0.55)',
    inkFaint: 'rgba(42, 30, 34, 0.32)',
    rule: 'rgba(42, 30, 34, 0.18)',
    accent: '#7a5a62',
    seal: 'rgba(120, 48, 58, 0.78)',
    sealSoft: 'rgba(120, 48, 58, 0.55)',
    photoInnerLine: 'rgba(243, 235, 232, 0.35)',
  },
  {
    id: 'fogNavy',
    paper: ['#f0f2f5', '#ebedf1', '#e2e5eb'],
    paperEdge: '#d4d8e0',
    ink: '#1a2030',
    inkMuted: 'rgba(26, 32, 48, 0.55)',
    inkFaint: 'rgba(26, 32, 48, 0.32)',
    rule: 'rgba(26, 32, 48, 0.18)',
    accent: '#4a5a78',
    seal: 'rgba(48, 62, 98, 0.78)',
    sealSoft: 'rgba(48, 62, 98, 0.55)',
    photoInnerLine: 'rgba(235, 237, 241, 0.35)',
  },
] as const

let memoryCache: { dateKey: string; theme: VisitPassTheme } | null = null

/** UTC 日付で固定のテーマを返す（その日は同じ色）。 */
export function getDailyVisitPassTheme(dateKey = getUtcDateKey()): VisitPassTheme {
  if (memoryCache?.dateKey === dateKey) return memoryCache.theme

  const rng = createSeededRng(hashStringToSeed(`meebits-visit-pass-theme:${dateKey}`))
  const index = Math.floor(rng() * VISIT_PASS_THEMES.length)
  const theme = VISIT_PASS_THEMES[index] ?? VISIT_PASS_THEMES[0]

  memoryCache = { dateKey, theme }
  return theme
}
