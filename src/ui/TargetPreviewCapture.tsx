import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Vector3 } from 'three'
import { FallbackMeebit } from '../avatar/FallbackMeebit'
import { applyVRMAttentionPose } from '../avatar/VRMLocomotion'
import { useVRMModel } from '../avatar/useVRMModel'
import {
  completeTargetPreviewCapture,
  failTargetPreviewCapture,
  registerTargetPreviewCaptureProcessor,
} from './targetPreviewCache'

const CAPTURE_SIZE = 320
const MODEL_SCALE = 1.15
const MODEL_Y_OFFSET = -0.92
/** キャラの左斜前（-X, +Z）から見下ろす */
const CAMERA_POSITION = new Vector3(-1.45, 1.28, 4.25)
const CAMERA_LOOK_AT = new Vector3(0, 0.28, 0)
const KEY_LIGHT_POSITION: [number, number, number] = [-2.5, 4.5, 2.8]

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
        camera={{ fov: 31, near: 0.1, far: 20 }}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        style={{ width: CAPTURE_SIZE, height: CAPTURE_SIZE }}
        onCreated={({ gl, camera }) => {
          gl.setSize(CAPTURE_SIZE, CAPTURE_SIZE, false)
          camera.position.copy(CAMERA_POSITION)
          camera.lookAt(CAMERA_LOOK_AT)
          camera.updateProjectionMatrix()
        }}
      >
        <color attach="background" args={['#f5f5f5']} />
        <ambientLight intensity={1.4} />
        <directionalLight position={KEY_LIGHT_POSITION} intensity={1.8} />
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
    camera.position.copy(CAMERA_POSITION)
    camera.lookAt(CAMERA_LOOK_AT)
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
  const { vrmRef, vrmScene, status } = useVRMModel(meebitNumber, true, -250, true, true)
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
      {vrmScene ? <primitive object={vrmScene} scale={MODEL_SCALE} /> : null}
      {status === 'error' ? <FallbackMeebit /> : null}
    </group>
  )
}
