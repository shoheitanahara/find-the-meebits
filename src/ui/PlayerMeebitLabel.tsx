import { usePlayerStore } from '../stores/playerStore'

type PlayerMeebitLabelProps = {
  className?: string
}

export function PlayerMeebitLabel({ className = 'text-sm font-bold text-neutral-200' }: PlayerMeebitLabelProps) {
  const playerMeebitNumber = usePlayerStore((state) => state.meebitNumber)

  return <p className={className}>You #{playerMeebitNumber}</p>
}
