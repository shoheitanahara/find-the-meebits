import type { Vector3Tuple } from '../types/game'

const DIRECTION_THRESHOLD = 8
const NEAR_DISTANCE = 22
const FAR_DISTANCE = 50

export function buildTargetLocationHint(playerPosition: Vector3Tuple, targetPosition: Vector3Tuple): string {
  const dx = targetPosition[0] - playerPosition[0]
  const dz = targetPosition[2] - playerPosition[2]
  const distance = Math.hypot(dx, dz)
  const direction = getDirectionPhrase(dx, dz)
  const distancePhrase = getDistancePhrase(distance)

  return `Hint: your target is ${direction} ${distancePhrase}.`
}

function getDirectionPhrase(dx: number, dz: number) {
  if (Math.abs(dz) >= Math.abs(dx)) {
    if (dz < -DIRECTION_THRESHOLD) {
      return 'toward the back of the museum'
    }

    if (dz > DIRECTION_THRESHOLD) {
      return 'near the entrance side'
    }

    return 'around the middle of the gallery'
  }

  if (dx < -DIRECTION_THRESHOLD) {
    return 'to the west side'
  }

  if (dx > DIRECTION_THRESHOLD) {
    return 'to the east side'
  }

  return 'near the center lanes'
}

function getDistancePhrase(distance: number) {
  if (distance < NEAR_DISTANCE) {
    return 'and pretty close to here'
  }

  if (distance > FAR_DISTANCE) {
    return 'on the other side of the crowd'
  }

  return 'somewhere in that direction'
}
