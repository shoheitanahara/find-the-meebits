import { getLocale } from '../../i18n/locale'
import type { DialogueLine } from '../../npc/npcTypes'
import { isSoldMeebit, type ListedMeebit } from '../../opensea/types'
import { getListingCaption } from './marketTraitPhrases'

/** 台座展示用 — Digital Sculpture としての三人称説明（一人称の売買感を避ける） */
export function createListingDialogue(listing: ListedMeebit): DialogueLine[] {
  const ja = getLocale() === 'ja'
  const id = listing.tokenId
  const price = listing.priceEth
  const sold = isSoldMeebit(listing)
  const caption = getListingCaption(id)

  const title = `Digital Sculpture — Meebit #${id}`
  const status = ja
    ? sold
      ? price == null
        ? '48時間以内に売れた作品だよ。リンクから詳細を見てね。'
        : `48時間以内に ${formatPrice(price)} ETH で売れた作品だよ。OpenSea で詳細を見てね。`
      : price == null
        ? 'OpenSea に出品中の作品だよ。リンクから詳細を見てね。'
        : `出品価格 ${formatPrice(price)} ETH。OpenSea で詳細を見てね。`
    : sold
      ? price == null
        ? 'This piece sold within the last 48 hours. Check the link for details.'
        : `Sold for ${formatPrice(price)} ETH within the last 48 hours. View details on OpenSea.`
      : price == null
        ? 'A work currently listed on OpenSea. Check the link for details.'
        : `Listed at ${formatPrice(price)} ETH. View details on OpenSea.`

  const lines: DialogueLine[] = [{ id: `opensea-${id}-1`, text: title, category: 'meebits' }]
  if (caption) lines.push({ id: `opensea-${id}-caption`, text: ja ? caption.ja : caption.en, category: 'meebits' })
  lines.push({ id: `opensea-${id}-2`, text: status, category: 'meebits' })
  return lines
}

function formatPrice(price: number) {
  if (Number.isInteger(price)) return String(price)
  const rounded = Math.round(price * 1000) / 1000
  return String(rounded)
}
