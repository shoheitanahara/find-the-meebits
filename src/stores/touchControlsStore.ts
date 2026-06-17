import { create } from 'zustand'

type TouchControlsState = {
  joystickX: number
  joystickY: number
  joystickActive: boolean
  setJoystick: (x: number, y: number, active: boolean) => void
  resetJoystick: () => void
}

export const useTouchControlsStore = create<TouchControlsState>((set) => ({
  joystickX: 0,
  joystickY: 0,
  joystickActive: false,
  setJoystick: (joystickX, joystickY, joystickActive) =>
    set({ joystickX, joystickY, joystickActive }),
  resetJoystick: () => set({ joystickX: 0, joystickY: 0, joystickActive: false }),
}))
