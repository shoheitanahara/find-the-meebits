import { EIGHT_STREET } from '../config'

/** Pick `count` unique Meebit IDs from the 1..20000 range for a session cast. */
export function selectBaseMeebitIds(count = EIGHT_STREET.meebitCount): number[] {
  const picked = new Set<number>()
  while (picked.size < count) {
    picked.add(1 + Math.floor(Math.random() * 20000))
  }
  return [...picked]
}
