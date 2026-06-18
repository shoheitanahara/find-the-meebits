export type GameTip = {
  title: string
  body: string
}

export const GAME_TIPS: GameTip[] = [
  {
    title: 'Red marker',
    body: 'Walk up to a Meebit. A red dot above them means you can talk.',
  },
  {
    title: 'Friendly NPCs',
    body: 'Everyone in the museum is on your team. Chat often — someone may surprise you with a hint.',
  },
  {
    title: 'Find your target',
    body: 'Match the target shown in the corner. Wrong Meebit? Keep searching and keep talking.',
  },
]
