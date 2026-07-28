import traitHuntPools from '../data/trait-hunt-pools.json'
import { CLOSET_TYPE_VALUES, getClosetPoolCount } from './closetPools'

export type ClosetTraitOption = {
  traitType: string
  traitValue: string
  poolKey: string
  count: number
}

export type ClosetTraitSelection = {
  traitType: string
  traitValue: string
  poolKey: string
}

type PoolsFile = {
  pools: Record<string, number[]>
}

/** カラー以外・見た目で選ぶ順（どうぶつの森風カテゴリ） */
export const CLOSET_TRAIT_TYPE_ORDER = [
  'Type',
  'Hair Style',
  'Hat',
  'Glasses',
  'Beard',
  'Shirt',
  'Overshirt',
  'Pants',
  'Shoes',
  'Necklace',
  'Earring',
  'Tattoo',
] as const

const COLOR_TYPE_RE = /color/i
const poolsFile = traitHuntPools as PoolsFile

let cachedCatalog: ClosetTraitOption[] | null = null
let cachedByType: Map<string, ClosetTraitOption[]> | null = null

function isClosetTraitPoolKey(poolKey: string) {
  const sep = poolKey.indexOf('::')
  if (sep <= 0) return false
  const traitType = poolKey.slice(0, sep)
  if (COLOR_TYPE_RE.test(traitType)) return false
  if (traitType === 'Type') return false // Type は CLOSET_TYPE_VALUES で全種追加
  return (CLOSET_TRAIT_TYPE_ORDER as readonly string[]).includes(traitType)
}

export function getClosetTraitCatalog(): ClosetTraitOption[] {
  if (cachedCatalog) return cachedCatalog

  const options: ClosetTraitOption[] = []

  for (const traitValue of CLOSET_TYPE_VALUES) {
    const poolKey = `Type::${traitValue}`
    options.push({
      traitType: 'Type',
      traitValue,
      poolKey,
      count: getClosetPoolCount(poolKey),
    })
  }

  for (const poolKey of Object.keys(poolsFile.pools)) {
    if (!isClosetTraitPoolKey(poolKey)) continue
    const sep = poolKey.indexOf('::')
    const traitType = poolKey.slice(0, sep)
    const traitValue = poolKey.slice(sep + 2)
    const count = getClosetPoolCount(poolKey)
    if (count < 1) continue
    options.push({ traitType, traitValue, poolKey, count })
  }

  options.sort((a, b) => {
    const ai = CLOSET_TRAIT_TYPE_ORDER.indexOf(a.traitType as (typeof CLOSET_TRAIT_TYPE_ORDER)[number])
    const bi = CLOSET_TRAIT_TYPE_ORDER.indexOf(b.traitType as (typeof CLOSET_TRAIT_TYPE_ORDER)[number])
    if (ai !== bi) return ai - bi
    if (a.traitType === 'Type') {
      return (
        CLOSET_TYPE_VALUES.indexOf(a.traitValue as (typeof CLOSET_TYPE_VALUES)[number]) -
        CLOSET_TYPE_VALUES.indexOf(b.traitValue as (typeof CLOSET_TYPE_VALUES)[number])
      )
    }
    return a.traitValue.localeCompare(b.traitValue)
  })

  cachedCatalog = options
  return options
}

export function getClosetTraitsByType(): Map<string, ClosetTraitOption[]> {
  if (cachedByType) return cachedByType

  const byType = new Map<string, ClosetTraitOption[]>()
  for (const option of getClosetTraitCatalog()) {
    const list = byType.get(option.traitType) ?? []
    list.push(option)
    byType.set(option.traitType, list)
  }
  cachedByType = byType
  return byType
}

export function getClosetTraitTypes(): string[] {
  const byType = getClosetTraitsByType()
  return CLOSET_TRAIT_TYPE_ORDER.filter((type) => byType.has(type))
}

export const CLOSET_MATCH_PREVIEW_LIMIT = 18
