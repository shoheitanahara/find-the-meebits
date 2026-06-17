import { isMobilePerfMode } from './perfConfig'

export type StageKind = 'regular' | 'semifinal' | 'final'

export type ProgressionStep = {
  stageNumber: number
  npcCount: number
  targetCount: number
  kind: StageKind
}

const PC_REGULAR_NPC_COUNTS = [200, 250, 300, 350, 400] as const
const SP_REGULAR_NPC_COUNTS = [100, 150, 200, 250, 300] as const
const PC_CHALLENGE_NPC_COUNT = 400
const SP_CHALLENGE_NPC_COUNT = 300

export function getChallengeNpcCount() {
  return isMobilePerfMode() ? SP_CHALLENGE_NPC_COUNT : PC_CHALLENGE_NPC_COUNT
}

export function getProgressionSteps(): ProgressionStep[] {
  const regularCounts = isMobilePerfMode() ? SP_REGULAR_NPC_COUNTS : PC_REGULAR_NPC_COUNTS
  const challengeNpcCount = getChallengeNpcCount()

  const regularSteps: ProgressionStep[] = regularCounts.map((npcCount, index) => ({
    stageNumber: index + 1,
    npcCount,
    targetCount: 1,
    kind: 'regular',
  }))

  return [
    ...regularSteps,
    {
      stageNumber: 6,
      npcCount: challengeNpcCount,
      targetCount: 2,
      kind: 'semifinal',
    },
    {
      stageNumber: 7,
      npcCount: challengeNpcCount,
      targetCount: 3,
      kind: 'final',
    },
  ]
}

export function getProgressionStep(index: number): ProgressionStep | null {
  return getProgressionSteps()[index] ?? null
}

export function getStageLabel(step: ProgressionStep) {
  if (step.kind === 'semifinal') {
    return 'Semifinal'
  }

  if (step.kind === 'final') {
    return 'Final'
  }

  return `Stage ${step.stageNumber}`
}

export function getStageDescription(step: ProgressionStep) {
  if (step.kind === 'semifinal') {
    return `Find ${step.targetCount} targets among ${step.npcCount} Meebits`
  }

  if (step.kind === 'final') {
    return `Find all ${step.targetCount} targets among ${step.npcCount} Meebits`
  }

  return `${step.npcCount} Meebits · find 1 target`
}

export function getProgressionSummary() {
  const regularCounts = isMobilePerfMode() ? SP_REGULAR_NPC_COUNTS : PC_REGULAR_NPC_COUNTS
  const first = regularCounts[0]
  const lastRegular = regularCounts[regularCounts.length - 1]

  return `${first}–${lastRegular} across 5 stages, then Semifinal (2 targets) and Final (3 targets) at ${getChallengeNpcCount()} Meebits`
}
