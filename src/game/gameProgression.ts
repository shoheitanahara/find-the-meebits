import { isMobilePerfMode } from './perfConfig'
import type { VenueId } from './venueConfig'

export type StageKind =
  | 'regular'
  | 'semifinal'
  | 'final'
  | 'grandfinal'
  | 'afterhours'
  | 'lastcall'

export type ProgressionStep = {
  venueId: VenueId
  stageNumber: number
  npcCount: number
  targetCount: number
  kind: StageKind
}

const PC_REGULAR_NPC_COUNTS = [200, 250, 300, 350, 400] as const
const SP_REGULAR_NPC_COUNTS = [100, 125, 150, 175, 200] as const
const PC_CHALLENGE_NPC_COUNT = 400
const SP_CHALLENGE_NPC_COUNT = 200

const PC_CLUB_NPC_COUNTS = [300, 350, 400] as const
const SP_CLUB_NPC_COUNTS = [150, 175, 200] as const
const PC_CLUB_NPC_MAX = 400
const SP_CLUB_NPC_MAX = 200

export function getChallengeNpcCount(venueId: VenueId = 'museum') {
  if (venueId === 'club') {
    return isMobilePerfMode() ? SP_CLUB_NPC_MAX : PC_CLUB_NPC_MAX
  }

  return isMobilePerfMode() ? SP_CHALLENGE_NPC_COUNT : PC_CHALLENGE_NPC_COUNT
}

function getClubNpcCounts() {
  return isMobilePerfMode() ? SP_CLUB_NPC_COUNTS : PC_CLUB_NPC_COUNTS
}

function getClubNpcMaxCount() {
  return isMobilePerfMode() ? SP_CLUB_NPC_MAX : PC_CLUB_NPC_MAX
}

export function getMuseumProgressionSteps(): ProgressionStep[] {
  const regularCounts = isMobilePerfMode() ? SP_REGULAR_NPC_COUNTS : PC_REGULAR_NPC_COUNTS
  const challengeNpcCount = getChallengeNpcCount('museum')

  const regularSteps: ProgressionStep[] = regularCounts.map((npcCount, index) => ({
    venueId: 'museum',
    stageNumber: index + 1,
    npcCount,
    targetCount: 1,
    kind: 'regular',
  }))

  return [
    ...regularSteps,
    {
      venueId: 'museum',
      stageNumber: 6,
      npcCount: challengeNpcCount,
      targetCount: 2,
      kind: 'semifinal',
    },
    {
      venueId: 'museum',
      stageNumber: 7,
      npcCount: challengeNpcCount,
      targetCount: 3,
      kind: 'final',
    },
    {
      venueId: 'museum',
      stageNumber: 8,
      npcCount: challengeNpcCount,
      targetCount: 5,
      kind: 'grandfinal',
    },
  ]
}

export function getClubProgressionSteps(): ProgressionStep[] {
  const clubNpcCounts = getClubNpcCounts()
  const maxCount = getClubNpcMaxCount()

  return [
    {
      venueId: 'club',
      stageNumber: 1,
      npcCount: clubNpcCounts[0],
      targetCount: 2,
      kind: 'afterhours',
    },
    {
      venueId: 'club',
      stageNumber: 2,
      npcCount: clubNpcCounts[1],
      targetCount: 2,
      kind: 'afterhours',
    },
    {
      venueId: 'club',
      stageNumber: 3,
      npcCount: clubNpcCounts[2],
      targetCount: 2,
      kind: 'afterhours',
    },
    {
      venueId: 'club',
      stageNumber: 4,
      npcCount: maxCount,
      targetCount: 3,
      kind: 'afterhours',
    },
    {
      venueId: 'club',
      stageNumber: 5,
      npcCount: maxCount,
      targetCount: 5,
      kind: 'lastcall',
    },
  ]
}

export function getProgressionSteps(venueId: VenueId = 'museum'): ProgressionStep[] {
  return venueId === 'club' ? getClubProgressionSteps() : getMuseumProgressionSteps()
}

export function getProgressionStep(index: number, venueId: VenueId = 'museum'): ProgressionStep | null {
  return getProgressionSteps(venueId)[index] ?? null
}

export function getStageLabel(step: ProgressionStep) {
  if (step.kind === 'semifinal') {
    return 'Semifinal'
  }

  if (step.kind === 'final') {
    return 'Final'
  }

  if (step.kind === 'grandfinal') {
    return 'Grand Final'
  }

  if (step.kind === 'lastcall') {
    return 'Last Call'
  }

  if (step.kind === 'afterhours') {
    return `After Hours ${step.stageNumber}`
  }

  return `Stage ${step.stageNumber}`
}

export function getStageDescription(step: ProgressionStep) {
  if (step.kind === 'semifinal' || step.kind === 'final' || step.kind === 'afterhours') {
    return `Find ${step.targetCount} targets among ${step.npcCount} Meebits`
  }

  if (step.kind === 'grandfinal' || step.kind === 'lastcall') {
    return `Find all ${step.targetCount} targets among ${step.npcCount} Meebits`
  }

  return `${step.npcCount} Meebits · find 1 target`
}

export function getProgressionSummary(venueId: VenueId = 'museum') {
  if (venueId === 'club') {
    const clubNpcCounts = getClubNpcCounts()
    const maxCount = getClubNpcMaxCount()
    return `${clubNpcCounts.join(' → ')} across stages 1–3 (2 targets), then ${maxCount} with 3 targets, Last Call with 5`
  }

  const regularCounts = isMobilePerfMode() ? SP_REGULAR_NPC_COUNTS : PC_REGULAR_NPC_COUNTS
  const first = regularCounts[0]
  const lastRegular = regularCounts[regularCounts.length - 1]
  const challengeNpcCount = getChallengeNpcCount('museum')

  return `${first}–${lastRegular} across 5 stages, then Semifinal (2), Final (3), and Grand Final (5 targets) at ${challengeNpcCount} Meebits`
}
