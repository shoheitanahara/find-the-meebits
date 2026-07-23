import type { ParkSeason } from './parkSeason'
import type { ParkZoneLayout } from './parkZones'

/**
 * 季節デコ（エリア内側のみ）。
 * 外周の椰子・砂浜は設計上廃止（川・崖・壁へ移行）。
 */
export function ParkSeasonDecor({
  season: _season,
  layout: _layout,
}: {
  season: ParkSeason
  layout: ParkZoneLayout
}) {
  return null
}
