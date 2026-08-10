import { getLocale } from '../../i18n/locale'
import type { DialogueLine } from '../../npc/npcTypes'
import type { ListedMeebit } from '../../opensea/types'

export function createListingDialogue(listing: ListedMeebit): DialogueLine[] {
  const locale = getLocale()
  const id = listing.tokenId
  const price = listing.priceEth

  if (locale === 'ja') {
    const line1 = `やあ！Meebit #${id}だよ。`
    const line2 =
      price == null
        ? '今OpenSeaに出品されてるよ。'
        : `今OpenSeaで ${formatPrice(price)} ETH で出品されてるよ。`
    return [
      { id: `opensea-${id}-1`, text: line1, category: 'meebits' },
      { id: `opensea-${id}-2`, text: line2, category: 'meebits' },
    ]
  }

  const line1 = `Hey! I'm Meebit #${id}.`
  const line2 =
    price == null
      ? "I'm currently listed on OpenSea."
      : `I'm currently listed for ${formatPrice(price)} ETH on OpenSea.`
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
