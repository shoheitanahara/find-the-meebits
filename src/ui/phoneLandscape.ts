/**
 * スマホ横向き（高さ狭い）用 Tailwind クラス。
 * `phone-land` バリアントは `src/styles/index.css` で定義。
 */

export const PHONE_LAND_MOBILE_BAR =
  'phone-land:px-[max(0.4rem,env(safe-area-inset-left))] phone-land:pr-[max(0.4rem,env(safe-area-inset-right))] phone-land:pb-[max(0.35rem,env(safe-area-inset-bottom))]'

export const PHONE_LAND_DIALOGUE =
  'phone-land:!inset-x-[max(0.5rem,env(safe-area-inset-left))] phone-land:!right-[max(0.5rem,env(safe-area-inset-right))] phone-land:!top-auto phone-land:!bottom-[max(7.25rem,calc(env(safe-area-inset-bottom)+6.75rem))] phone-land:!mx-0 phone-land:!w-auto phone-land:max-h-[min(42dvh,13.5rem)] phone-land:overflow-y-auto'

/** パーク戻りヘッダー下のスタート／得点／リザルト */
export const PHONE_LAND_OVERLAY_FRAME =
  'phone-land:!items-center phone-land:!justify-center phone-land:!px-3 phone-land:!py-2 phone-land:!pt-[max(2.35rem,calc(env(safe-area-inset-top)+2rem))] phone-land:!pb-[max(0.4rem,env(safe-area-inset-bottom))]'

export const PHONE_LAND_OVERLAY_CARD =
  'phone-land:max-h-[calc(100dvh-2.7rem)] phone-land:overflow-y-auto phone-land:p-3'

export const PHONE_LAND_OVERLAY_TITLE =
  'phone-land:mt-1 phone-land:text-xl'
