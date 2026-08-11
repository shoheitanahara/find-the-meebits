import { getLocale } from '../../i18n/locale'
import type { DialogueLine } from '../../npc/npcTypes'
import { isSoldMeebit, type ListedMeebit } from '../../opensea/types'

/** 台座展示用 — Digital Sculpture としての三人称説明（一人称の売買感を避ける） */
export function createListingDialogue(listing: ListedMeebit): DialogueLine[] {
  const locale = getLocale()
  const id = listing.tokenId
  const price = listing.priceEth
  const sold = isSoldMeebit(listing)

  if (locale === 'ja') {
    const line1 = `Digital Sculpture — Meebit #${id}`
    const line2 = sold
      ? price == null
        ? '48時間以内に売れた作品だよ。リンクから詳細を見てね。'
        : `48時間以内に ${formatPrice(price)} ETH で売れた作品だよ。OpenSea で詳細を見てね。`
      : price == null
        ? 'OpenSea に出品中の作品だよ。リンクから詳細を見てね。'
        : `出品価格 ${formatPrice(price)} ETH。OpenSea で詳細を見てね。`
    return [
      { id: `opensea-${id}-1`, text: line1, category: 'meebits' },
      { id: `opensea-${id}-2`, text: line2, category: 'meebits' },
    ]
  }

  const line1 = `Digital Sculpture — Meebit #${id}`
  const line2 = sold
    ? price == null
      ? 'This piece sold within the last 48 hours. Check the link for details.'
      : `Sold for ${formatPrice(price)} ETH within the last 48 hours. View details on OpenSea.`
    : price == null
      ? 'A work currently listed on OpenSea. Check the link for details.'
      : `Listed at ${formatPrice(price)} ETH. View details on OpenSea.`
  return [
    { id: `opensea-${id}-1`, text: line1, category: 'meebits' },
    { id: `opensea-${id}-2`, text: line2, category: 'meebits' },
  ]
}

function formatPrice(price: number) {
  if (Number.isInteger(price)) return String(price)
  const rounded = Math.round(price * 1000) / 1000
  return String(rounded)
}
