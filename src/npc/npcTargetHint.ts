import type { Vector3Tuple } from '../types/game'

const VERY_CLOSE_DISTANCE = 18
const LANDMARK_RADIUS = 14

type MapZone =
  | 'entrance'
  | 'front'
  | 'center'
  | 'back'
  | 'west'
  | 'east'
  | 'northwest'
  | 'northeast'
  | 'southwest'
  | 'southeast'

type Landmark = {
  x: number
  z: number
  phrases: string[]
}

const LANDMARKS: Landmark[] = [
  {
    x: 0,
    z: 52,
    phrases: ['near the entrance boards', 'by the boards at the entrance'],
  },
  {
    x: 0,
    z: -22,
    phrases: ['near the stage', 'near the FIND THE MEEBIT stage'],
  },
  {
    x: -15,
    z: -15,
    phrases: ['near the signboard', 'by the small signboard'],
  },
  { x: -22, z: -15, phrases: ['near the golden trees', 'by the golden trees'] },
  { x: -16, z: 22, phrases: ['near the golden trees', 'by the golden trees'] },
  { x: 20, z: -18, phrases: ['near the golden trees', 'by the golden trees'] },
  { x: 24, z: 20, phrases: ['near the golden trees', 'by the golden trees'] },
  { x: -44, z: 3, phrases: ['near the golden trees', 'by the golden trees'] },
  { x: 44, z: -5, phrases: ['near the golden trees', 'by the golden trees'] },
  { x: -50, z: -42, phrases: ['near the sculptures', 'by the black and white sculptures'] },
  { x: 48, z: -36, phrases: ['near the sculptures', 'by the black and white sculptures'] },
  { x: 52, z: 30, phrases: ['near the sculptures', 'by the black and white sculptures'] },
  { x: -14, z: 12, phrases: ['near a bench', 'by one of the benches'] },
  { x: 28, z: 24, phrases: ['near a bench', 'by one of the benches'] },
  { x: -54, z: -10, phrases: ['near the wall art', 'by the wall displays'] },
  { x: 54, z: 10, phrases: ['near the wall art', 'by the wall displays'] },
]

const ZONE_PHRASES: Record<MapZone, string[]> = {
  entrance: [
    'near the entrance',
    'at the entrance side of the museum',
    'close to where you started',
  ],
  front: [
    'in the front of the museum',
    'in the front hall',
    'not far from the entrance area',
  ],
  center: [
    'in the center of the gallery',
    'in the middle of the museum',
    'around the center hall',
  ],
  back: [
    'in the back of the museum',
    'deep in the gallery',
    'far from the entrance, in the back',
  ],
  west: ['on the west side of the museum', 'in the west area of the gallery'],
  east: ['on the east side of the museum', 'in the east area of the gallery'],
  northwest: ['in the northwest area', 'in the back-left area of the museum'],
  northeast: ['in the northeast area', 'in the back-right area of the museum'],
  southwest: ['in the southwest area', 'near the entrance, on the west side'],
  southeast: ['in the southeast area', 'near the entrance, on the east side'],
}

const SAME_ZONE_PHRASES: Record<MapZone, string[]> = {
  entrance: [
    'in the same area as you, near the entrance',
    'near the entrance too. Keep looking around here',
  ],
  front: ['in the front area with you', 'in the same front area. Keep walking here'],
  center: ['in the center area with you', 'in the middle of the gallery with you'],
  back: ['in the back area with you', 'deep in the gallery with you'],
  west: ['on the west side with you', 'in the west area with you. Keep looking'],
  east: ['on the east side with you', 'in the east area with you. Keep looking'],
  northwest: ['in the northwest area with you', 'in the same northwest area'],
  northeast: ['in the northeast area with you', 'in the same northeast area'],
  southwest: ['in the southwest area with you', 'near the entrance with you, on the west side'],
  southeast: ['in the southeast area with you', 'near the entrance with you, on the east side'],
}

const VERY_CLOSE_PHRASES = [
  'very close to you. Look around',
  'nearby. Check the Meebits around you',
  'close to you. Walk slowly and look',
]

const HINT_PREFIXES = ['Hint:', 'Hint:', 'Quick hint:', 'Small hint:']

export function buildTargetLocationHint(
  playerPosition: Vector3Tuple,
  targetPosition: Vector3Tuple,
  seed = 0,
): string {
  const targetX = targetPosition[0]
  const targetZ = targetPosition[2]
  const distance = Math.hypot(targetX - playerPosition[0], targetZ - playerPosition[2])
  const prefix = pickFrom(HINT_PREFIXES, seed)

  if (distance < VERY_CLOSE_DISTANCE) {
    const phrase = pickFrom(VERY_CLOSE_PHRASES, seed + 1)
    return `${prefix} your target is ${phrase}.`
  }

  const landmarkPhrase = getNearestLandmarkPhrase(targetX, targetZ, seed + 2)
  if (landmarkPhrase) {
    return `${prefix} your target is ${landmarkPhrase}.`
  }

  const targetZone = classifyZone(targetX, targetZ)
  const playerZone = classifyZone(playerPosition[0], playerPosition[2])

  if (targetZone === playerZone) {
    const phrase = pickFrom(SAME_ZONE_PHRASES[targetZone], seed + 3)
    return `${prefix} your target is ${phrase}.`
  }

  const phrase = pickFrom(ZONE_PHRASES[targetZone], seed + 4)
  return `${prefix} your target is ${phrase}.`
}

export function classifyZone(x: number, z: number): MapZone {
  if (z < -22) {
    if (x < -22) {
      return 'northwest'
    }

    if (x > 22) {
      return 'northeast'
    }

    return 'back'
  }

  if (z > 38) {
    if (x < -22) {
      return 'southwest'
    }

    if (x > 22) {
      return 'southeast'
    }

    return 'entrance'
  }

  if (x < -22) {
    return 'west'
  }

  if (x > 22) {
    return 'east'
  }

  if (z > 12) {
    return 'front'
  }

  return 'center'
}

function getNearestLandmarkPhrase(x: number, z: number, seed: number) {
  let nearest: Landmark | null = null
  let nearestDistance = LANDMARK_RADIUS

  for (const landmark of LANDMARKS) {
    const distance = Math.hypot(x - landmark.x, z - landmark.z)
    if (distance < nearestDistance) {
      nearest = landmark
      nearestDistance = distance
    }
  }

  if (!nearest) {
    return null
  }

  return pickFrom(nearest.phrases, seed)
}

function pickFrom<T>(options: T[], seed: number) {
  const index = Math.abs(Math.floor(Math.sin(seed * 12.9898) * 43758.5453)) % options.length
  return options[index]
}
