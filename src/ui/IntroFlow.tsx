import { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { StartScreen } from './StartScreen'
import { StoryIntro } from './StoryIntro'
import { hasSeenStoryIntro } from './storyIntroStorage'

/**
 * Museum 初回イントロではストーリー → スタート画面の順。
 * Club / After Hours 解放演出中はストーリーをスキップ。
 */
export function IntroFlow() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const venueId = useGameStore((state) => state.venueId)
  const afterHoursUnlockPending = useGameStore((state) => state.afterHoursUnlockPending)
  const [storyDone, setStoryDone] = useState(hasSeenStoryIntro)

  if (gamePhase !== 'intro') {
    return null
  }

  const showStory =
    venueId === 'museum' && !afterHoursUnlockPending && !storyDone

  if (showStory) {
    return <StoryIntro onComplete={() => setStoryDone(true)} />
  }

  return <StartScreen />
}
