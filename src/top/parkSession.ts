import { normalizePlayerMeebitNumber } from '../systems/save/localStorage'
import { parkPlayerWorld } from './parkPlayerWorld'
import { useTopStore } from './topStore'
import type { ParkZoneId } from './parkZones'

/** 言語切替のワンショット再開用。通常リロードでは書き込まれない */
const LOCALE_RESUME_KEY = 'meebits-park-locale-resume-v1'
/** @deprecated 旧キー。読み取り時に掃除する */
const LEGACY_SESSION_KEY = 'meebits-park-session-v1'

export type ParkLocaleResume = {
  meebitNumber: number
  x: number
  z: number
  rotationY: number
  zoneId: ParkZoneId
}

function isParkZoneId(value: unknown): value is ParkZoneId {
  return value === 'plaza' || value === 'mountain' || value === 'culture' || value === 'sea'
}

function parseParkLocaleResume(raw: string): ParkLocaleResume | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ParkLocaleResume>
    if (!isParkZoneId(parsed.zoneId)) return null
    if (!Number.isFinite(parsed.x) || !Number.isFinite(parsed.z) || !Number.isFinite(parsed.rotationY)) {
      return null
    }

    return {
      meebitNumber: normalizePlayerMeebitNumber(parsed.meebitNumber),
      x: parsed.x as number,
      z: parsed.z as number,
      rotationY: parsed.rotationY as number,
      zoneId: parsed.zoneId,
    }
  } catch {
    return null
  }
}

/** 言語切替クリック直前: 現在位置を1回だけ保存 */
export function saveParkLocaleResume() {
  if (typeof window === 'undefined') return

  const state = useTopStore.getState()
  if (!state.started) return

  try {
    sessionStorage.setItem(
      LOCALE_RESUME_KEY,
      JSON.stringify({
        meebitNumber: state.meebitNumber,
        x: parkPlayerWorld.x,
        z: parkPlayerWorld.z,
        rotationY: parkPlayerWorld.rotationY,
        zoneId: state.activeZoneId,
      } satisfies ParkLocaleResume),
    )
  } catch {
    // sessionStorage 不可でもゲームは続行
  }
}

/** ロード時: 保存があれば復帰用データを返し、キーは必ず削除 */
export function takeParkLocaleResume(): ParkLocaleResume | null {
  if (typeof window === 'undefined') return null

  try {
    sessionStorage.removeItem(LEGACY_SESSION_KEY)
    const raw = sessionStorage.getItem(LOCALE_RESUME_KEY)
    sessionStorage.removeItem(LOCALE_RESUME_KEY)
    if (!raw) return null
    return parseParkLocaleResume(raw)
  } catch {
    sessionStorage.removeItem(LOCALE_RESUME_KEY)
    return null
  }
}
