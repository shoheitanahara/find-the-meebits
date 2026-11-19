import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import {
  applyVRMAttentionPose,
  applyVRMLocomotion,
  getNpcWalkPhaseOffset,
} from '../../avatar/VRMLocomotion'
import { useVRMModel } from '../../avatar/useVRMModel'
import { preloadVrm } from '../../avatar/vrmInstancePool'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { getRunwayModelTraits } from '../dailyRunway'
import { RUNWAY } from '../config'
import { useRunwayStore } from '../store'

type WalkPhase = 'approach' | 'pause' | 'retreat'

/**
 * 本日トレイト一致の Meebit がランウェイを歩き、
 * 手前で一時停止 → 奥へ引き返して次のモデルへ。無限ループ。
 */
export function RunwayCatwalkShow() {
  const phase = useRunwayStore((state) => state.phase)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [showKey, setShowKey] = useState(0)

  useEffect(() => {
    if (phase !== 'playing') return

    const store = useRunwayStore.getState()
    const nextId = store.pickNextModelId()
    if (nextId == null) return
    store.pushRecentId(nextId)
    setShowKey(1)
    setActiveId(nextId)
    preloadVrm(nextId, -40)
    const preview = store.pickNextModelId()
    if (preview != null) preloadVrm(preview, -20)
  }, [phase])

  if (phase !== 'playing' || activeId == null) return null

  return (
    <CatwalkModel
      key={`${activeId}-${showKey}`}
      meebitNumber={activeId}
      onFinished={() => {
        const store = useRunwayStore.getState()
        store.setOnScreen(null)
        const nextId = store.pickNextModelId()
        if (nextId == null) return
        store.pushRecentId(nextId)
        setShowKey((key) => key + 1)
        setActiveId(nextId)
        preloadVrm(nextId, -40)
        const preview = store.pickNextModelId()
        if (preview != null) preloadVrm(preview, -20)
      }}
    />
  )
}

function CatwalkModel({
  meebitNumber,
  onFinished,
}: {
  meebitNumber: number
  onFinished: () => void
}) {
  const groupRef = useRef<Group>(null)
  const walkPhaseRef = useRef<WalkPhase>('approach')
  const pauseTimerRef = useRef(0)
  const localTimeRef = useRef(0)
  const finishedRef = useRef(false)
  const walkPhaseOffset = useMemo(() => getNpcWalkPhaseOffset(meebitNumber), [meebitNumber])
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 40, true, true)

  useEffect(() => {
    walkPhaseRef.current = 'approach'
    pauseTimerRef.current = 0
    finishedRef.current = false
    localTimeRef.current = 0
    const traits = getRunwayModelTraits(meebitNumber) ?? {}
    useRunwayStore.getState().setOnScreen({ meebitNumber, traits })
    if (groupRef.current) {
      groupRef.current.position.set(0, RUNWAY.runwayY + 0.02, RUNWAY.runwayStartZ)
      groupRef.current.rotation.y = 0
    }
  }, [meebitNumber])

  useFrame((_, delta) => {
    const group = groupRef.current
    if (!group || finishedRef.current) return

    const dt = Math.min(delta, 0.05)
    localTimeRef.current += dt
    const phase = walkPhaseRef.current
    let isMoving = false

    if (phase === 'approach') {
      isMoving = true
      group.position.z += RUNWAY.modelWalkSpeed * dt
      group.rotation.y = 0
      if (group.position.z >= RUNWAY.pauseZ) {
        group.position.z = RUNWAY.pauseZ
        walkPhaseRef.current = 'pause'
        pauseTimerRef.current = RUNWAY.pauseSeconds
      }
    } else if (phase === 'pause') {
      pauseTimerRef.current -= dt
      group.rotation.y = Math.sin(localTimeRef.current * 0.7) * 0.15
      if (pauseTimerRef.current <= 0) {
        group.rotation.y = Math.PI
        walkPhaseRef.current = 'retreat'
      }
    } else {
      isMoving = true
      group.rotation.y = Math.PI
      group.position.z -= RUNWAY.modelWalkSpeed * dt
      if (group.position.z <= RUNWAY.runwayStartZ) {
        group.position.z = RUNWAY.runwayStartZ
        finishedRef.current = true
        onFinished()
        return
      }
    }

    if (phase === 'pause') {
      applyVRMAttentionPose(vrmRef.current)
    } else {
      applyVRMLocomotion(vrmRef.current, {
        elapsedTime: localTimeRef.current,
        isMoving,
        idleOffset: meebitNumber * 0.01,
        walkPhaseOffset,
      })
    }
    update(dt)
  })

  return (
    <group
      ref={groupRef}
      position={[0, RUNWAY.runwayY + 0.02, RUNWAY.runwayStartZ]}
      rotation={[0, 0, 0]}
    >
      {vrmScene ? <primitive object={vrmScene} scale={VRM_WORLD_SCALE} /> : null}
    </group>
  )
}
