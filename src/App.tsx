import { Analytics } from '@vercel/analytics/react'
import { GameCanvas } from './game/GameCanvas'
import { TabPauseSystem } from './systems/TabPauseSystem'
import { VenueBgmSystem } from './systems/VenueBgmSystem'
import { GameTimerSystem } from './systems/GameTimerSystem'
import { StagePrepareSystem } from './systems/StagePrepareSystem'
import { TargetVrmPreloader } from './systems/TargetVrmPreloader'
import { GameTimer } from './ui/GameTimer'
import { TimeUpOverlay } from './ui/TimeUpOverlay'
import { ClearOverlay } from './ui/ClearOverlay'
import { PrepareOverlay } from './ui/PrepareOverlay'
import { TipsOverlay } from './ui/TipsOverlay'
import { DialogueBox } from './dialogue/DialogueBox'
import { DialogueSystem } from './dialogue/DialogueSystem'
import { ErrorMessage } from './ui/ErrorMessage'
import { HUD } from './ui/HUD'
import { InteractionPrompt } from './ui/InteractionPrompt'
import { LoadingScreen } from './ui/LoadingScreen'
import { MiniMap } from './ui/MiniMap'
import { MobileControls } from './ui/mobile/MobileControls'
import { MobileTopBar } from './ui/mobile/MobileTopBar'
import { DevBootstrapBanner } from './ui/DevBootstrapBanner'
import { AfterHoursUnlockOverlay } from './ui/AfterHoursUnlockOverlay'
import { StartScreen } from './ui/StartScreen'
import { TargetHUD } from './ui/TargetHUD'
import { TargetPreviewCapture } from './ui/TargetPreviewCapture'
import { useGameStore } from './stores/gameStore'

function AfterHoursUnlockGate() {
  const gamePhase = useGameStore((state) => state.gamePhase)
  const venueId = useGameStore((state) => state.venueId)
  const afterHoursUnlockPending = useGameStore((state) => state.afterHoursUnlockPending)
  const acknowledgeAfterHoursUnlock = useGameStore((state) => state.acknowledgeAfterHoursUnlock)
  const startAfterHours = useGameStore((state) => state.startAfterHours)
  const isVisible = gamePhase === 'intro' && venueId === 'museum' && afterHoursUnlockPending

  const handleComplete = () => {
    acknowledgeAfterHoursUnlock()
    startAfterHours()
  }

  return <AfterHoursUnlockOverlay isVisible={isVisible} onComplete={handleComplete} />
}

export default function App() {
  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-neutral-100 text-slate-950">
      <GameCanvas />
      <TabPauseSystem />
      <VenueBgmSystem />
      <GameTimerSystem />
      <StagePrepareSystem />
      <TargetVrmPreloader />
      <TargetPreviewCapture />
      <GameTimer />
      <MobileTopBar />
      <HUD />
      <DialogueSystem />
      <InteractionPrompt />
      <TargetHUD />
      <MiniMap />
      <MobileControls />
      <DialogueBox />
      <LoadingScreen />
      <ErrorMessage />
      <StartScreen />
      <AfterHoursUnlockGate />
      <TipsOverlay />
      <PrepareOverlay />
      <ClearOverlay />
      <TimeUpOverlay />
      <DevBootstrapBanner />
      <Analytics />
    </main>
  )
}
