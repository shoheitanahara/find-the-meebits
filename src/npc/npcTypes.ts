import type { Vector3Tuple } from '../types/game'

export type NPCPersonality =
  | 'chill'
  | 'hype'
  | 'nerd'
  | 'artist'
  | 'trader'
  | 'builder'
  | 'mysterious'
  | 'punk'
  | 'kind'
  | 'weird'

export type NPCRole =
  | 'resident'
  | 'guide'
  | 'collector'
  | 'builder'
  | 'artist'
  | 'historian'
  | 'dj'
  | 'shopkeeper'
  | 'wanderer'

export type DialogueCategory =
  | 'greeting'
  | 'daily'
  | 'rumor'
  | 'joke'
  | 'meebits'
  | 'world'
  | 'hint'

export type DialogueLine = {
  id: string
  text: string
  category: DialogueCategory
}

export type NPCProfile = {
  id: string
  name: string
  meebitNumber: number
  position: Vector3Tuple
  rotation: Vector3Tuple
  personality: NPCPersonality
  role: NPCRole
  catchphrase?: string
  topics: string[]
  dialogues: DialogueLine[]
}
