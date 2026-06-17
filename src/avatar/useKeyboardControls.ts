import { useEffect, useRef } from 'react'

export type KeyboardControls = {
  forward: boolean
  backward: boolean
  left: boolean
  right: boolean
  run: boolean
}

const keyMap: Record<string, keyof KeyboardControls> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'run',
  ShiftRight: 'run',
}

export function useKeyboardControls() {
  const controlsRef = useRef<KeyboardControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    run: false,
  })

  useEffect(() => {
    const updateKey = (event: KeyboardEvent, isPressed: boolean) => {
      const control = keyMap[event.code]

      if (!control) {
        return
      }

      controlsRef.current[control] = isPressed
    }

    const handleKeyDown = (event: KeyboardEvent) => updateKey(event, true)
    const handleKeyUp = (event: KeyboardEvent) => updateKey(event, false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return controlsRef
}
