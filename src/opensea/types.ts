/** OpenSea Meebits listing — クライアント／サーバ共通の型のみ */

export type ListedMeebitStatus = 'listed' | 'sold'

export type ListedMeebit = {
  tokenId: number
  priceEth: number | null
  orderHash?: string
  /** Unix 秒。出品作成時刻（order_created_at / startTime） */
  listedAt?: number
  /** Unix 秒。売却時刻（sale event） */
  soldAt?: number
  /** 省略時は出品中。sold = 直近の売却展示 */
  status?: ListedMeebitStatus
}

export function isSoldMeebit(item: Pick<ListedMeebit, 'status'>): boolean {
  return item.status === 'sold'
}

export type MeebitsListingsPayload = {
  updatedAt: string
  listings: ListedMeebit[]
  /** サーバ側の取得失敗理由（クライアント表示・デバッグ用） */
  error?: string
}

export const MEEBITS_CONTRACT = '0x7bd29408f11d2bfc23c34f18275bbf23bb716bc7'
export const OPENSEA_MEEBITS_ASSET_BASE =
  `https://opensea.io/assets/ethereum/${MEEBITS_CONTRACT}`

export function openseaAssetUrl(tokenId: number) {
  return `${OPENSEA_MEEBITS_ASSET_BASE}/${tokenId}`
}
