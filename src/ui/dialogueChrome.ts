/** 吹き出し表示中に周辺 HUD を薄くする（消さない）。Park / Museum / TraitHunt 共通。 */
export const DIALOGUE_DIM_TRANSITION = 'transition-opacity duration-200'

export function dialogueChromeDimClass(isDialogueOpen: boolean) {
  return `${DIALOGUE_DIM_TRANSITION} ${isDialogueOpen ? 'opacity-25' : 'opacity-100'}`
}

function dialogueBoxPosition(top: string, phoneTop: string) {
  return [
    'pointer-events-auto absolute inset-x-0 z-[70] mx-auto',
    'w-[min(860px,calc(100%-2rem))] max-lg:w-[calc(100%-0.75rem)]',
    top,
    // スマホ横向き：左右の余白とセーフエリア、高さを抑えて上に置く
    'phone-land:!inset-x-[max(0.5rem,env(safe-area-inset-left))] phone-land:!right-[max(0.5rem,env(safe-area-inset-right))]',
    `${phoneTop} phone-land:!mx-0 phone-land:!w-auto`,
    'phone-land:max-h-[min(42dvh,13.5rem)] phone-land:overflow-y-auto',
  ].join(' ')
}

/**
 * 会話ダイアログの位置。PC・モバイル・スマホ横向きとも画面の上で、
 * 言語切り替え（EN / 日本語）と同じ高さにそろえる。
 * 会話中は言語切り替えや HUD より手前に出す（閉じるボタンが隠れないように）。
 */
/** パーク（ヘッダーなし） */
export const DIALOGUE_BOX_POSITION = dialogueBoxPosition(
  'top-[max(1rem,env(safe-area-inset-top))]',
  'phone-land:!top-[max(0.35rem,env(safe-area-inset-top))]',
)

/** アトラクションの中（上にヘッダーがあるので、その分だけ下げる。LANGUAGE_SWITCHER_ATTRACTION_CLASS と同じ高さ） */
export const DIALOGUE_BOX_POSITION_ATTRACTION = dialogueBoxPosition(
  'top-[max(3.25rem,calc(env(safe-area-inset-top)+2.75rem))]',
  'phone-land:!top-[max(2.35rem,calc(env(safe-area-inset-top)+1.85rem))]',
)
