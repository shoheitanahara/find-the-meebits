import { Analytics } from '@vercel/analytics/react'
import { useEffect } from 'react'
import { GameCanvas } from './game/GameCanvas'
import { getCachedAppEdition } from './game/appEdition'
import { applyPageMetadata } from './game/pageMetadata'
import { getLocale } from './i18n/locale'
import { loadMeebitTraitsDataset } from './data/meebitTraits'
import { EightStreetApp } from './eightStreet/EightStreetApp'
import { MountainApp } from './mountain/MountainApp'
import { TopApp } from './top/TopApp'
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
import { IntroFlow } from './ui/IntroFlow'
import { TargetHUD } from './ui/TargetHUD'
import { TargetPreviewCapture } from './ui/TargetPreviewCapture'
import { ParkReturnButton } from './ui/ParkReturnButton'
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

function HuntApp() {
  useEffect(() => {
    if (getCachedAppEdition() === 'v2') {
      void loadMeebitTraitsDataset()
    }
  }, [])

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
      <ParkReturnButton />
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
      <IntroFlow />
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

export default function App() {
  const edition = getCachedAppEdition()

  useEffect(() => {
    applyPageMetadata(edition, getLocale())
  }, [edition])

  if (edition === 'top') {
    return (
      <>
        <TopApp />
        <Analytics />
      </>
    )
  }

  if (edition === '8th-street') {
    return (
      <>
        <EightStreetApp />
        <Analytics />
      </>
    )
  }

  if (edition === 'mountain') {
    return (
      <>
        <MountainApp />
        <Analytics />
      </>
    )
  }

  return <HuntApp />
}
