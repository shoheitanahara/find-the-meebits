/** クライアントから Listing API を叩く（キーはサーバのみ） */
import type { MeebitsListingsPayload } from './types'

export async function loadMeebitsListings(): Promise<MeebitsListingsPayload> {
  try {
    const res = await fetch('/api/opensea/meebits-listings', {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) {
      return { updatedAt: new Date().toISOString(), listings: [] }
    }
    const data = (await res.json()) as MeebitsListingsPayload
    if (!data || !Array.isArray(data.listings)) {
      return { updatedAt: new Date().toISOString(), listings: [] }
    }
    return data
  } catch {
    return { updatedAt: new Date().toISOString(), listings: [] }
  }
}
