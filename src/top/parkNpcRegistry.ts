import type { DailyThemeTrait } from './dailyFeatured'
import { CREATOR_MEEBIT_ID } from '../game/gameConfig'

export type ParkNpcRecord = {
  id: string
  meebitNumber: number
  matched: boolean
  /** 主役本人の来場者なら true */
  isFeatured: boolean
  /** パークに立つ作成者 Shawn T. Art */
  isCreator?: boolean
}

/** 噴水右・看板そば（作成者の定位置） */
export const PARK_CREATOR_POSITION: [number, number, number] = [5.4, 0, 7.35]
/** パーク中央寄りを向く */
export const PARK_CREATOR_ROTATION_Y = Math.PI * 0.92

export function parkCreatorNpcId() {
  return 'park-npc-creator'
}

export function parkCreatorRecord(): ParkNpcRecord {
  return {
    id: parkCreatorNpcId(),
    meebitNumber: CREATOR_MEEBIT_ID,
    matched: false,
    isFeatured: false,
    isCreator: true,
  }
}

const byId = new Map<string, ParkNpcRecord>()

export function clearParkNpcRegistry() {
  byId.clear()
}

export function registerParkNpcs(records: ParkNpcRecord[]) {
  byId.clear()
  for (const record of records) {
    byId.set(record.id, record)
  }
}

export function getParkNpcById(id: string): ParkNpcRecord | null {
  return byId.get(id) ?? null
}

export function parkNpcIdFor(meebitNumber: number) {
  return `park-npc-${meebitNumber}`
}

export type ParkDialogueContext = {
  featuredId: number
  themeTrait: DailyThemeTrait
}
