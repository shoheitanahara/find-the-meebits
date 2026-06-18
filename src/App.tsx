import { GameCanvas } from './game/GameCanvas'
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
import { StartScreen } from './ui/StartScreen'
import { TargetHUD } from './ui/TargetHUD'

export default function App() {
  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-neutral-100 text-slate-950">
      <GameCanvas />
      <GameTimerSystem />
      <StagePrepareSystem />
      <TargetVrmPreloader />
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
      <TipsOverlay />
      <PrepareOverlay />
      <ClearOverlay />
      <TimeUpOverlay />
    </main>
  )
}
