import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { Group } from 'three'
import { FallbackMeebit } from '../avatar/FallbackMeebit'
import { applyVRMAttentionPose } from '../avatar/VRMLocomotion'
import { useVRMModel } from '../avatar/useVRMModel'

type TargetPreviewProps = {
  meebitNumber: number
  sizeClassName?: string
  modelScale?: number
  cameraDistance?: number
  modelYOffset?: number
}

export function TargetPreview({
  meebitNumber,
  sizeClassName = 'h-44 w-44',
  modelScale = 1.15,
  cameraDistance = 4,
  modelYOffset = -0.9,
}: TargetPreviewProps) {
  return (
    <div
      className={`${sizeClassName} overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100`}
    >
      <Canvas camera={{ position: [0, 1.6, cameraDistance], fov: 30 }} gl={{ antialias: true }}>
        <color attach="background" args={['#f5f5f5']} />
        <ambientLight intensity={1.4} />
        <directionalLight position={[3, 4, 3]} intensity={1.8} />
        <PreviewModel
          meebitNumber={meebitNumber}
          modelScale={modelScale}
          modelYOffset={modelYOffset}
        />
      </Canvas>
    </div>
  )
}

function PreviewModel({
  meebitNumber,
  modelScale = 1.15,
  modelYOffset = -0.9,
}: {
  meebitNumber: number
  modelScale?: number
  modelYOffset?: number
}) {
  const rootRef = useRef<Group>(null)
  const { vrmRef, vrmScene, status, update } = useVRMModel(
    meebitNumber,
    true,
    -250,
    true,
    true,
  )

  useFrame((state, delta) => {
    if (rootRef.current) {
      rootRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.25
    }

    applyVRMAttentionPose(vrmRef.current)
    update(delta)
  })

  return (
    <group ref={rootRef} position={[0, modelYOffset, 0]} rotation={[0, Math.PI, 0]}>
      {vrmScene ? <primitive object={vrmScene} scale={modelScale} /> : null}
      {status === 'error' ? <FallbackMeebit /> : null}
    </group>
  )
}
