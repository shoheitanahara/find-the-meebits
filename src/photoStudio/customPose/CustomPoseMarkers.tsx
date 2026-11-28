import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import { STUDIO_CAPTURE_HIDDEN } from '../capture/studioGlBridge'
import { PHOTO_STUDIO } from '../config'
import { usePhotoStudioStore } from '../store'
import { CUSTOM_POSE_JOINTS } from './customPoseModel'
import { getCustomPoseMarkerWorld, updateCustomPoseMarkerPositions } from './customPoseRuntime'

const { markers } = PHOTO_STUDIO.customPose

/**
 * カスタム編集中だけ出す関節マーカー（タップで選択）。
 * 体に隠れないよう depthTest なしで最前面。撮影画像には写さない。
 */
export function CustomPoseMarkers() {
  const poseId = usePhotoStudioStore((state) => state.poseId)
  const selectedId = usePhotoStudioStore((state) => state.customPoseJointId)
  const groupRefs = useRef<(Group | null)[]>([])
  const coreRefs = useRef<(Mesh | null)[]>([])
  const isCustom = poseId === 'custom'

  useFrame(() => {
    if (!isCustom) return
    const ready = updateCustomPoseMarkerPositions()
    CUSTOM_POSE_JOINTS.forEach((joint, index) => {
      const group = groupRefs.current[index]
      if (!group) return
      const world = getCustomPoseMarkerWorld(joint.id)
      group.visible = ready && world !== null
      if (world) group.position.copy(world)
      const selected = joint.id === selectedId
      group.scale.setScalar(selected ? markers.selectedScale : 1)
      const core = coreRefs.current[index]
      if (core) {
        ;(core.material as MeshBasicMaterial).color.set(
          selected ? markers.selectedColor : markers.color,
        )
      }
    })
  })

  if (!isCustom) return null

  return (
    <group userData={{ [STUDIO_CAPTURE_HIDDEN]: true }}>
      {CUSTOM_POSE_JOINTS.map((joint, index) => (
        <group
          key={joint.id}
          ref={(node) => {
            groupRefs.current[index] = node
          }}
          visible={false}
        >
          {/* 縁取り */}
          <mesh renderOrder={1000}>
            <sphereGeometry args={[markers.radius * 1.45, 16, 12]} />
            <meshBasicMaterial
              color={markers.outlineColor}
              transparent
              opacity={0.55}
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          <mesh
            ref={(node) => {
              coreRefs.current[index] = node
            }}
            renderOrder={1001}
          >
            <sphereGeometry args={[markers.radius, 16, 12]} />
            {/* 縁取り（transparent）より後に描くため、こちらも transparent キューに入れる */}
            <meshBasicMaterial
              color={markers.color}
              transparent
              depthTest={false}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
