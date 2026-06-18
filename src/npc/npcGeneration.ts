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
      id: 'shawn-1',
      text: 'I made this world because I love Meebits.',
      category: 'world',
    },
    {
      id: 'shawn-2',
      text: 'I wanted more people to see the quiet beauty inside each one.',
      category: 'meebits',
    },
    {
      id: 'shawn-3',
      text: 'Meebits are already metaverse-ready. I just wanted to create more places where they can be used, seen, and played with.',
      category: 'meebits',
    },
    {
      id: 'shawn-4',
      text: 'When I saw familiar avatars in Otherside, I felt something special. That feeling of "Hey, I know that one!" became the starting point for this game.',
      category: 'world',
    },
    {
      id: 'shawn-5',
      text: 'This game started from one simple feeling: I wanted to meet more Meebits out in the wild.',
      category: 'world',
    },
    {
      id: 'shawn-6',
      text: 'Meebits are not just collectibles. They are tiny identities, waiting for worlds to live in.',
      category: 'meebits',
    },
    {
      id: 'shawn-7',
      text: 'I want anyone to use Meebits easily. No hard setup. No complicated tools. Just enter the world and play.',
      category: 'world',
    },
    {
      id: 'shawn-8',
      text: 'Every Meebit has its own strange beauty. So I made a place where they can be seen, found, and remembered.',
      category: 'meebits',
    },
    {
      id: 'shawn-9',
      text: 'When your Meebit can walk, talk, and be found by someone, it becomes more than just an image.',
      category: 'meebits',
    },
    {
      id: 'shawn-10',
      text: 'I believe Meebits should appear in more worlds, more games, and more memories. This is my small first step.',
      category: 'world',
    },
    {
      id: 'shawn-11',
      text: 'I made this because seeing a Meebit inside a world feels different. It feels like meeting someone you already know.',
      category: 'world',
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
