import { useEffect, useState } from 'react'
import { isTouchUiMode } from '../game/perfConfig'
import { getLocale } from '../i18n/locale'

const HIDE_MS = 5200

/**
 * 画面ドラッグ／クリック視点があるアトラクション向けの軽い案内。
 * 入場直後だけ表示し、数秒で消える。画面中央に出して下部操作と被らないようにする。
 */
export function LookControlsHint({ className = '' }: { className?: string }) {
  const [visible, setVisible] = useState(true)
  const locale = getLocale()
  const touch = isTouchUiMode()

  useEffect(() => {
    const id = window.setTimeout(() => setVisible(false), HIDE_MS)
    return () => window.clearTimeout(id)
  }, [])

  if (!visible) return null

  const text = touch
    ? locale === 'ja'
      ? '画面をドラッグして視点を変えられます'
      : 'Drag the screen to look around'
    : locale === 'ja'
      ? 'クリック後、ドラッグで見回す · Escで解除'
      : 'Click, then drag to look around · Esc to release'

  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 z-40 flex w-[min(22rem,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 justify-center transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
      aria-hidden
    >
      <p className="rounded-full border border-white/15 bg-black/50 px-3.5 py-1.5 text-center text-[0.65rem] leading-snug tracking-wide text-white/75 shadow-lg backdrop-blur-sm">
        {text}
      </p>
    </div>
  )
}
