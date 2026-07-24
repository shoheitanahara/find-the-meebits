/** 吹き出し表示中に周辺 HUD を薄くする（消さない）。Park / Museum / TraitHunt 共通。 */
export const DIALOGUE_DIM_TRANSITION = 'transition-opacity duration-200'

export function dialogueChromeDimClass(isDialogueOpen: boolean) {
  return `${DIALOGUE_DIM_TRANSITION} ${isDialogueOpen ? 'opacity-25' : 'opacity-100'}`
}
