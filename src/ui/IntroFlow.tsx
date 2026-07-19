import { useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { StartScreen } from './StartScreen'
import { StoryIntro } from './StoryIntro'
import { getCachedAppEdition } from '../game/appEdition'

/**
 * Museum イントロではストーリー → スタート画面の順（毎回表示）。
 * Club / After Hours 解放演出中はストーリーをスキップ。
 * /v2 トレイトハント試作もストーリーをスキップ（v1 導線と分離）。
 */
export function IntroFlow() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const venueId = useGameStore((state) => state.venueId)
  const afterHoursUnlockPending = useGameStore((state) => state.afterHoursUnlockPending)
  const [storyDone, setStoryDone] = useState(false)

  if (gamePhase !== 'intro') {
    return null
  }

  const showStory =
    getCachedAppEdition() !== 'v2' &&
    venueId === 'museum' &&
    !afterHoursUnlockPending &&
    !storyDone

  if (showStory) {
    return <StoryIntro onComplete={() => setStoryDone(true)} />
  }

  return <StartScreen />
}
