/**
 * Visitor Pass 日替わりカラー（UTC 日付固定）。
 * 紙の質感は保ちつつ、テーマ同士は一目で区別できる色味にする。
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

/**
 * 5 種。紙色・アクセント・印章をはっきり分ける。
 * ivorySlate=ライラック紫 / cream=暖色テラコッタ / sage=緑 / blush=ローズ / navy=青
 */
export const VISIT_PASS_THEMES: readonly VisitPassTheme[] = [
  {
    id: 'ivorySlate',
    paper: ['#f3eaf8', '#e8daf2', '#dcc8ea'],
    paperEdge: '#b890d0',
    ink: '#241430',
    inkMuted: 'rgba(36, 20, 48, 0.58)',
    inkFaint: 'rgba(36, 20, 48, 0.34)',
    rule: 'rgba(36, 20, 48, 0.22)',
    accent: '#7a3cb0',
    seal: 'rgba(96, 36, 140, 0.85)',
    sealSoft: 'rgba(96, 36, 140, 0.6)',
    photoInnerLine: 'rgba(243, 234, 248, 0.4)',
  },
  {
    id: 'creamClay',
    paper: ['#fff0dc', '#f7e2c4', '#efd2a8'],
    paperEdge: '#e0b878',
    ink: '#3a2414',
    inkMuted: 'rgba(58, 36, 20, 0.58)',
    inkFaint: 'rgba(58, 36, 20, 0.34)',
    rule: 'rgba(58, 36, 20, 0.22)',
    accent: '#c45e1a',
    seal: 'rgba(156, 58, 18, 0.85)',
    sealSoft: 'rgba(156, 58, 18, 0.6)',
    photoInnerLine: 'rgba(255, 240, 220, 0.4)',
  },
  {
    id: 'mistSage',
    paper: ['#e8f3ea', '#d8e9dc', '#c5dccc'],
    paperEdge: '#8fb89a',
    ink: '#14281c',
    inkMuted: 'rgba(20, 40, 28, 0.58)',
    inkFaint: 'rgba(20, 40, 28, 0.34)',
    rule: 'rgba(20, 40, 28, 0.22)',
    accent: '#2f7a4e',
    seal: 'rgba(28, 96, 58, 0.85)',
    sealSoft: 'rgba(28, 96, 58, 0.6)',
    photoInnerLine: 'rgba(232, 243, 234, 0.4)',
  },
  {
    id: 'blushInk',
    paper: ['#fce8ee', '#f5d5e0', '#ecc4d2'],
    paperEdge: '#d888a0',
    ink: '#3a1424',
    inkMuted: 'rgba(58, 20, 36, 0.58)',
    inkFaint: 'rgba(58, 20, 36, 0.34)',
    rule: 'rgba(58, 20, 36, 0.22)',
    accent: '#c03a68',
    seal: 'rgba(140, 28, 58, 0.85)',
    sealSoft: 'rgba(140, 28, 58, 0.6)',
    photoInnerLine: 'rgba(252, 232, 238, 0.4)',
  },
  {
    id: 'fogNavy',
    paper: ['#e4eaf6', '#d2dced', '#bccae3'],
    paperEdge: '#7a92c0',
    ink: '#101828',
    inkMuted: 'rgba(16, 24, 40, 0.58)',
    inkFaint: 'rgba(16, 24, 40, 0.34)',
    rule: 'rgba(16, 24, 40, 0.22)',
    accent: '#2a4aa0',
    seal: 'rgba(32, 48, 120, 0.85)',
    sealSoft: 'rgba(32, 48, 120, 0.6)',
    photoInnerLine: 'rgba(228, 234, 246, 0.4)',
  },
] as const

let memoryCache: { dateKey: string; theme: VisitPassTheme } | null = null

/** テーマ ID から取得（DEV の手動切替用）。 */
export function getVisitPassThemeById(id: VisitPassThemeId): VisitPassTheme {
  return VISIT_PASS_THEMES.find((theme) => theme.id === id) ?? VISIT_PASS_THEMES[0]
}

/** UTC 日付で固定のテーマを返す（その日は同じ色）。 */
export function getDailyVisitPassTheme(dateKey = getUtcDateKey()): VisitPassTheme {
  if (memoryCache?.dateKey === dateKey) return memoryCache.theme

  const rng = createSeededRng(hashStringToSeed(`meebits-visit-pass-theme:${dateKey}`))
  const index = Math.floor(rng() * VISIT_PASS_THEMES.length)
  const theme = VISIT_PASS_THEMES[index] ?? VISIT_PASS_THEMES[0]

  memoryCache = { dateKey, theme }
  return theme
}
