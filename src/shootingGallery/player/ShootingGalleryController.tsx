import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Camera, MathUtils, Object3D, Raycaster, Vector2, Vector3 } from 'three'
import { isTouchUiMode } from '../../game/perfConfig'
import { playSfx } from '../../ui/sfx'
import { SHOOTING_GALLERY, type TargetKind } from '../config'
import { useShootingControlsStore } from '../controlsStore'
import { useShootingGalleryStore } from '../store'
import { markTargetHit, shootingTargetsRuntime } from '../world/ShootingGalleryTargets'

const ndc = new Vector2()
const raycaster = new Raycaster()
const localHitPoint = new Vector3()

/**
 * PC / スマホ入力、照準、レイキャスト発砲、タイマー進行をまとめる。
 */
export function ShootingGalleryController() {
  const { camera, gl } = useThree()
  const lockedRef = useRef(false)
  const mouseDownFiredRef = useRef(false)
  const phase = useShootingGalleryStore((state) => state.phase)

  useEffect(() => {
    if (isTouchUiMode()) return

    const onMouseMove = (event: MouseEvent) => {
      const currentPhase = useShootingGalleryStore.getState().phase
      if (currentPhase !== 'playing' && currentPhase !== 'countdown') return
      if (lockedRef.current) {
        useShootingGalleryStore.getState().addAimDelta(
          event.movementX * SHOOTING_GALLERY.mouseAimSensitivity,
          -event.movementY * SHOOTING_GALLERY.mouseAimSensitivity,
        )
        return
      }
      const rect = gl.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      useShootingGalleryStore.getState().setAim(
        MathUtils.clamp(x, -SHOOTING_GALLERY.aimLimitX, SHOOTING_GALLERY.aimLimitX),
        MathUtils.clamp(y, -SHOOTING_GALLERY.aimLimitY, SHOOTING_GALLERY.aimLimitY),
      )
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      const currentPhase = useShootingGalleryStore.getState().phase
      if (currentPhase !== 'playing' && currentPhase !== 'countdown') return
      if (document.pointerLockElement !== gl.domElement) {
        void gl.domElement.requestPointerLock()
      }
      if (currentPhase !== 'playing') return
      if (mouseDownFiredRef.current) return
      mouseDownFiredRef.current = true
      attemptFire(camera)
    }

    const onPointerUp = (event: PointerEvent) => {
      if (event.button !== 0) return
      mouseDownFiredRef.current = false
    }

    const onPointerLockChange = () => {
      lockedRef.current = document.pointerLockElement === gl.domElement
    }

    window.addEventListener('mousemove', onMouseMove)
    gl.domElement.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointerlockchange', onPointerLockChange)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      gl.domElement.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      document.removeEventListener('pointerlockchange', onPointerLockChange)
      if (document.pointerLockElement === gl.domElement) document.exitPointerLock()
      lockedRef.current = false
    }
  }, [camera, gl])

  useEffect(() => {
    if (phase === 'playing' || phase === 'countdown') return
    if (document.pointerLockElement === gl.domElement) {
      document.exitPointerLock()
    }
    lockedRef.current = false
  }, [gl, phase])

  useFrame(() => {
    const store = useShootingGalleryStore.getState()
    const now = performance.now()

    if (store.phase === 'countdown') {
      store.tickCountdown(now)
      return
    }

    if (store.phase !== 'playing') return

    store.tickPlaying(now)
    store.pruneFloatingScores(now)

    if (isTouchUiMode()) {
      const controls = useShootingControlsStore.getState()
      if (controls.consumeFirePress()) {
        attemptFire(camera)
      }
    }

    const hit = raycastAim(camera)
    store.setAimOnTarget(Boolean(hit?.target.userData.alive))
  })

  return null
}

function raycastAim(camera: Camera) {
  // 照準は常に画面中央。aimX/Y はカメラの向きを動かすためだけに使う。
  ndc.set(0, 0)
  raycaster.setFromCamera(ndc, camera)
  const groups = [...shootingTargetsRuntime.groups.values()].filter(
    (group) => group.visible && group.userData.alive,
  )
  const hits = raycaster.intersectObjects(groups, true)
  for (const hit of hits) {
    let obj: Object3D | null = hit.object
    while (obj) {
      if (typeof obj.userData.targetId === 'number' && obj.userData.alive) {
        obj.worldToLocal(localHitPoint.copy(hit.point))
        return {
          target: obj,
          bullseye:
            Math.hypot(localHitPoint.x, localHitPoint.y) <=
            SHOOTING_GALLERY.bullseyeRadius,
        }
      }
      obj = obj.parent
    }
  }
  return null
}

function attemptFire(camera: Camera) {
  const store = useShootingGalleryStore.getState()
  if (!store.tryFire()) return

  playSfx('shootGalleryFire')
  const hit = raycastAim(camera)
  if (!hit) {
    store.registerMiss()
    return
  }

  const hitObj = hit.target
  const targetId = hitObj.userData.targetId as number
  const kind = hitObj.userData.kind as TargetKind
  const small = Boolean(hitObj.userData.small)
  const target = markTargetHit(targetId)
  if (!target) {
    store.registerMiss()
    return
  }

  store.registerHit(kind, small, hit.bullseye, {
    x: target.x,
    y: target.y,
    z: target.z,
  })

  if (kind === 'red') {
    playSfx('shootGalleryHitRed')
  } else if (kind === 'gold') {
    playSfx('shootGalleryHitGold')
  } else {
    playSfx('shootGalleryHit')
  }
}
