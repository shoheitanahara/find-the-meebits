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
import { recordOpenSeaVisit } from '../park/dailyRecords'
import { OPEN_SEA_MARKET } from './config'
import { MarketDialogueBox } from './dialogue/MarketDialogueBox'
import { MarketDialogueSystem, MarketInteractionPrompt } from './dialogue/MarketDialogueSystem'
import { pickSessionGalleries, pickSessionWalkerIds } from './pickSessionListings'
import { MarketPlayer } from './player/MarketPlayer'
import { MarketMobileControls } from './player/MarketMobileControls'
import { MarketTouchLookPad } from './player/MarketTouchLookPad'
import { resetOpenSeaMarketPlayerWorld } from './playerWorld'
import { useOpenSeaMarketStore } from './store'
import { MarketBgmSystem } from './MarketBgmSystem'
import { MarketGalleryFade } from './ui/MarketGalleryFade'
import { MarketLoadingOverlay } from './ui/MarketLoadingOverlay'
import { MarketMinimap } from './ui/MarketMinimap'
import { MarketExitPad } from './world/MarketExitPad'
import { MarketGalleryPortals } from './world/MarketGalleryPortals'
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
        far={160}
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
      <MarketGalleryPortals />
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
      const galleries = pickSessionGalleries(payload.listings)
      const excludeIds = galleries.flatMap((room) => room.map((p) => p.tokenId))
      const walkerIds = pickSessionWalkerIds(excludeIds, OPEN_SEA_MARKET.maxWalkers)
      useOpenSeaMarketStore
        .getState()
        .setSession(payload.listings, galleries, walkerIds, payload.error ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // 彫刻＋walker 待ちでオーバーレイが固まらないようにする
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const state = useOpenSeaMarketStore.getState()
      if (state.bootPhase !== 'ready' && state.listingsLoaded && state.playerVrmReady) {
        console.warn('[OpenSeaMarket] boot timeout — forcing ready')
        state.forceReady()
      }
    }, 50_000)
    return () => window.clearTimeout(timer)
  }, [])

  // ギャラリー切替の台座ロードが長引いたときフェード解除
  useEffect(() => {
    if (bootPhase !== 'ready') return
    const timer = window.setInterval(() => {
      const state = useOpenSeaMarketStore.getState()
      if (!state.isSwitchingGallery) return
      if (state.pedestalsReadyCount >= state.pedestalsExpected) {
        state.finishGallerySwitch()
        return
      }
    }, 400)
    const forceTimer = window.setTimeout(() => {
      const state = useOpenSeaMarketStore.getState()
      if (state.isSwitchingGallery) {
        console.warn('[OpenSeaMarket] gallery switch timeout — revealing')
        state.finishGallerySwitch()
      }
    }, 20_000)
    return () => {
      window.clearInterval(timer)
      window.clearTimeout(forceTimer)
    }
  }, [bootPhase])

  useEffect(() => {
    if (bootPhase !== 'ready') return
    recordOpenSeaVisit()
  }, [bootPhase])

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
      <MarketBgmSystem />
      <MarketLoadingOverlay />
      <MarketGalleryFade />
      {bootPhase === 'ready' ? (
        <>
          <MarketDialogueSystem />
          <MarketDialogueBox />
          <MarketInteractionPrompt />
          <MarketMinimap />
          <MarketTouchLookPad />
          <MarketMobileControls />
        </>
      ) : null}
    </main>
  )
}
