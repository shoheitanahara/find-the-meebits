import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { MeebitSilhouette } from '../avatar/MeebitSilhouette'
import { applyVRMAttentionPose } from '../avatar/VRMLocomotion'
import { useVRMModel } from '../avatar/useVRMModel'
import { TARGET_PREVIEW_CAPTURE_VRM_PRIORITY } from '../game/perfConfig'
import {
  completeTargetPreviewCapture,
  failTargetPreviewCapture,
  registerTargetPreviewCaptureProcessor,
} from './targetPreviewCache'
import { TARGET_PREVIEW_CAPTURE } from './targetPreviewCaptureConfig'

const {
  size: CAPTURE_SIZE,
  modelScale: MODEL_SCALE,
  modelYOffset: MODEL_Y_OFFSET,
  cameraPosition: CAMERA_POSITION,
  cameraLookAt: CAMERA_LOOK_AT,
  keyLightPosition: KEY_LIGHT_POSITION,
  background: CAPTURE_BACKGROUND,
  fov: CAPTURE_FOV,
} = TARGET_PREVIEW_CAPTURE

const cameraPosition = new Vector3(...CAMERA_POSITION)
const cameraLookAt = new Vector3(...CAMERA_LOOK_AT)

export function TargetPreviewCapture() {
  const [activeMeebit, setActiveMeebit] = useState<number | null>(null)

  useEffect(() => {
    registerTargetPreviewCaptureProcessor((meebitNumber) => {
      setActiveMeebit(meebitNumber)
    })

    return () => {
      registerTargetPreviewCaptureProcessor(null)
    }
  }, [])

  if (activeMeebit === null) {
    return null
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed opacity-0"
      style={{ left: -CAPTURE_SIZE * 2, top: 0, width: CAPTURE_SIZE, height: CAPTURE_SIZE }}
    >
      <Canvas
        key={activeMeebit}
        frameloop="demand"
        dpr={1}
        camera={{ fov: CAPTURE_FOV, near: 0.1, far: 20 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        style={{ width: CAPTURE_SIZE, height: CAPTURE_SIZE }}
        onCreated={({ gl, camera }) => {
          gl.setSize(CAPTURE_SIZE, CAPTURE_SIZE, false)
          camera.position.copy(cameraPosition)
          camera.lookAt(cameraLookAt)
          camera.updateProjectionMatrix()
        }}
      >
        <color attach="background" args={[CAPTURE_BACKGROUND]} />
        <ambientLight intensity={1.4} />
        <directionalLight position={[...KEY_LIGHT_POSITION]} intensity={1.8} />
        <CaptureCamera />
        <CaptureScene
          meebitNumber={activeMeebit}
          onCaptured={(dataUrl) => {
            completeTargetPreviewCapture(activeMeebit, dataUrl)
          }}
          onFailed={() => {
            failTargetPreviewCapture(activeMeebit)
          }}
        />
      </Canvas>
    </div>
  )
}

function CaptureCamera() {
  const camera = useThree((state) => state.camera)

  useLayoutEffect(() => {
    camera.position.copy(cameraPosition)
    camera.lookAt(cameraLookAt)
    camera.updateProjectionMatrix()
  }, [camera])

  return null
}

function CaptureScene({
  meebitNumber,
  onCaptured,
  onFailed,
}: {
  meebitNumber: number
  onCaptured: (dataUrl: string) => void
  onFailed: () => void
}) {
  const { gl, invalidate } = useThree()
  const { vrmRef, vrmScene, status } = useVRMModel(
    meebitNumber,
    true,
    TARGET_PREVIEW_CAPTURE_VRM_PRIORITY,
    true,
    true,
  )
  const hasFinishedRef = useRef(false)

  useEffect(() => {
    hasFinishedRef.current = false
  }, [meebitNumber])

  useEffect(() => {
    if (status === 'error') {
      onFailed()
    }
  }, [onFailed, status])

  useFrame(() => {
    if (hasFinishedRef.current || status !== 'ready' || !vrmRef.current) {
      return
    }

    applyVRMAttentionPose(vrmRef.current)
    vrmRef.current.update(0)
    invalidate()
    hasFinishedRef.current = true

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        onCaptured(gl.domElement.toDataURL('image/png'))
      })
    })
  })

  return (
    <group position={[0, MODEL_Y_OFFSET, 0]}>
      {vrmScene ? <primitive object={vrmScene} scale={MODEL_SCALE} /> : <MeebitSilhouette scale={0.57} />}
    </group>
  )
}
