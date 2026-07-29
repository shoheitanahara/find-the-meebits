import { create } from 'zustand'

/** スマホの発砲入力。ドラッグ照準はゲームストアへ直接反映する。 */
type ShootingControlsState = {
  firePressed: boolean
  setFirePressed: (pressed: boolean) => void
  consumeFirePress: () => boolean
}

let fireLatched = false

export const useShootingControlsStore = create<ShootingControlsState>((set, get) => ({
  firePressed: false,
  setFirePressed: (pressed) => {
    if (pressed && !get().firePressed) {
      fireLatched = true
    }
    set({ firePressed: pressed })
  },
  consumeFirePress: () => {
    if (!fireLatched) return false
    fireLatched = false
    return true
  },
}))
