import type { Vector3Tuple } from '../types/game'
import type { VenueId } from '../game/venueConfig'
import { isJapanese } from '../i18n/locale'
import { LANDMARK_PHRASE_JA } from '../i18n/dialogue/landmarkPhrasesJa'
import { buildHintLandmarksForVenue } from '../world/worldLandmarks'
import { getVenueHintPhrases, type MapZone } from './npcTargetHintPhrases'

/** かなり近いときだけ「すぐ近く」ヒント */
const VERY_CLOSE_DISTANCE = 14
/** ランドマーク（木・彫刻・ベンチ）— エリア内の目印 */
const LANDMARK_RADIUS = 10
/** 別エリアかつ遠いときは、エリア名だけに留める */
const FAR_ACROSS_VENUE = 48

export function buildTargetLocationHint(
  playerPosition: Vector3Tuple,
  targetPosition: Vector3Tuple,
  seed = 0,
  venueId: VenueId = 'museum',
): string {
  const landmarks = buildHintLandmarksForVenue(venueId)
  const phrases = getVenueHintPhrases(venueId)
  const targetX = targetPosition[0]
  const targetZ = targetPosition[2]
  const distance = Math.hypot(targetX - playerPosition[0], targetZ - playerPosition[2])
  const prefix = pickFrom(phrases.prefixes, seed)
  const ja = isJapanese()

  if (distance < VERY_CLOSE_DISTANCE) {
    const phrase = pickFrom(phrases.veryClose, seed + 1)
    return ja ? `${prefix}ターゲットは${phrase}。` : `${prefix} your target is ${phrase}.`
  }

  const landmarkPhrase = getNearestLandmarkPhrase(targetX, targetZ, seed + 2, landmarks)
  if (landmarkPhrase) {
    return ja
      ? `${prefix}ターゲットは${landmarkPhrase}。`
      : `${prefix} your target is ${landmarkPhrase}.`
  }

  const targetZone = classifyZone(targetX, targetZ)
  const playerZone = classifyZone(playerPosition[0], playerPosition[2])

  if (targetZone === playerZone) {
    const phrase = pickFrom(phrases.sameZone[targetZone], seed + 3)
    return ja ? `${prefix}ターゲットは${phrase}。` : `${prefix} your target is ${phrase}.`
  }

  if (distance >= FAR_ACROSS_VENUE) {
    const phrase = pickFrom(phrases.farZone[targetZone], seed + 4)
    return ja ? `${prefix}ターゲットは${phrase}。` : `${prefix} your target is ${phrase}.`
  }

  const phrase = pickFrom(phrases.zone[targetZone], seed + 4)
  return ja ? `${prefix}ターゲットは${phrase}。` : `${prefix} your target is ${phrase}.`
}

export function classifyZone(x: number, z: number): MapZone {
  if (x < -26) {
    return 'west'
  }

  if (x > 26) {
    return 'east'
  }

  if (z > 36) {
    return 'entrance'
  }

  if (z < -26) {
    return 'back'
  }

  if (z > 6) {
    return 'front'
  }

  return 'center'
}

function getNearestLandmarkPhrase(
  x: number,
  z: number,
  seed: number,
  landmarks: ReturnType<typeof buildHintLandmarksForVenue>,
) {
  let nearest: (typeof landmarks)[number] | null = null
  let nearestDistance = LANDMARK_RADIUS

  for (const landmark of landmarks) {
    const distance = Math.hypot(x - landmark.x, z - landmark.z)
    if (distance < nearestDistance) {
      nearest = landmark
      nearestDistance = distance
    }
  }

  if (!nearest) {
    return null
  }

  return localizeLandmarkPhrase(pickFrom(nearest.phrases, seed))
}

function localizeLandmarkPhrase(phrase: string) {
  if (!isJapanese()) {
    return phrase
  }

  return LANDMARK_PHRASE_JA[phrase] ?? phrase
}

function pickFrom<T>(options: T[], seed: number) {
  const index = Math.abs(Math.floor(Math.sin(seed * 12.9898) * 43758.5453)) % options.length
  return options[index]
}
