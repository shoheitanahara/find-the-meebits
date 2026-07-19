import { EIGHT_STREET } from '../config'
import type { RoundKind } from './generateRound'

export type PlayerAnswer = 'normal' | 'anomaly'

export type JudgeZones = {
  /** Entered leg C (past the second corner). */
  enteredLegC: boolean
}

export function createJudgeZones(): JudgeZones {
  return { enteredLegC: false }
}

export function updateJudgeZones(x: number, z: number, state: JudgeZones): JudgeZones {
  if (
    !state.enteredLegC &&
    Math.abs(x - EIGHT_STREET.corner2X) < EIGHT_STREET.halfWidth + 0.5 &&
    z < EIGHT_STREET.corner1Z - 2
  ) {
    return { enteredLegC: true }
  }
  return state
}

export function tryResolveAnswer(
  x: number,
  z: number,
  zones: JudgeZones,
  options?: { allowAnomaly?: boolean },
): PlayerAnswer | null {
  const onStartCorridor = Math.abs(x) < EIGHT_STREET.halfWidth + 0.5
  const allowAnomaly = options?.allowAnomaly !== false

  // Forward: switch shortly after completing the final left turn.
  if (zones.enteredLegC && z <= EIGHT_STREET.forwardTransitionZ) {
    return 'normal'
  }

  // Turn-back: as soon as you walk behind the start on leg A (no observe gate).
  if (allowAnomaly && onStartCorridor && z >= EIGHT_STREET.returnTransitionZ) {
    return 'anomaly'
  }

  return null
}

export function isAnswerCorrect(answer: PlayerAnswer, roundKind: RoundKind) {
  return answer === roundKind
}
