import { type ReactNode } from 'react'
import { ui } from '../../i18n/ui'
import { useDialogueStore } from '../../dialogue/dialogueStore'
import { TargetPreview } from '../../ui/TargetPreview'
import { getLocale } from '../../i18n/locale'
import { openseaAssetUrl } from '../../opensea/types'
import { useOpenSeaMarketStore } from '../store'
import { advanceMarketDialogue, closeMarketDialogue } from './interactWithListing'

export function MarketDialogueBox() {
  const isOpen = useDialogueStore((state) => state.isOpen)
  const activeNpcId = useDialogueStore((state) => state.activeNpcId)
  const lines = useDialogueStore((state) => state.lines)
  const currentIndex = useDialogueStore((state) => state.currentIndex)
  const t = ui()
  const locale = getLocale()
  const sessionListings = useOpenSeaMarketStore((s) => s.sessionListings)

  if (!isOpen || !activeNpcId?.startsWith('opensea-')) return null

  const tokenId = Number(activeNpcId.replace('opensea-', ''))
  const listing = sessionListings.find((l) => l.tokenId === tokenId)
  const currentLine = lines[currentIndex]
  if (!currentLine || !Number.isFinite(tokenId)) return null

  const isLastLine = currentIndex >= lines.length - 1
  const name = `Meebit #${tokenId}`
  const role = locale === 'ja' ? '出品中' : 'Listed'
  const viewLabel = locale === 'ja' ? 'OpenSeaで見る' : 'View on OpenSea'

  return (
    <div className="pointer-events-auto absolute inset-x-0 z-30 mx-auto w-[min(860px,calc(100%-2rem))] bottom-5 max-lg:bottom-auto max-lg:top-[max(6rem,env(safe-area-inset-top))] max-lg:w-[calc(100%-0.75rem)]">
      <div className="rounded-3xl border border-sky-400/30 bg-[#0c1828]/92 px-5 py-4 text-[#e8f4ff] shadow-2xl backdrop-blur-md max-lg:px-3.5 max-lg:py-3 sm:px-6 sm:py-5">
        <div className="hidden sm:grid sm:grid-cols-[auto_1fr] sm:gap-4">
          <TargetPreview
            meebitNumber={tokenId}
            modelScale={1.1}
            sizeClassName="h-40 w-40 rounded-2xl border border-sky-400/30 bg-[#081018]"
          />
          <MarketDialogueContent
            role={role}
            name={name}
            currentLine={currentLine.text}
            currentIndex={currentIndex}
            linesLength={lines.length}
            onClose={closeMarketDialogue}
            onNext={advanceMarketDialogue}
            closeLabel={t.close}
            nextLabel={isLastLine ? t.done : t.nextLine}
            viewLabel={viewLabel}
            viewHref={openseaAssetUrl(tokenId)}
            priceEth={listing?.priceEth ?? null}
          />
        </div>
        <div className="sm:hidden">
          <MarketDialogueContent
            role={role}
            name={name}
            currentLine={currentLine.text}
            currentIndex={currentIndex}
            linesLength={lines.length}
            onClose={closeMarketDialogue}
            onNext={advanceMarketDialogue}
            closeLabel={t.close}
            nextLabel={isLastLine ? t.done : t.nextLine}
            viewLabel={viewLabel}
            viewHref={openseaAssetUrl(tokenId)}
            priceEth={listing?.priceEth ?? null}
            compact
          />
        </div>
      </div>
    </div>
  )
}

/** 本文中の「5 ETH」だけ太字＋少し大きくする */
function emphasizePriceInLine(text: string): ReactNode {
  const parts = text.split(/(\d+(?:\.\d+)?\s*ETH)/gi)
  if (parts.length === 1) return text
  return parts.map((part, index) =>
    /^\d+(?:\.\d+)?\s*ETH$/i.test(part) ? (
      <strong key={index} className="font-bold">
        {part}
      </strong>
    ) : (
      part
    ),
  )
}

function MarketDialogueContent({
  role,
  name,
  currentLine,
  currentIndex,
  linesLength,
  onClose,
  onNext,
  closeLabel,
  nextLabel,
  viewLabel,
  viewHref,
  priceEth,
  compact = false,
}: {
  role: string
  name: string
  currentLine: string
  currentIndex: number
  linesLength: number
  onClose: () => void
  onNext: () => void
  closeLabel: string
  nextLabel: string
  viewLabel: string
  viewHref: string
  priceEth: number | null
  compact?: boolean
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold uppercase tracking-[0.25em] text-sky-300 ${
              compact ? 'text-[0.6rem]' : 'text-xs'
            }`}
          >
            {role}
            {priceEth != null ? (
              <span className="ml-2 font-mono tracking-normal text-amber-200/90">
                {formatPrice(priceEth)} ETH
              </span>
            ) : null}
          </p>
          <h2 className={`mt-0.5 font-black text-[#e8f4ff] ${compact ? 'text-base' : 'text-xl sm:text-2xl'}`}>
            {name}
          </h2>
        </div>
        <button
          type="button"
          className={`shrink-0 rounded-full border border-white/15 bg-white/5 font-semibold text-sky-100/80 transition hover:bg-white/10 ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1 text-sm'
          }`}
          onClick={onClose}
        >
          {closeLabel}
        </button>
      </div>

      <p
        className={`leading-relaxed text-[#e8f4ff] ${
          compact ? 'mt-2.5 text-sm leading-snug' : 'mt-4 text-base sm:text-lg'
        }`}
      >
        {emphasizePriceInLine(currentLine)}
      </p>

      <div className={`flex flex-wrap items-center gap-2 ${compact ? 'mt-3' : 'mt-4'}`}>
        <a
          href={viewHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-sky-300/40 bg-sky-400/10 px-3 py-1.5 text-xs font-semibold text-sky-100 transition hover:bg-sky-400/20"
        >
          {viewLabel}
        </a>
        <p className="text-[0.65rem] text-white/40">
          {currentIndex + 1}/{linesLength}
        </p>
        <button
          type="button"
          className="ml-auto rounded-full border border-sky-200/35 bg-sky-400/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-sky-50 transition hover:bg-sky-400/25"
          onClick={onNext}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  )
}

function formatPrice(price: number) {
  if (Number.isInteger(price)) return String(price)
  return String(Math.round(price * 1000) / 1000)
}
