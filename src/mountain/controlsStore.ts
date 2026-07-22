import { create } from 'zustand'

type MountainControlsState = {
  joystickX: number
  joystickY: number
  joystickActive: boolean
  /** ジョイスティック半径に対する押し込み量 0–1（外縁ダッシュ用） */
  joystickMagnitude: number
  jumpPressed: boolean
  dashHeld: boolean
  setJoystick: (x: number, y: number, active: boolean, magnitude: number) => void
  resetJoystick: () => void
  setJumpPressed: (pressed: boolean) => void
  setDashHeld: (held: boolean) => void
  consumeJumpPress: () => boolean
}

export const useMountainControlsStore = create<MountainControlsState>((set, get) => ({
  joystickX: 0,
  joystickY: 0,
  joystickActive: false,
  joystickMagnitude: 0,
  jumpPressed: false,
  dashHeld: false,
  setJoystick: (joystickX, joystickY, joystickActive, joystickMagnitude) =>
    set({ joystickX, joystickY, joystickActive, joystickMagnitude }),
  resetJoystick: () =>
    set({ joystickX: 0, joystickY: 0, joystickActive: false, joystickMagnitude: 0 }),
  setJumpPressed: (jumpPressed) => set({ jumpPressed }),
  setDashHeld: (dashHeld) => set({ dashHeld }),
  consumeJumpPress: () => {
    if (!get().jumpPressed) return false
    set({ jumpPressed: false })
    return true
  },
}))
