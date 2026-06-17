import { useEffect, useRef, useState } from 'react'
import { Group } from 'three'
import type { VRM } from '@pixiv/three-vrm'
import { VRMUtils } from '@pixiv/three-vrm'
import { acquireVrmInstance, releaseVrmInstance } from './vrmInstancePool'
import { getMeebitVrmUrl, loadVRM } from './VRMLoader'
import { enqueueVrmLoad } from './vrmLoadQueue'
import type { LoadingStatus } from '../types/game'

export function useVRMModel(
  meebitId: number,
  enabled = true,
  loadPriority = 9999,
  needsAnimation = true,
  exclusive = false,
) {
  const vrmRef = useRef<VRM | null>(null)
  const loadGenerationRef = useRef(0)
  const [vrmScene, setVrmScene] = useState<Group | null>(null)
  const [status, setStatus] = useState<LoadingStatus>('idle')

  useEffect(() => {
    let isMounted = true
    const generation = ++loadGenerationRef.current
    let activeInstance: { vrm: VRM; scene: Group; isPrimary: boolean } | null = null
    let exclusiveVrm: VRM | null = null

    const disposeActive = () => {
      if (exclusiveVrm) {
        VRMUtils.deepDispose(exclusiveVrm.scene)
        exclusiveVrm = null
      }

      if (activeInstance) {
        releaseVrmInstance(meebitId, activeInstance)
        activeInstance = null
      }

      vrmRef.current = null
    }

    if (!enabled) {
      disposeActive()
      setVrmScene(null)
      setStatus('idle')
      return () => {
        isMounted = false
        loadGenerationRef.current += 1
        disposeActive()
      }
    }

    disposeActive()
    setVrmScene(null)
    setStatus('loading')

    const loadPromise = exclusive
      ? enqueueVrmLoad(() => loadVRM(getMeebitVrmUrl(meebitId)), loadPriority)
      : acquireVrmInstance(meebitId, loadPriority, needsAnimation)

    loadPromise
      .then((result) => {
        if (!isMounted || generation !== loadGenerationRef.current) {
          if (exclusive) {
            VRMUtils.deepDispose((result as VRM).scene)
          } else {
            releaseVrmInstance(meebitId, result as { vrm: VRM; scene: Group; isPrimary: boolean })
          }
          return
        }

        if (exclusive) {
          exclusiveVrm = result as VRM
          vrmRef.current = exclusiveVrm
          setVrmScene(exclusiveVrm.scene)
        } else {
          activeInstance = result as { vrm: VRM; scene: Group; isPrimary: boolean }
          vrmRef.current = activeInstance.vrm
          setVrmScene(activeInstance.scene)
        }

        setStatus('ready')
      })
      .catch(() => {
        if (isMounted && generation === loadGenerationRef.current) {
          setVrmScene(null)
          setStatus('error')
        }
      })

    return () => {
      isMounted = false
      loadGenerationRef.current += 1
      disposeActive()
      setVrmScene(null)
    }
  }, [enabled, exclusive, loadPriority, meebitId, needsAnimation])

  const update = (delta: number) => {
    vrmRef.current?.update(delta)
  }

  return { vrmRef, vrmScene, status, update }
}
