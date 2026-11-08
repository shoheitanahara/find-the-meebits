import { useEffect } from 'react'
import { getLocale } from '../../i18n/locale'
import { playSfx, unlockAudioIfNeeded } from '../../ui/sfx'
import { usePodcastStore } from '../store'
import { mutePodcastYoutube, unmutePodcastYoutube } from '../youtubePlayer'

const copy = {
  en: {
    on: 'Sound on',
    off: 'Mute',
    hint: 'M',
  },
  ja: {
    on: '音声オン',
    off: 'ミュート',
    hint: 'M',
  },
} as const

function togglePodcastSound() {
  const { soundMuted, setSoundMuted, phase } = usePodcastStore.getState()
  if (phase !== 'playing') return

  void unlockAudioIfNeeded().then(() => {
    if (soundMuted) {
      if (unmutePodcastYoutube()) {
        setSoundMuted(false)
        playSfx('uiConfirm')
      }
    } else if (mutePodcastYoutube()) {
      setSoundMuted(true)
      playSfx('uiClick')
    }
  })
}

/** M キーでミュート切替 */
export function usePodcastMuteKeyboard() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'KeyM') return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return
      }
      if (usePodcastStore.getState().phase !== 'playing') return
      event.preventDefault()
      togglePodcastSound()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}

type SoundButtonVariant = 'desktop' | 'mobile'

/** Sit / Stand と同じ並び用の音声トグル */
export function PodcastSoundToggleButton({ variant = 'desktop' }: { variant?: SoundButtonVariant }) {
  const soundMuted = usePodcastStore((state) => state.soundMuted)
  const locale = getLocale()
  const t = copy[locale]

  if (variant === 'mobile') {
    return (
      <button
        type="button"
        aria-pressed={!soundMuted}
        aria-label={soundMuted ? t.on : t.off}
        className="pointer-events-auto flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-orange-200/45 bg-neutral-950/85 text-orange-50 shadow-2xl backdrop-blur-md active:scale-95"
        onPointerDown={(event) => {
          event.preventDefault()
          togglePodcastSound()
        }}
      >
        {soundMuted ? <MutedIcon /> : <UnmutedIcon />}
        <span className="mt-1 text-[0.55rem] font-black uppercase tracking-[0.12em]">
          {soundMuted ? t.on : t.off}
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      aria-pressed={!soundMuted}
      aria-label={soundMuted ? t.on : t.off}
      className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-orange-200/35 bg-black/70 px-4 py-2 text-orange-50 shadow-lg backdrop-blur-md transition hover:border-orange-200/60 hover:bg-black/85"
      onClick={togglePodcastSound}
    >
      {soundMuted ? <MutedIcon /> : <UnmutedIcon />}
      <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em]">
        {soundMuted ? t.on : t.off}
      </span>
      <kbd className="rounded border border-white/25 bg-white/10 px-1.5 py-0.5 text-[0.58rem] font-bold tracking-[0.08em] text-white/70">
        {t.hint}
      </kbd>
    </button>
  )
}

function MutedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5 6 9H3v6h3l5 4V5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m16 9.5 5 5m0-5-5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function UnmutedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5 6 9H3v6h3l5 4V5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}
