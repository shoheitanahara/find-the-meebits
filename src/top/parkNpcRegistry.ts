import type { DailyThemeTrait } from './dailyFeatured'

export type ParkNpcRecord = {
  id: string
  meebitNumber: number
  matched: boolean
  /** 主役本人の来場者なら true */
  isFeatured: boolean
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
