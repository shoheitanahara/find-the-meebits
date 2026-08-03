/**
 * 登山（Mt. Meeb / Jerry Mountain）の日替わり。
 * 日付境界はパーク来場者と同じく UTC 0:00。
 */

import { getUtcDateKey, hashStringToSeed } from '../top/dailyFeatured'
import type { ClimbThemeId } from './climbTheme'

/** 本日の日付キー（UTC YYYY-MM-DD） */
export function getClimbDayKey(now = new Date()) {
  return getUtcDateKey(now)
}

/**
 * ステージ基本シードに「日付 × テーマ」を混ぜる。
 * 同日・同テーマ・同ステージなら常に同じ地形。日付が変わると別コース。
 */
export function mixDailyStageSeed(baseSeed: number, stageId: number, themeId: ClimbThemeId) {
  const daySalt = hashStringToSeed(`meebits-climb:${themeId}:${getClimbDayKey()}`)
  return (Math.imul(baseSeed, 1664525) + daySalt + stageId * 1013904223) >>> 0
}
