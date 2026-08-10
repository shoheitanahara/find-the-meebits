import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import {
  LANGUAGE_SWITCHER_ATTRACTION_CLASS,
  LanguageSwitcher,
} from '../ui/LanguageSwitcher'
import { TargetPreviewCapture } from '../ui/TargetPreviewCapture'
import { loadMeebitsListings } from '../opensea/loadMeebitsListings'
import { OPEN_SEA_MARKET } from './config'
import { MarketDialogueBox } from './dialogue/MarketDialogueBox'
import { MarketDialogueSystem, MarketInteractionPrompt } from './dialogue/MarketDialogueSystem'
import { pickSessionListings } from './pickSessionListings'
import { MarketPlayer } from './player/MarketPlayer'
import { MarketMobileControls } from './player/MarketMobileControls'
import { MarketTouchLookPad } from './player/MarketTouchLookPad'
import { resetOpenSeaMarketPlayerWorld } from './playerWorld'
import { useOpenSeaMarketStore } from './store'
import { MarketLoadingOverlay } from './ui/MarketLoadingOverlay'
import { MarketExitPad } from './world/MarketExitPad'
import { MarketRoom } from './world/MarketRoom'

function useTabFrameloop() {
  const [frameloop, setFrameloop] = useState<'always' | 'never'>(() =>
    typeof document !== 'undefined' && document.visibilityState === 'hidden' ? 'never' : 'always',
  )

  useEffect(() => {
    const onVisibilityChange = () => {
      setFrameloop(document.visibilityState === 'hidden' ? 'never' : 'always')
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return frameloop
}

function MarketScene() {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={50}
        near={0.1}
        far={120}
        position={[
          OPEN_SEA_MARKET.playerStart.x + OPEN_SEA_MARKET.cameraFollow.x,
          OPEN_SEA_MARKET.cameraFollow.y,
          Math.min(
            OPEN_SEA_MARKET.playerStart.z + OPEN_SEA_MARKET.cameraFollow.z,
            OPEN_SEA_MARKET.roomMaxZ - 1.0,
          ),
        ]}
      />
      <MarketRoom />
      <MarketExitPad />
      <MarketPlayer />
    </>
  )
}

export function OpenSeaMarketApp() {
  const frameloop = useTabFrameloop()
  const bootPhase = useOpenSeaMarketStore((state) => state.bootPhase)

  useState(() => {
    useOpenSeaMarketStore.getState().resetBoot()
    resetOpenSeaMarketPlayerWorld(
      OPEN_SEA_MARKET.playerStart.x,
      OPEN_SEA_MARKET.playerStart.z,
      OPEN_SEA_MARKET.playerStart.rotationY,
    )
  })

  useEffect(() => {
    let cancelled = false
    void loadMeebitsListings().then((payload) => {
      if (cancelled) return
      if (payload.error) {
        console.warn('[OpenSeaMarket] listings error:', payload.error)
      }
      const session = pickSessionListings(payload.listings)
      useOpenSeaMarketStore
        .getState()
        .setListings(payload.listings, session, payload.error ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // walker VRM 待ちでオーバーレイが固まらないようにする
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const state = useOpenSeaMarketStore.getState()
      if (state.bootPhase !== 'ready' && state.listingsLoaded && state.playerVrmReady) {
        console.warn('[OpenSeaMarket] boot timeout — forcing ready')
        state.forceReady()
      }
    }, 35_000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#0c1522] text-[#e8f4ff]">
      <Canvas
        frameloop={frameloop}
        dpr={[1, Math.min(getMaxCanvasDpr(), 1.5)]}
        shadows
        gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
        className="absolute inset-0"
      >
        <MarketScene />
      </Canvas>

      <ParkReturnButton />
      <LanguageSwitcher className={LANGUAGE_SWITCHER_ATTRACTION_CLASS} />
      <TargetPreviewCapture />
      <MarketLoadingOverlay />
      {bootPhase === 'ready' ? (
        <>
          <MarketDialogueSystem />
          <MarketDialogueBox />
          <MarketInteractionPrompt />
          <MarketTouchLookPad />
          <MarketMobileControls />
        </>
      ) : null}
    </main>
  )
}
