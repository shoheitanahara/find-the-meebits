import { EIGHT_STREET } from '../config'
import type { RoundKind } from './generateRound'

export type PlayerAnswer = 'normal' | 'anomaly'

export type JudgeZones = {
  /** Entered leg C (past the second corner). */
  enteredLegC: boolean
  /**
   * Walked in front of the return line at least once this street.
   * Blocks wrap-in / still-on-return-line from instantly judging anomaly.
   */
  clearedReturnLine: boolean
}

/** Must be this far in front of the return line before turn-back can arm. */
const RETURN_CLEAR_MARGIN = 1.25

export function createJudgeZones(): JudgeZones {
  return { enteredLegC: false, clearedReturnLine: false }
}

export function updateJudgeZones(x: number, z: number, state: JudgeZones): JudgeZones {
  let next = state

  if (
    !state.clearedReturnLine &&
    Math.abs(x) < EIGHT_STREET.halfWidth + 0.5 &&
    z <= EIGHT_STREET.returnTransitionZ - RETURN_CLEAR_MARGIN
  ) {
    next = { ...next, clearedReturnLine: true }
  }

  if (
    !next.enteredLegC &&
    Math.abs(x - EIGHT_STREET.corner2X) < EIGHT_STREET.halfWidth + 0.5 &&
    z < EIGHT_STREET.corner1Z - 2
  ) {
    next = { ...next, enteredLegC: true }
  }

  return next
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

  // Turn-back only after the player has entered the street this loop.
  if (
    allowAnomaly &&
    zones.clearedReturnLine &&
    onStartCorridor &&
    z >= EIGHT_STREET.returnTransitionZ
  ) {
    return 'anomaly'
  }

  return null
}

export function isAnswerCorrect(answer: PlayerAnswer, roundKind: RoundKind) {
  return answer === roundKind
}
