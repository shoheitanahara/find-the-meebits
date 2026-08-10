/** OpenSea Meebits listing — クライアント／サーバ共通の型のみ */

export type ListedMeebit = {
  tokenId: number
  priceEth: number | null
  orderHash?: string
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
