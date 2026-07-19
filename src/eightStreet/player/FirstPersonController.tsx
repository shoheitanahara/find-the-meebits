import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Euler, Vector3 } from 'three'
import { clampToAlley, EIGHT_STREET } from '../config'
import { useEightStreetControlsStore } from '../controlsStore'
import {
  createJudgeZones,
  tryResolveAnswer,
  updateJudgeZones,
  type JudgeZones,
} from '../logic/judgeAnswer'
import { useEightStreetStore } from '../store'

const MOVE_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD',
  'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
])

export function FirstPersonController({ enabled }: { enabled: boolean }) {
  const { camera, gl } = useThree()
  const yawRef = useRef(0)
  const pitchRef = useRef(0)
  const posRef = useRef(new Vector3(EIGHT_STREET.playerStartX, EIGHT_STREET.eyeHeight, EIGHT_STREET.playerStartZ))
  const keysRef = useRef(new Set<string>())
  const shiftRef = useRef(false)
  const zonesRef = useRef<JudgeZones>(createJudgeZones())
  const lockedRef = useRef(false)
  const boostRef = useRef(0)

  const submitAnswer = useEightStreetStore((s) => s.submitAnswer)
  const phase = useEightStreetStore((s) => s.phase)
  const loopKey = useEightStreetStore((s) => s.loopKey)
  const isAdvancing = useEightStreetStore((s) => s.isAdvancing)

  // Reset on each street loop
  useEffect(() => {
    const handoff = useEightStreetStore.getState().handoff
    zonesRef.current = createJudgeZones()
    boostRef.current = 0

    // Always land in front of the return line so turn-back cannot re-fire on wrap-in.
    const landZ = EIGHT_STREET.entranceLandingZ

    if (handoff === 'continue') {
      const lateralOffset = posRef.current.x - EIGHT_STREET.corner2X
      posRef.current.set(
        EIGHT_STREET.playerStartX + lateralOffset,
        EIGHT_STREET.eyeHeight,
        landZ,
      )
      boostRef.current = 0.85
    } else if (handoff === 'restart') {
      posRef.current.set(EIGHT_STREET.playerStartX, EIGHT_STREET.eyeHeight, landZ)
      yawRef.current = 0
      pitchRef.current = 0
      boostRef.current = 0.75
    } else {
      posRef.current.set(EIGHT_STREET.playerStartX, EIGHT_STREET.eyeHeight, EIGHT_STREET.playerStartZ)
      yawRef.current = 0
      pitchRef.current = 0
    }

    camera.position.copy(posRef.current)
    camera.quaternion.setFromEuler(new Euler(pitchRef.current, yawRef.current, 0, 'YXZ'))
  }, [camera, loopKey])

  // Input binding
  useEffect(() => {
    if (!enabled) return
    const kd = (e: KeyboardEvent) => {
      if (MOVE_KEYS.has(e.code)) { e.preventDefault(); keysRef.current.add(e.code) }
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') shiftRef.current = true
    }
    const ku = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code)
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') shiftRef.current = false
    }
    const blur = () => { keysRef.current.clear(); shiftRef.current = false }
    const mm = (e: MouseEvent) => {
      if (!lockedRef.current) return
      yawRef.current -= e.movementX * EIGHT_STREET.mouseLookSensitivity
      pitchRef.current = Math.max(-EIGHT_STREET.pitchMaxDown, Math.min(EIGHT_STREET.pitchMaxUp,
        pitchRef.current - e.movementY * EIGHT_STREET.mouseLookSensitivity))
    }
    const click = () => { if (document.pointerLockElement !== gl.domElement) void gl.domElement.requestPointerLock() }
    const plc = () => { lockedRef.current = document.pointerLockElement === gl.domElement }

    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    window.addEventListener('blur', blur)
    window.addEventListener('mousemove', mm)
    gl.domElement.addEventListener('click', click)
    document.addEventListener('pointerlockchange', plc)
    return () => {
      window.removeEventListener('keydown', kd)
      window.removeEventListener('keyup', ku)
      window.removeEventListener('blur', blur)
      window.removeEventListener('mousemove', mm)
      gl.domElement.removeEventListener('click', click)
      document.removeEventListener('pointerlockchange', plc)
      shiftRef.current = false
      if (document.pointerLockElement === gl.domElement) document.exitPointerLock()
    }
  }, [enabled, gl])

  useFrame((_, dt) => {
    if (!enabled || (phase !== 'playing' && phase !== 'cleared')) return

    const ctrl = useEightStreetControlsStore.getState()
    if (Math.abs(ctrl.lookX) > 0.01 || Math.abs(ctrl.lookY) > 0.01) {
      yawRef.current -= ctrl.lookX * EIGHT_STREET.touchLookSensitivity * dt
      pitchRef.current = Math.max(-EIGHT_STREET.pitchMaxDown, Math.min(EIGHT_STREET.pitchMaxUp,
        pitchRef.current + ctrl.lookY * EIGHT_STREET.touchLookSensitivity * dt))
    }

    let mx = ctrl.moveX, mz = ctrl.moveY
    const k = keysRef.current
    if (k.has('KeyA') || k.has('ArrowLeft')) mx -= 1
    if (k.has('KeyD') || k.has('ArrowRight')) mx += 1
    if (k.has('KeyW') || k.has('ArrowUp')) mz += 1
    if (k.has('KeyS') || k.has('ArrowDown')) mz -= 1

    if (boostRef.current > 0) { boostRef.current -= dt; if (mz >= 0) mz = Math.max(mz, 1) }

    const len = Math.hypot(mx, mz)
    if (len > 1) { mx /= len; mz /= len }

    const yaw = yawRef.current
    const speed = (shiftRef.current || ctrl.sprint) ? EIGHT_STREET.dashSpeed : EIGHT_STREET.moveSpeed
    const dx = (-Math.sin(yaw) * mz + Math.cos(yaw) * mx) * speed * dt
    const dz = (-Math.cos(yaw) * mz - Math.sin(yaw) * mx) * speed * dt

    const clamped = clampToAlley(posRef.current.x + dx, posRef.current.z + dz)
    posRef.current.set(clamped.x, EIGHT_STREET.eyeHeight, clamped.z)

    camera.position.copy(posRef.current)
    camera.quaternion.setFromEuler(new Euler(pitchRef.current, yawRef.current, 0, 'YXZ'))

    if (phase !== 'playing' || isAdvancing) return

    zonesRef.current = updateJudgeZones(posRef.current.x, posRef.current.z, zonesRef.current)
    // While entrance boost is active, ignore turn-back so wrap-ins do not re-trigger.
    const answer = tryResolveAnswer(posRef.current.x, posRef.current.z, zonesRef.current, {
      allowAnomaly: boostRef.current <= 0,
    })
    if (answer) submitAnswer(answer)
  })

  return null
}
