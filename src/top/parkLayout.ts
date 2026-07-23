/**
 * Park hub レイアウト。
 * 実体はゾーン定義（parkZones）側。互換のためデフォルトは Plaza。
 */
import { DEFAULT_PARK_ZONE, getParkZone, type ParkZoneId, type ParkZoneLayout } from './parkZones'

export type { ParkZoneLayout }

export function getParkLayout(zoneId: ParkZoneId = DEFAULT_PARK_ZONE): ParkZoneLayout {
  return getParkZone(zoneId).layout
}

/** @deprecated アクティブゾーンの layout を使う。当面は Plaza の定数として残す。 */
export const PARK_HUB = getParkZone('plaza').layout
