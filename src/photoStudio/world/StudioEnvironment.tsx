import { Environment, PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { MathUtils, PerspectiveCamera as ThreePerspectiveCamera, Vector3 } from 'three'
import { getBackground, getCameraSetup, PHOTO_STUDIO } from '../config'
import { usePhotoStudioStore } from '../store'

const cameraPos = new Vector3()
const lookAt = new Vector3()

/** 明るさスライダー → 露出のみ。ライト比は固定。 */
function StudioExposure() {
  useFrame(({ gl }) => {
    gl.toneMappingExposure = usePhotoStudioStore.getState().brightness
  })
  return null
}

/** キーの実シャドウだけ受け取る透明床。 */
function StudioShadowCatcher() {
  const { castShadow } = PHOTO_STUDIO.lighting
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, castShadow.planeY, 0]}
      receiveShadow
      renderOrder={-1}
    >
      <planeGeometry args={[castShadow.planeSize, castShadow.planeSize]} />
      <shadowMaterial transparent opacity={castShadow.opacity} depthWrite={false} />
    </mesh>
  )
}

/**
 * 単色背景 + はっきりしたキー方向の実シャドウ。
 * SoftShadows は使わない（アバターが消える）。
 */
export function StudioEnvironment() {
  const backgroundId = usePhotoStudioStore((state) => state.backgroundId)
  const bg = getBackground(backgroundId)
  const { lighting } = PHOTO_STUDIO
  const { castShadow } = lighting
  const extent = castShadow.camExtent

  return (
    <>
      <color attach="background" args={[bg.color]} />
      <StudioExposure />

      <Environment
        preset={lighting.environmentPreset}
        environmentIntensity={lighting.environmentIntensity}
        background={false}
      />

      <ambientLight intensity={lighting.ambient} color={lighting.ambientColor} />
      <hemisphereLight
        args={[lighting.hemisphere.sky, lighting.hemisphere.ground, lighting.hemisphere.intensity]}
      />

      <directionalLight
        castShadow
        position={[...lighting.key.position]}
        intensity={lighting.key.intensity}
        color={lighting.key.color}
        shadow-mapSize={[castShadow.mapSize, castShadow.mapSize]}
        shadow-bias={castShadow.bias}
        shadow-normalBias={castShadow.normalBias}
        shadow-camera-near={castShadow.camNear}
        shadow-camera-far={castShadow.camFar}
        shadow-camera-left={-extent}
        shadow-camera-right={extent}
        shadow-camera-top={extent}
        shadow-camera-bottom={-extent}
      >
        <object3D attach="target" position={[0, 0.2, 0]} />
      </directionalLight>
      <directionalLight
        position={[...lighting.fill.position]}
        intensity={lighting.fill.intensity}
        color={lighting.fill.color}
      />
      <directionalLight
        position={[...lighting.top.position]}
        intensity={lighting.top.intensity}
        color={lighting.top.color}
      />
      <directionalLight
        position={[...lighting.rim.position]}
        intensity={lighting.rim.intensity}
        color={lighting.rim.color}
      />

      <StudioShadowCatcher />
    </>
  )
}

/** 構図 × カメラ角度に合わせてカメラを補間。 */
export function StudioCamera() {
  const framingId = usePhotoStudioStore((state) => state.framingId)
  const cameraAngleId = usePhotoStudioStore((state) => state.cameraAngleId)
  const setup = getCameraSetup(framingId, cameraAngleId)

  return (
    <PerspectiveCamera makeDefault fov={setup.fov} near={0.1} far={40} position={[...setup.cameraPosition]}>
      <StudioCameraRig />
    </PerspectiveCamera>
  )
}

function StudioCameraRig() {
  const framingId = usePhotoStudioStore((state) => state.framingId)
  const cameraAngleId = usePhotoStudioStore((state) => state.cameraAngleId)

  useFrame(({ camera }, delta) => {
    if (!(camera instanceof ThreePerspectiveCamera)) return
    const state = usePhotoStudioStore.getState()
    const setup = getCameraSetup(state.framingId, state.cameraAngleId)
    const dt = Math.min(delta, 0.05)
    const t = 1 - Math.exp(-dt * 8)
    const [px, py, pz] = setup.cameraPosition
    const [lx, ly, lz] = setup.cameraLookAt
    cameraPos.set(px, py, pz)
    lookAt.set(lx, ly, lz)
    camera.position.lerp(cameraPos, t)
    camera.fov = MathUtils.lerp(camera.fov, setup.fov, t)
    camera.lookAt(lookAt)
    camera.updateProjectionMatrix()
  })

  void framingId
  void cameraAngleId
  return null
}
