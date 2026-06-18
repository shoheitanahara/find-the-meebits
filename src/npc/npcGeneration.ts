import {
  CREATOR_MEEBIT_ID,
  CREATOR_NPC_ID,
} from '../game/gameConfig'
import { generateRandomNpcSpawnPosition } from '../collision/spawnValidation'
import type { NPCProfile } from './npcTypes'

const personalities: NPCProfile['personality'][] = [
  'chill',
  'hype',
  'nerd',
  'artist',
  'trader',
  'builder',
  'mysterious',
  'punk',
  'kind',
  'weird',
]

const roles: NPCProfile['role'][] = [
  'resident',
  'collector',
  'builder',
  'artist',
  'historian',
  'dj',
  'shopkeeper',
  'wanderer',
]

const creatorNpc: NPCProfile = {
  id: CREATOR_NPC_ID,
  name: 'Shawn T. Art',
  meebitNumber: CREATOR_MEEBIT_ID,
  position: [-10, 0, -14],
  rotation: [0, Math.PI, 0],
  personality: 'artist',
  role: 'artist',
  catchphrase: 'Art is a place you can walk into.',
  topics: ['creator', 'art', 'meebits', 'museum'],
  dialogues: [
    {
      id: 'shawn-intro-1',
      text: 'I am Shawn T. Art, the creator watching over this monochrome Meebits gallery.',
      category: 'greeting',
    },
    {
      id: 'shawn-intro-2',
      text: 'This started as a small Meebits world, but the hunt turned it into a living museum.',
      category: 'world',
    },
    {
      id: 'shawn-art-1',
      text: 'Twenty thousand avatars, one museum, zero agreed-upon lunch spot.',
      category: 'meebits',
    },
    {
      id: 'shawn-art-2',
      text: 'Black, white, motion, and a hundred tiny identities. That is enough for a game.',
      category: 'meebits',
    },
    {
      id: 'shawn-hint-1',
      text: 'If I knew where your target was, I would be playing too.',
      category: 'joke',
    },
  ],
}

export function buildNpcProfiles(wanderingNpcCount: number): NPCProfile[] {
  const meebitNumbers = pickRandomMeebitNumbers(wanderingNpcCount)
  const existingSpawns: Array<[number, number]> = [[creatorNpc.position[0], creatorNpc.position[2]]]
  const wanderingNpcs = meebitNumbers.map((meebitNumber, index) =>
    createNpcProfile(index, meebitNumber, existingSpawns),
  )

  return [creatorNpc, ...wanderingNpcs]
}

export function getCreatorNpc() {
  return creatorNpc
}

function createNpcProfile(
  index: number,
  meebitNumber: number,
  existingSpawns: Array<[number, number]>,
): NPCProfile {
  const id = `npc-${String(index + 1).padStart(3, '0')}`
  const [x, z] = generateRandomNpcSpawnPosition(existingSpawns)
  existingSpawns.push([x, z])
  const personality = personalities[Math.floor(Math.random() * personalities.length)]
  const role = roles[Math.floor(Math.random() * roles.length)]

  return {
    id,
    name: `Meebit #${meebitNumber}`,
    meebitNumber,
    position: [x, 0, z],
    rotation: [0, Math.random() * Math.PI * 2, 0],
    personality,
    role,
    catchphrase: 'Find me if you can.',
    topics: ['search', 'gallery', 'meebits'],
    dialogues: [],
  }
}

function pickRandomMeebitNumbers(count: number): number[] {
  const pool: number[] = []
  for (let i = 1; i <= 20000; i++) {
    if (i !== CREATOR_MEEBIT_ID) {
      pool.push(i)
    }
  }

  shuffleInPlace(pool)
  return pool.slice(0, count)
}

function shuffleInPlace<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}
