import { usePlayerStore } from '../stores/playerStore'
import { ui } from '../i18n/ui'

type PlayerMeebitLabelProps = {
  className?: string
}

export function PlayerMeebitLabel({ className = 'text-sm font-bold text-neutral-200' }: PlayerMeebitLabelProps) {
  const playerMeebitNumber = usePlayerStore((state) => state.meebitNumber)

  return <p className={className}>{ui().youHash(playerMeebitNumber)}</p>
}
