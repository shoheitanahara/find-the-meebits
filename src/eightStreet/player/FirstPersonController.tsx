import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Euler, Vector3 } from 'three'
import { playSfx } from '../../ui/sfx'
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

/** Shortest signed delta from `from` to `to` in (−π, π]. */
function shortestAngleDelta(from: number, to: number) {
  let d = to - from
  while (d > Math.PI) d -= Math.PI * 2
  while (d < -Math.PI) d += Math.PI * 2
  return d
}

/** Same cadence as Find the Meebits (`FootstepAudioSystem`). */
const DASH_FOOTSTEP_INTERVAL_SEC = 0.25
/** Slightly slower than dash when walking. */
const WALK_FOOTSTEP_INTERVAL_SEC = 0.34

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
  const stepTimerRef = useRef(0)
  /** Handoff must apply in useFrame (not useEffect) or return-line can re-judge. */
  const appliedLoopKeyRef = useRef(-1)
  /** Judgment stays cold until the new cast is mounted for this advance. */
  const armedRoundKeyRef = useRef(-1)

  const submitAnswer = useEightStreetStore((s) => s.submitAnswer)
  const phase = useEightStreetStore((s) => s.phase)
  const loopKey = useEightStreetStore((s) => s.loopKey)
  const roundKey = useEightStreetStore((s) => s.roundKey)
  const isAdvancing = useEightStreetStore((s) => s.isAdvancing)

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

    // Apply wrap handoff before movement / judging (same frame as loopKey bump).
    if (loopKey !== appliedLoopKeyRef.current) {
      appliedLoopKeyRef.current = loopKey
      const state = useEightStreetStore.getState()
      const handoff = state.handoff
      const spawnX = state.sessionSpawnX
      const landZ = state.sessionLandZ
      const startZ = state.sessionStartZ
      const spawnYaw = state.sessionSpawnYaw
      zonesRef.current = createJudgeZones()
      boostRef.current = 0
      stepTimerRef.current = 0
      armedRoundKeyRef.current = -1

      if (handoff === 'continue') {
        const lateralOffset = posRef.current.x - EIGHT_STREET.corner2X
        posRef.current.set(
          spawnX + lateralOffset,
          EIGHT_STREET.eyeHeight,
          landZ,
        )
        boostRef.current = 0.85
      } else if (handoff === 'restart') {
        posRef.current.set(spawnX, EIGHT_STREET.eyeHeight, landZ)
        yawRef.current = spawnYaw
        pitchRef.current = 0
        boostRef.current = 0.75
      } else {
        posRef.current.set(spawnX, EIGHT_STREET.eyeHeight, startZ)
        yawRef.current = spawnYaw
        pitchRef.current = 0
      }

      camera.position.copy(posRef.current)
      camera.quaternion.setFromEuler(new Euler(pitchRef.current, yawRef.current, 0, 'YXZ'))
    }

    // Arm judging only after the next cast is ready for this street.
    if (!isAdvancing && armedRoundKeyRef.current !== roundKey) {
      armedRoundKeyRef.current = roundKey
      zonesRef.current = createJudgeZones()
    }

    const ctrl = useEightStreetControlsStore.getState()
    const look = ctrl.consumeLookDelta()
    if (look.lookDeltaX !== 0 || look.lookDeltaY !== 0) {
      const sens = EIGHT_STREET.touchLookSensitivity
      yawRef.current -= look.lookDeltaX * sens
      pitchRef.current = Math.max(
        -EIGHT_STREET.pitchMaxDown,
        Math.min(
          EIGHT_STREET.pitchMaxUp,
          pitchRef.current - look.lookDeltaY * sens,
        ),
      )
    }

    let mx = 0
    let mz = 0

    // Mobile stick: ease camera to face stick direction, then walk mostly forward.
    const stickX = ctrl.moveX
    const stickZ = ctrl.moveY
    const stickLen = Math.hypot(stickX, stickZ)
    if (stickLen > EIGHT_STREET.stickFaceDeadzone) {
      const nx = stickX / stickLen
      const nz = stickZ / stickLen
      const targetYaw = yawRef.current - Math.atan2(nx, nz)
      const turnT = 1 - Math.exp(-EIGHT_STREET.stickFaceTurnSpeed * dt)
      yawRef.current += shortestAngleDelta(yawRef.current, targetYaw) * turnT
      mz += stickLen
    }

    const k = keysRef.current
    if (k.has('KeyA') || k.has('ArrowLeft')) mx -= 1
    if (k.has('KeyD') || k.has('ArrowRight')) mx += 1
    if (k.has('KeyW') || k.has('ArrowUp')) mz += 1
    if (k.has('KeyS') || k.has('ArrowDown')) mz -= 1

    if (boostRef.current > 0) { boostRef.current -= dt; if (mz >= 0) mz = Math.max(mz, 1) }

    const len = Math.hypot(mx, mz)
    if (len > 1) { mx /= len; mz /= len }

    const yaw = yawRef.current
    const sprinting = shiftRef.current || ctrl.sprint
    const speed = sprinting ? EIGHT_STREET.dashSpeed : EIGHT_STREET.moveSpeed
    const dx = (-Math.sin(yaw) * mz + Math.cos(yaw) * mx) * speed * dt
    const dz = (-Math.cos(yaw) * mz - Math.sin(yaw) * mx) * speed * dt

    const prevX = posRef.current.x
    const prevZ = posRef.current.z
    const clamped = clampToAlley(posRef.current.x + dx, posRef.current.z + dz)
    posRef.current.set(clamped.x, EIGHT_STREET.eyeHeight, clamped.z)

    const moved = Math.hypot(clamped.x - prevX, clamped.z - prevZ) > 1e-4
    if (!moved || isAdvancing) {
      stepTimerRef.current = 0
    } else {
      const interval = sprinting ? DASH_FOOTSTEP_INTERVAL_SEC : WALK_FOOTSTEP_INTERVAL_SEC
      stepTimerRef.current += dt
      if (stepTimerRef.current >= interval) {
        stepTimerRef.current -= interval
        playSfx('footstep')
      }
    }

    camera.position.copy(posRef.current)
    camera.quaternion.setFromEuler(new Euler(pitchRef.current, yawRef.current, 0, 'YXZ'))

    if (phase !== 'playing' || isAdvancing) return
    if (armedRoundKeyRef.current !== roundKey) return

    zonesRef.current = updateJudgeZones(posRef.current.x, posRef.current.z, zonesRef.current)
    // While entrance boost is active, ignore turn-back so wrap-ins do not re-trigger.
    const answer = tryResolveAnswer(posRef.current.x, posRef.current.z, zonesRef.current, {
      allowAnomaly: boostRef.current <= 0,
    })
    if (answer) submitAnswer(answer)
  })

  return null
}
