import { useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Group } from 'three'
import { MeebitSilhouette } from './MeebitSilhouette'
import { applyVRMLocomotion } from './VRMLocomotion'
import { applyHeadTurn, createHeadTurn, headYawToward, resetHeadTurn } from './headTurn'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { useNpcStore } from '../stores/npcStore'
import { getPlayerWorldState } from './playerWorldState'
import { useVRMModel } from './useVRMModel'
import { useGameStore } from '../stores/gameStore'
import { VRM_WORLD_SCALE } from '../game/gameConfig'
import { PLAYER_VRM_LOAD_PRIORITY } from '../game/perfConfig'
import { usePlayerStore } from '../stores/playerStore'
import { savePlayerPosition } from '../systems/save/localStorage'

let positionSaveTimer = 0

export function PlayerAvatar() {
  const rootRef = useRef<Group>(null)
  const meebitNumber = usePlayerStore((state) => state.meebitNumber)
  const gamePhase = useGameStore((state) => state.gamePhase)
  const venueId = useGameStore((state) => state.venueId)
  const npcLayoutVersion = useGameStore((state) => state.npcLayoutVersion)
  const shouldLoadPlayerVrm =
    gamePhase === 'intro' ||
    gamePhase === 'preparing' ||
    gamePhase === 'playing' ||
    gamePhase === 'timedOut'
  const { vrmRef, vrmScene, status, update } = useVRMModel(
    meebitNumber,
    shouldLoadPlayerVrm,
    PLAYER_VRM_LOAD_PRIORITY,
    true,
    true,
  )
  const headTurnRef = useRef(createHeadTurn())
  const setPlayerModelLoading = useGameStore((state) => state.setPlayerModelLoading)
  const setPlayerModelReady = useGameStore((state) => state.setPlayerModelReady)
  const setPlayerModelError = useGameStore((state) => state.setPlayerModelError)

  useEffect(() => {
    if (!shouldLoadPlayerVrm) {
      return
    }

    if (status === 'loading') {
      setPlayerModelLoading()
      return
    }

    if (status === 'ready') {
      setPlayerModelReady()
      return
    }

    if (status === 'error') {
      setPlayerModelError('Could not load this Meebit model.')
    }
  }, [
    npcLayoutVersion,
    setPlayerModelError,
    setPlayerModelLoading,
    setPlayerModelReady,
    shouldLoadPlayerVrm,
    status,
    venueId,
  ])

  useFrame((state, delta) => {
    const root = rootRef.current
    const world = getPlayerWorldState()
    if (shouldLoadPlayerVrm) resetHeadTurn(vrmRef.current, headTurnRef.current)

    if (root) {
      root.position.set(world.x, world.y, world.z)
      root.rotation.y = world.rotationY
      root.position.y += world.isMoving ? Math.abs(Math.sin(state.clock.elapsedTime * 10.5)) * 0.025 : 0
    }

    if (shouldLoadPlayerVrm) {
      applyVRMLocomotion(vrmRef.current, {
        elapsedTime: state.clock.elapsedTime,
        isMoving: world.isMoving,
        isRunning: world.isRunning,
      })
      // 会話中は、顔だけを相手の NPC へ向ける（左右 30° まで）
      const talking = useDialogueStore.getState()
      const talkPosition =
        talking.isOpen && talking.activeNpcId ? useNpcStore.getState().npcPositions[talking.activeNpcId] : undefined
      const headTarget = talkPosition
        ? headYawToward(world.x, world.z, world.rotationY, talkPosition[0], talkPosition[2])
        : 0
      applyHeadTurn(vrmRef.current, headTurnRef.current, headTarget, Math.min(delta, 0.05))
      update(delta)
    }

    if (gamePhase === 'playing') {
      positionSaveTimer += delta
      if (positionSaveTimer >= 2) {
        positionSaveTimer = 0
        savePlayerPosition([world.x, world.y, world.z])
      }
    }
  })

  return (
    <group ref={rootRef}>
      {vrmScene ? <primitive object={vrmScene} scale={VRM_WORLD_SCALE} /> : <MeebitSilhouette />}
    </group>
  )
}
