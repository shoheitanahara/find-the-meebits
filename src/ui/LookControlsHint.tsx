import { useEffect, useState } from 'react'
import { isTouchUiMode } from '../game/perfConfig'
import { getLocale } from '../i18n/locale'

const HIDE_MS = 5200

/**
 * 画面ドラッグ／クリック視点があるアトラクション向けの軽い案内。
 * 入場直後だけ表示し、数秒で消える。
 * SP は左下スティックと被らないよう画面中央寄りに出す。
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
      ? '画面をフリックして視点を変えられます'
      : 'Flick the screen to look around'
    : locale === 'ja'
      ? 'クリックで視点操作 · マウスで見回す · Escで解除'
      : 'Click to look · Move mouse to look around · Esc to release'

  return (
    <div
      className={`pointer-events-none absolute z-40 flex justify-center transition-opacity duration-700 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${
        touch
          ? // スティック（左下）と Talk（右下）を避け、画面中央やや下
            'left-1/2 top-[48%] w-[min(20rem,calc(100%-5.5rem))] -translate-x-1/2 -translate-y-1/2 phone-land:top-[46%]'
          : 'inset-x-0 bottom-[max(1.75rem,env(safe-area-inset-bottom))]'
      } ${className}`}
      aria-hidden
    >
      <p className="rounded-full border border-white/15 bg-black/50 px-3.5 py-1.5 text-center text-[0.65rem] leading-snug tracking-wide text-white/75 shadow-lg backdrop-blur-sm">
        {text}
      </p>
    </div>
  )
}
