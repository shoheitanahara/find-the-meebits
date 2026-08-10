import { useDialogueStore } from '../../dialogue/dialogueStore'
import { usePlayerStore } from '../../stores/playerStore'
import { playSfx } from '../../ui/sfx'
import { useOpenSeaMarketStore } from '../store'
import { createListingDialogue } from './createListingDialogue'

export function marketNpcId(tokenId: number) {
  return `opensea-${tokenId}`
}

export function tryInteractWithListedMeebit() {
  const { bootPhase, nearestTalkTokenId, sessionListings } = useOpenSeaMarketStore.getState()
  const dialogueState = useDialogueStore.getState()
  if (bootPhase !== 'ready' || nearestTalkTokenId == null || dialogueState.isOpen) return

  const listing = sessionListings.find((l) => l.tokenId === nearestTalkTokenId)
  if (!listing) return

  usePlayerStore.getState().setMovementLocked(true)
  playSfx('uiConfirm')
  useDialogueStore
    .getState()
    .openDialogue(marketNpcId(listing.tokenId), createListingDialogue(listing))
}

export function advanceMarketDialogue() {
  const dialogue = useDialogueStore.getState()
  if (!dialogue.isOpen) return
  const hasNext = dialogue.nextLine()
  if (!hasNext) closeMarketDialogue()
}

export function closeMarketDialogue() {
  useDialogueStore.getState().closeDialogue()
  usePlayerStore.getState().setMovementLocked(false)
}

export function handleMarketDialogueKeyDown(event: KeyboardEvent) {
  const dialogueState = useDialogueStore.getState()
  const active = dialogueState.activeNpcId
  const isMarket = typeof active === 'string' && active.startsWith('opensea-')

  if (event.code === 'Escape' && dialogueState.isOpen && isMarket) {
    event.preventDefault()
    closeMarketDialogue()
    return
  }

  if (dialogueState.isOpen && isMarket) {
    if (event.code === 'KeyE' || event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault()
      advanceMarketDialogue()
    }
    return
  }

  if (event.code === 'KeyE') {
    if (!useOpenSeaMarketStore.getState().nearestTalkTokenId) return
    event.preventDefault()
    tryInteractWithListedMeebit()
  }
}
