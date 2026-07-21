import { Canvas } from '@react-three/fiber'
import { useCallback, useLayoutEffect, useState } from 'react'
import { getEnableAntialias, getMaxCanvasDpr } from '../game/perfConfig'
import { getLocale } from '../i18n/locale'
import { usePlayerStore } from '../stores/playerStore'
import { normalizePlayerMeebitNumber } from '../systems/save/localStorage'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { playSfx, unlockAudioIfNeeded } from '../ui/sfx'
import { TargetPreview } from '../ui/TargetPreview'
import { TargetPreviewCapture } from '../ui/TargetPreviewCapture'
import { TopMobileControls } from './TopControls'
import { TOP_ATTRACTIONS } from './topConfig'
import { TopScene } from './TopScene'
import { useTopStore, type AttractionId } from './topStore'

const copy = {
  en: {
    eyebrow: 'Find the Meebits',
    title: 'Meebits Park',
    subtitle: 'Choose your Meebit and explore three attractions.',
    avatar: 'Your Meebit',
    random: 'Random',
    enterPark: 'Enter the Park',
    controls: 'WASD / Arrow keys — Move',
    mobileControls: 'Use the joystick to move',
    approach: 'Walk up to an attraction entrance.',
    enter: 'Enter',
    attractions: {
      find: 'Find the Meebit',
      traits: 'Trait Hunt',
      street: '8th Street',
    },
  },
  ja: {
    eyebrow: 'Find the Meebits',
    title: 'ミービッツ・パーク',
    subtitle: '自分のMeebitを選んで、3つのアトラクションを巡ろう。',
    avatar: 'あなたのMeebit',
    random: 'ランダム',
    enterPark: 'パークに入る',
    controls: 'WASD / 矢印キー — 移動',
    mobileControls: 'スティックで移動',
    approach: 'アトラクションの入口まで歩いてください。',
    enter: '入る',
    attractions: {
      find: 'Find the Meebit',
      traits: 'トレイトハント',
      street: '8番ストリート',
    },
  },
} as const

function getAttractionPath(id: AttractionId) {
  const localePrefix = getLocale() === 'ja' ? '/jp' : ''
  if (id === 'find') return localePrefix || '/'
  if (id === 'traits') return `${localePrefix}/v2`
  return `${localePrefix}/8th-street`
}

function getReturningAttractionId(): AttractionId | null {
  if (typeof window === 'undefined') return null

  const from = new URLSearchParams(window.location.search).get('from')
  return from === 'find' || from === 'traits' || from === 'street' ? from : null
}

export function TopApp() {
  const locale = getLocale()
  const t = copy[locale]
  const started = useTopStore((state) => state.started)
  const nearestAttraction = useTopStore((state) => state.nearestAttraction)
  const savedMeebit = usePlayerStore((state) => state.meebitNumber)
  const [meebitInput, setMeebitInput] = useState(String(savedMeebit))
  const [returningAttractionId] = useState(getReturningAttractionId)
  const isReturningFromGame = returningAttractionId !== null
  const previewMeebitNumber = normalizePlayerMeebitNumber(meebitInput)

  useLayoutEffect(() => {
    if (!returningAttractionId) return

    const attraction = TOP_ATTRACTIONS.find((item) => item.id === returningAttractionId)
    if (!attraction) return

    useTopStore.getState().start(usePlayerStore.getState().meebitNumber, {
      x: attraction.x,
      z: attraction.entranceZ + 2.2,
      rotationY: Math.PI,
    })

    // 帰還判定だけをURLから消し、更新後は通常のパークURLとして扱う。
    const url = new URL(window.location.href)
    url.searchParams.delete('from')
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }, [returningAttractionId])

  const enterAttraction = useCallback((id: AttractionId) => {
    // 遷移先のゲームが同じアバターIDを復元できるよう、移動前に保存する。
    usePlayerStore.getState().setMeebitNumber(useTopStore.getState().meebitNumber)
    void unlockAudioIfNeeded().then(() => {
      playSfx('uiConfirm')
      window.location.assign(getAttractionPath(id))
    })
  }, [])

  const startPark = () => {
    const meebitNumber = normalizePlayerMeebitNumber(meebitInput)
    setMeebitInput(String(meebitNumber))
    usePlayerStore.getState().setMeebitNumber(meebitNumber)
    useTopStore.getState().start(meebitNumber)
    void unlockAudioIfNeeded().then(() => playSfx('timerStart'))
  }

  const randomizeMeebit = () => {
    const next = Math.floor(Math.random() * 20000) + 1
    setMeebitInput(String(next))
    void unlockAudioIfNeeded().then(() => playSfx('uiClick'))
  }

  const nearest = nearestAttraction
    ? TOP_ATTRACTIONS.find((attraction) => attraction.id === nearestAttraction)
    : null

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#070914] text-[#f4ead2]">
      <Canvas
        dpr={[1, Math.min(getMaxCanvasDpr(), 1.5)]}
        shadows
        gl={{ antialias: getEnableAntialias(), powerPreference: 'high-performance' }}
        className="absolute inset-0"
      >
        <TopScene onEnter={enterAttraction} />
      </Canvas>
      <TargetPreviewCapture />

      {!started && !isReturningFromGame ? (
        <div className="absolute inset-0 z-40 flex items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_50%_16%,rgba(88,64,122,0.32),transparent_42%),linear-gradient(180deg,rgba(3,5,16,0.42),rgba(3,5,16,0.84))] px-4 py-6 backdrop-blur-[4px]">
          <LanguageSwitcher className="absolute right-4 top-4 z-10" tone="dark" />
          <section className="relative w-full max-w-3xl overflow-hidden rounded-[1.75rem] border border-[#d4b46a]/35 bg-[#0c0d18]/92 shadow-[0_28px_90px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)]">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#f1d48c] to-transparent" />
            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <div className="relative flex min-h-72 items-center justify-center overflow-hidden border-b border-[#d4b46a]/20 bg-[radial-gradient(circle_at_50%_38%,rgba(134,86,166,0.3),transparent_45%),linear-gradient(160deg,#171225,#080a14)] p-7 md:border-b-0 md:border-r">
                <div className="absolute inset-5 rounded-full border border-[#d4b46a]/10" />
                <div className="absolute inset-10 rounded-full border border-[#d4b46a]/10" />
                <div className="relative">
                  <div className="absolute -inset-3 rounded-[2rem] bg-[#d4b46a]/10 blur-xl" />
                  <TargetPreview
                    meebitNumber={previewMeebitNumber}
                    sizeClassName="relative h-52 w-52 rounded-[1.5rem] border border-[#d4b46a]/40 bg-[#10111d] shadow-2xl sm:h-60 sm:w-60"
                  />
                  <p className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[0.62rem] font-bold tracking-[0.18em] text-[#f1d48c] backdrop-blur">
                    MEEBIT&nbsp; #{previewMeebitNumber}
                  </p>
                </div>
              </div>

              <div className="p-6 sm:p-9">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.38em] text-[#caa75b]">
                  {t.eyebrow}
                </p>
                <h1 className="mt-3 font-[family-name:Georgia,Times_New_Roman,serif] text-4xl leading-none text-[#f4ead2] sm:text-5xl">
                  {t.title}
                </h1>
                <div className="mt-4 h-px w-14 bg-[#caa75b]" />
                <p className="mt-4 max-w-sm text-sm leading-6 text-[#b8b2a6]">{t.subtitle}</p>

                <div className="mt-7">
                  <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="top-meebit-number"
                      className="text-[0.64rem] font-semibold uppercase tracking-[0.2em] text-[#d8c9aa]"
                >
                  {t.avatar}
                </label>
                <button
                  type="button"
                      className="rounded-full border border-[#d4b46a]/35 bg-[#d4b46a]/10 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#e9cf91] transition hover:border-[#e9cf91]/70 hover:bg-[#d4b46a]/20"
                  onClick={randomizeMeebit}
                >
                  {t.random}
                </button>
              </div>
                <input
                  id="top-meebit-number"
                  type="number"
                  min={1}
                  max={20000}
                  inputMode="numeric"
                  value={meebitInput}
                  onChange={(event) => setMeebitInput(event.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-black/25 px-4 py-3 font-[family-name:Georgia,Times_New_Roman,serif] text-2xl text-[#f4ead2] outline-none transition placeholder:text-white/20 focus:border-[#d4b46a]/70 focus:ring-2 focus:ring-[#d4b46a]/10"
                />
              </div>

            <button
              type="button"
                  className="mt-5 w-full rounded-lg border border-[#ead394]/50 bg-gradient-to-b from-[#b18a3f] to-[#7f5d22] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.22em] text-[#fff9e9] shadow-[0_10px_30px_rgba(136,96,28,0.25),inset_0_1px_0_rgba(255,255,255,0.28)] transition hover:brightness-110 active:scale-[0.99]"
              onClick={startPark}
            >
              {t.enterPark}
            </button>
              </div>
            </div>
          </section>
        </div>
      ) : (
        <>
          <div className="pointer-events-none absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] z-20 rounded-lg border border-[#d4b46a]/30 bg-[#080912]/80 px-4 py-3 text-[#f4ead2] shadow-2xl backdrop-blur-md">
            <p className="font-[family-name:Georgia,Times_New_Roman,serif] text-xs uppercase tracking-[0.2em] text-[#e2c77f]">
              Meebits Park
            </p>
            <p className="mt-1.5 hidden text-[0.68rem] text-[#d2c9b7] lg:block">{t.controls}</p>
            <p className="mt-1.5 text-[0.68rem] text-[#d2c9b7] lg:hidden">{t.mobileControls}</p>
            <p className="mt-0.5 text-[0.64rem] text-[#8f897e]">{t.approach}</p>
          </div>

          {nearest && nearestAttraction ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-[max(1.25rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-4 max-lg:bottom-36">
              <button
                type="button"
                className="pointer-events-auto rounded-full border border-[#ead394]/60 bg-[#11111d]/90 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#f1d48c] shadow-2xl backdrop-blur transition hover:bg-[#2a2230] active:scale-95"
                onClick={() => enterAttraction(nearestAttraction)}
              >
                {t.attractions[nearestAttraction]} — {t.enter}
              </button>
            </div>
          ) : null}

          <TopMobileControls />
        </>
      )}
    </main>
  )
}
