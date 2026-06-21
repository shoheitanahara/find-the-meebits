import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { isTouchUiMode } from '../game/perfConfig'
import { getPlayerWorldState } from '../avatar/playerWorldState'
import { getNpcById } from '../npc/npcData'
import { useDialogueStore } from '../dialogue/dialogueStore'
import { useNpcStore } from '../stores/npcStore'

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
const mobileDialogueCameraHeight = new Vector3(0, 2.1, 0)
const mobileDialogueLookAtHeight = new Vector3(0, 1.15, 0)

export function FollowCamera() {
  useFrame(({ camera }, delta) => {
    const world = getPlayerWorldState()
    const dialogue = useDialogueStore.getState()
    const isMobile = isTouchUiMode()

    playerPosition.set(world.x, world.y, world.z)

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
          .multiplyScalar(isMobile ? 0.55 : 0.72)
          .addScaledVector(dialogueDirection, isMobile ? 0.35 : 0.48)
          .normalize()

        const cameraDistance = isMobile ? 5.8 : 4.6
        const cameraHeight = isMobile ? mobileDialogueCameraHeight : dialogueCameraHeight
        const lookAtHeight = isMobile ? mobileDialogueLookAtHeight : dialogueLookAtHeight

        desiredPosition.copy(midpoint).addScaledVector(dialogueCameraDirection, cameraDistance).add(cameraHeight)
        lookAtTarget.copy(midpoint).add(lookAtHeight)

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
