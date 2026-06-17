import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { getNpcById } from '../npc/npcData'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { useNpcStore } from '../stores/npcStore'
import { usePlayerStore } from '../stores/playerStore'

const cameraOffset = new Vector3(0, 6.5, 10)
const desiredPosition = new Vector3()
const lookAtTarget = new Vector3()
const playerPosition = new Vector3()
const npcPosition = new Vector3()
const midpoint = new Vector3()
const dialogueDirection = new Vector3()
const dialogueSide = new Vector3()
const dialogueCameraDirection = new Vector3()
const lookAtOffset = new Vector3(0, 1.4, 0)
const dialogueCameraHeight = new Vector3(0, 2.35, 0)
const dialogueLookAtHeight = new Vector3(0, 1.55, 0)

export function FollowCamera() {
  useFrame(({ camera }, delta) => {
    const { position } = usePlayerStore.getState()
    const dialogue = useDialogueStore.getState()

    playerPosition.set(position[0], position[1], position[2])

    if (dialogue.isOpen && dialogue.activeNpcId) {
      const npc = getNpcById(dialogue.activeNpcId)
      const liveNpcPosition = useNpcStore.getState().npcPositions[dialogue.activeNpcId] ?? npc?.position

      if (liveNpcPosition) {
        npcPosition.set(liveNpcPosition[0], liveNpcPosition[1], liveNpcPosition[2])
        midpoint.copy(playerPosition).add(npcPosition).multiplyScalar(0.5)
        dialogueDirection.copy(playerPosition).sub(npcPosition)

        if (dialogueDirection.lengthSq() < 0.001) {
          dialogueDirection.set(0, 0, 1)
        }

        dialogueDirection.normalize()
        dialogueSide.set(-dialogueDirection.z, 0, dialogueDirection.x).normalize()
        dialogueCameraDirection
          .copy(dialogueSide)
          .multiplyScalar(0.72)
          .addScaledVector(dialogueDirection, 0.48)
          .normalize()
        desiredPosition.copy(midpoint).addScaledVector(dialogueCameraDirection, 4.6).add(dialogueCameraHeight)
        lookAtTarget.copy(midpoint).add(dialogueLookAtHeight)

        camera.position.lerp(desiredPosition, 1 - Math.exp(-delta * 8))
        camera.lookAt(lookAtTarget)
        return
      }
    }

    desiredPosition.copy(playerPosition).add(cameraOffset)
    lookAtTarget.copy(playerPosition).add(lookAtOffset)

    camera.position.lerp(desiredPosition, 1 - Math.exp(-delta * 5))
    camera.lookAt(lookAtTarget)
  })

  return null
}
