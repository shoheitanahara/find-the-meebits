import { useEffect } from 'react'
import { getLocale } from '../../i18n/locale'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { usePodcastStore } from '../store'
import { seekPodcastYoutubeBy } from '../youtubePlayer'

const SEEK_SECONDS = 30

const copy = {
  en: {
    back: '-30',
    forward: '+30',
    backLabel: 'Back 30 seconds',
    forwardLabel: 'Forward 30 seconds',
  },
  ja: {
    back: '-30',
    forward: '+30',
    backLabel: '30秒戻る',
    forwardLabel: '30秒進む',
  },
} as const

function seekBy(delta: number) {
  if (usePodcastStore.getState().phase !== 'playing') return
  void unlockAudioIfNeeded().then(() => {
    if (seekPodcastYoutubeBy(delta)) playSfx('uiClick')
  })
}

/** J / L で ±30 秒 */
export function usePodcastSeekKeyboard() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if (usePodcastStore.getState().phase !== 'playing') return
      if (event.code === 'KeyJ') {
        event.preventDefault()
        seekBy(-SEEK_SECONDS)
        return
      }
      if (event.code === 'KeyL') {
        event.preventDefault()
        seekBy(SEEK_SECONDS)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

type SeekVariant = 'desktop' | 'mobile'

export function PodcastSeekButtons({ variant = 'desktop' }: { variant?: SeekVariant }) {
  const locale = getLocale()
  const t = copy[locale]

  if (variant === 'mobile') {
    return (
      <>
        <SeekCircleButton label={t.backLabel} text={t.back} onSeek={() => seekBy(-SEEK_SECONDS)} accent="orange" />
        <SeekCircleButton label={t.forwardLabel} text={t.forward} onSeek={() => seekBy(SEEK_SECONDS)} accent="orange" />
      </>
    )
  }

  return (
    <>
      <SeekPillButton
        label={t.backLabel}
        text={t.back}
        hint="J"
        onSeek={() => seekBy(-SEEK_SECONDS)}
        accent="orange"
      />
      <SeekPillButton
        label={t.forwardLabel}
        text={t.forward}
        hint="L"
        onSeek={() => seekBy(SEEK_SECONDS)}
        accent="orange"
      />
    </>
  )
}

function SeekPillButton({
  label,
  text,
  hint,
  onSeek,
  accent,
}: {
  label: string
  text: string
  hint: string
  onSeek: () => void
  accent: 'orange' | 'cyan'
}) {
  const border =
    accent === 'orange'
      ? 'border-orange-200/35 hover:border-orange-200/60 text-orange-50'
      : 'border-cyan-200/35 hover:border-cyan-200/60 text-cyan-50'
  return (
    <button
      type="button"
      aria-label={label}
      className={`pointer-events-auto inline-flex items-center gap-2 rounded-full border bg-black/70 px-3.5 py-2 shadow-lg backdrop-blur-md transition hover:bg-black/85 ${border}`}
      onClick={onSeek}
    >
      <span className="text-[0.7rem] font-bold uppercase tracking-[0.14em]">{text}</span>
      <kbd className="rounded border border-white/25 bg-white/10 px-1.5 py-0.5 text-[0.58rem] font-bold tracking-[0.08em] text-white/70">
        {hint}
      </kbd>
    </button>
  )
}

function SeekCircleButton({
  label,
  text,
  onSeek,
  accent,
}: {
  label: string
  text: string
  onSeek: () => void
  accent: 'orange' | 'cyan'
}) {
  const border = accent === 'orange' ? 'border-orange-200/45 text-orange-50' : 'border-cyan-200/45 text-cyan-50'
  return (
    <button
      type="button"
      aria-label={label}
      className={`pointer-events-auto flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 bg-neutral-950/85 shadow-2xl backdrop-blur-md active:scale-95 ${border}`}
      onPointerDown={(event) => {
        event.preventDefault()
        onSeek()
      }}
    >
      <span className="text-[0.7rem] font-black tracking-[0.04em]">{text}</span>
    </button>
  )
}
