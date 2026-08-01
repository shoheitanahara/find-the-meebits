import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Camera, MathUtils, Object3D, Raycaster, Vector2 } from 'three'
import { isTouchUiMode } from '../../game/perfConfig'
import { playSfx } from '../../ui/sfx'
import { STARLIGHT_RUSH } from '../config'
import { useStarlightControlsStore } from '../controlsStore'
import { useStarlightRushStore } from '../store'
import { markStarHit, starlightStarsRuntime } from '../world/StarlightStars'

const ndc = new Vector2()
const raycaster = new Raycaster()

/** PC / スマホ入力、照準、レイキャスト発砲、タイマー進行。 */
export function StarlightRushController() {
  const { camera, gl } = useThree()
  const lockedRef = useRef(false)
  const mouseDownFiredRef = useRef(false)
  const phase = useStarlightRushStore((state) => state.phase)

  useEffect(() => {
    if (isTouchUiMode()) return

    const onMouseMove = (event: MouseEvent) => {
      const currentPhase = useStarlightRushStore.getState().phase
      if (currentPhase !== 'playing' && currentPhase !== 'countdown') return
      if (lockedRef.current) {
        useStarlightRushStore.getState().addAimDelta(
          event.movementX * STARLIGHT_RUSH.mouseAimSensitivity,
          -event.movementY * STARLIGHT_RUSH.mouseAimSensitivity,
        )
        return
      }
      const rect = gl.domElement.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const y = -(((event.clientY - rect.top) / rect.height) * 2 - 1)
      useStarlightRushStore.getState().setAim(
        MathUtils.clamp(x, -STARLIGHT_RUSH.aimLimitX, STARLIGHT_RUSH.aimLimitX),
        MathUtils.clamp(y, -STARLIGHT_RUSH.aimLimitY, STARLIGHT_RUSH.aimLimitY),
      )
    }

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      const currentPhase = useStarlightRushStore.getState().phase
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
    const store = useStarlightRushStore.getState()
    const now = performance.now()

    if (store.phase === 'countdown') {
      store.tickCountdown(now)
      return
    }

    if (store.phase === 'docking') {
      store.tickDocking(now)
      return
    }

    if (store.phase !== 'playing') return

    store.tickPlaying(now)
    store.pruneFloatingScores(now)

    if (isTouchUiMode()) {
      const controls = useStarlightControlsStore.getState()
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
  ndc.set(0, 0)
  raycaster.setFromCamera(ndc, camera)
  const groups = [...starlightStarsRuntime.groups.values()].filter(
    (group) => group.visible && group.userData.alive,
  )
  const hits = raycaster.intersectObjects(groups, true)
  for (const hit of hits) {
    let obj: Object3D | null = hit.object
    while (obj) {
      if (typeof obj.userData.starId === 'number' && obj.userData.alive) {
        return { target: obj }
      }
      obj = obj.parent
    }
  }
  return null
}

function attemptFire(camera: Camera) {
  const store = useStarlightRushStore.getState()
  if (!store.tryFire()) return

  playSfx('shootGalleryFire')
  const hit = raycastAim(camera)
  if (!hit) {
    store.registerMiss()
    return
  }

  const starId = hit.target.userData.starId as number
  const star = markStarHit(starId)
  if (!star) {
    store.registerMiss()
    return
  }

  store.registerHit(star.kindIndex, { x: star.x, y: star.y, z: star.z })
  const kindScore = STARLIGHT_RUSH.starKinds[star.kindIndex]?.score ?? 100
  playSfx(kindScore >= 500 ? 'shootGalleryHitGold' : 'shootGalleryHit')
}
