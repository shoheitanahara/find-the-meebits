import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Group } from 'three'
import { FallbackMeebit } from './FallbackMeebit'
import { applyVRMLocomotion } from './VRMLocomotion'
import { useVRMModel } from './useVRMModel'
import { useGameStore } from '../stores/gameStore'
import { VRM_WORLD_SCALE } from '../game/gameConfig'
import { usePlayerStore } from '../stores/playerStore'
import { savePlayerPosition } from '../systems/save/localStorage'

let positionSaveTimer = 0

export function PlayerAvatar() {
  const rootRef = useRef<Group>(null)
  const meebitNumber = usePlayerStore((state) => state.meebitNumber)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const shouldLoadPlayerVrm =
    gamePhase === 'intro' ||
    gamePhase === 'preparing' ||
    gamePhase === 'playing' ||
    gamePhase === 'timedOut'
  const { vrmRef, vrmScene, status, update } = useVRMModel(
    meebitNumber,
    shouldLoadPlayerVrm,
    -100,
    true,
    true,
  )
  const setPlayerModelLoading = useGameStore((state) => state.setPlayerModelLoading)
  const setPlayerModelReady = useGameStore((state) => state.setPlayerModelReady)
  const setPlayerModelError = useGameStore((state) => state.setPlayerModelError)

  useEffect(() => {
    if (!shouldLoadPlayerVrm) {
      return
    }

    if (status === 'loading') setPlayerModelLoading()
    if (status === 'ready') setPlayerModelReady()
    if (status === 'error') setPlayerModelError('Could not load this Meebit model.')
  }, [
    setPlayerModelError,
    setPlayerModelLoading,
    setPlayerModelReady,
    shouldLoadPlayerVrm,
    status,
  ])

  useFrame((state, delta) => {
    const root = rootRef.current
    const { isMoving, isRunning, position, rotationY } = usePlayerStore.getState()

    if (root) {
      root.position.set(position[0], position[1], position[2])
      root.rotation.y = rotationY
      root.position.y += isMoving ? Math.abs(Math.sin(state.clock.elapsedTime * 10.5)) * 0.025 : 0
    }

    if (shouldLoadPlayerVrm) {
      applyVRMLocomotion(vrmRef.current, {
        elapsedTime: state.clock.elapsedTime,
        isMoving,
        isRunning,
      })
      update(delta)
    }

    if (gamePhase === 'playing') {
      positionSaveTimer += delta
      if (positionSaveTimer >= 2) {
        positionSaveTimer = 0
        savePlayerPosition(position)
      }
    }
  })

  return (
    <group ref={rootRef}>
      {vrmScene ? <primitive object={vrmScene} scale={VRM_WORLD_SCALE} /> : null}
      {status === 'error' ? <FallbackMeebit /> : null}
    </group>
  )
}
