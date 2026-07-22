import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Group, Vector3 } from 'three'
import { applyVRMLocomotion } from '../../avatar/VRMLocomotion'
import { useKeyboardControls } from '../../avatar/useKeyboardControls'
import { useVRMModel } from '../../avatar/useVRMModel'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { usePlayerStore } from '../../stores/playerStore'
import { useTopStore } from '../../top/topStore'
import { MOUNTAIN } from '../config'
import { isAtGoal, resolveHorizontal, resolveVertical, type PlayerBody } from '../collisions'
import { useMountainControlsStore } from '../controlsStore'
import { useMountainStore } from '../store'

const cameraPos = new Vector3()
const cameraTarget = new Vector3()

export function ClimbController({ enabled }: { enabled: boolean }) {
  const groupRef = useRef<Group>(null)
  // Park と同じ Meebit を優先（なければ playerStore / ローカルセーブ）
  const topMeebit = useTopStore((state) => state.meebitNumber)
  const playerMeebit = usePlayerStore((state) => state.meebitNumber)
  const meebitNumber = topMeebit || playerMeebit
  const bodyRef = useRef<PlayerBody>({
    x: MOUNTAIN.start.x,
    y: MOUNTAIN.start.y,
    z: MOUNTAIN.start.z,
    vx: 0,
    vy: 0,
    vz: 0,
    onGround: true,
  })
  const facingYRef = useRef(Math.PI) // 見た目の向きのみ（カメラには使わない）
  const keys = useKeyboardControls()
  const jumpLatchRef = useRef(false)
  const localTimeRef = useRef(0)
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 0, true, true)

  useEffect(() => {
    if (!enabled) return
    const body = bodyRef.current
    body.x = MOUNTAIN.start.x
    body.y = MOUNTAIN.start.y
    body.z = MOUNTAIN.start.z
    body.vx = 0
    body.vy = 0
    body.vz = 0
    body.onGround = true
    facingYRef.current = Math.PI
    if (groupRef.current) {
      groupRef.current.position.set(body.x, body.y, body.z)
      groupRef.current.rotation.y = facingYRef.current
    }
  }, [enabled])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    localTimeRef.current += dt
    useMountainStore.getState().tickElapsed(dt)

    if (!enabled) return

    const body = bodyRef.current
    const controls = useMountainControlsStore.getState()
    const keyboard = keys.current

    // ワールド固定軸: W = -Z（山頂方向）, A/D = X
    let inputX = 0
    let inputZ = 0
    if (keyboard.left) inputX -= 1
    if (keyboard.right) inputX += 1
    if (keyboard.forward) inputZ -= 1
    if (keyboard.backward) inputZ += 1

    if (controls.joystickActive) {
      inputX = controls.joystickX
      inputZ = -controls.joystickY
    }

    const inputLen = Math.hypot(inputX, inputZ)
    if (inputLen > 1) {
      inputX /= inputLen
      inputZ /= inputLen
    }

    const dashFromStick =
      controls.joystickActive && controls.joystickMagnitude >= MOUNTAIN.dashOuterThreshold
    const dashing = keyboard.run || controls.dashHeld || dashFromStick
    const speed = MOUNTAIN.moveSpeed * (dashing ? MOUNTAIN.dashMultiplier : 1)
    const moving = inputLen > 0.08

    body.vx = inputX * speed
    body.vz = inputZ * speed

    // アバターの向きだけ更新（カメラは固定）
    if (moving) {
      facingYRef.current = Math.atan2(inputX, inputZ)
    }

    const wantJump = controls.jumpPressed || controls.consumeJumpPress()
    if (wantJump && body.onGround && !jumpLatchRef.current) {
      body.vy = MOUNTAIN.jumpSpeed
      body.onGround = false
      jumpLatchRef.current = true
      useMountainControlsStore.getState().setJumpPressed(false)
    }
    if (!controls.jumpPressed) {
      jumpLatchRef.current = false
    }

    body.x += body.vx * dt
    body.z += body.vz * dt
    resolveHorizontal(body)
    resolveVertical(body, dt)

    useMountainStore.getState().reportHeight(body.y)

    if (isAtGoal(body) && useMountainStore.getState().phase === 'playing') {
      useMountainStore.getState().clear()
    }

    const group = groupRef.current
    if (group) {
      group.position.set(body.x, body.y, body.z)
      group.rotation.y = facingYRef.current
    }

    applyVRMLocomotion(vrmRef.current, {
      elapsedTime: localTimeRef.current,
      isMoving: moving && body.onGround,
      isRunning: dashing && moving && body.onGround,
      isAirborne: !body.onGround,
      verticalVelocity: body.vy,
      idleOffset: 0.15,
      walkPhaseOffset: 0.2,
    })
    update(dt)

    // 固定視点: 後方から前方。蛇行に合わせて X を強く追従
    const fx = MOUNTAIN.camXFollow
    cameraPos.set(body.x * fx, body.y + MOUNTAIN.camHeight, body.z + MOUNTAIN.camBack)
    cameraTarget.set(body.x * (fx * 0.85), body.y + 1.4, body.z - MOUNTAIN.camLookAhead)
    state.camera.position.lerp(cameraPos, 1 - Math.exp(-dt * 5))
    state.camera.lookAt(cameraTarget)
  })

  return (
    <group ref={groupRef} position={[MOUNTAIN.start.x, MOUNTAIN.start.y, MOUNTAIN.start.z]}>
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <group position={[0, 0.05, 0]}>
          <MeebitSilhouette />
        </group>
      )}
    </group>
  )
}

/** Space = ジャンプ（Shift ダッシュは useKeyboardControls の run） */
export function useMountainKeyboardBridge() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        useMountainControlsStore.getState().setJumpPressed(true)
      }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        useMountainControlsStore.getState().setJumpPressed(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])
}
