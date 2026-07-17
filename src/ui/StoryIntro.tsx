import { ui } from '../i18n/ui'
import { LanguageSwitcher } from './LanguageSwitcher'
import { playSfx, unlockAudioIfNeeded } from './sfx'
import { markStoryIntroSeen } from './storyIntroStorage'

const STORY_VIDEO_SRC = '/video/meebits-4274-3s.gif'

export function StoryIntro({ onComplete }: { onComplete: () => void }) {
  const t = ui()

  const finish = () => {
    unlockAudioIfNeeded()
    playSfx('uiConfirm')
    markStoryIntroSeen()
    onComplete()
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-50 overflow-y-auto bg-neutral-950/80 p-4 backdrop-blur-sm max-lg:flex max-lg:items-center max-lg:justify-center max-lg:p-3 max-lg:py-[max(0.5rem,env(safe-area-inset-top))] lg:grid lg:place-items-center lg:p-6">
      <section
        className="relative grid w-full max-w-4xl gap-6 rounded-[2rem] border border-white/15 bg-neutral-50 p-5 text-neutral-950 shadow-2xl max-lg:max-h-[calc(100dvh-1rem)] max-lg:gap-3 max-lg:overflow-y-auto max-lg:rounded-3xl max-lg:p-4 lg:grid-cols-[minmax(0,17rem)_1fr] lg:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="story-intro-title"
      >
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white max-lg:mx-auto max-lg:aspect-square max-lg:w-full max-lg:max-w-[14rem] lg:aspect-square lg:self-start">
          <img
            className="h-full w-full object-contain"
            src={STORY_VIDEO_SRC}
            alt=""
            aria-hidden="true"
          />
        </div>

        <div className="relative min-w-0">
          <LanguageSwitcher className="absolute right-0 top-0 z-10" tone="light" />

          <p className="pr-24 text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 max-lg:pr-20 max-lg:text-[0.6rem] max-lg:tracking-[0.25em]">
            {t.storyBrand}
          </p>
          <h1
            id="story-intro-title"
            className="mt-3 text-3xl font-black tracking-tight max-lg:mt-2 max-lg:text-xl lg:text-4xl"
          >
            {t.storyGameTitle}
          </h1>

          <div className="mt-5 space-y-4 text-base leading-relaxed text-neutral-600 max-lg:mt-3 max-lg:space-y-3 max-lg:text-sm max-lg:leading-snug">
            <p>{t.storyAbout}</p>
            <p>{t.storySetting}</p>
            <p>
              <span className="font-semibold text-neutral-950">{t.storyMission}</span>
            </p>
            <p>{t.storyPlay}</p>
            <p>{t.storyWish}</p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 max-lg:mt-4">
            <button
              type="button"
              onClick={finish}
              className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-neutral-500 transition hover:text-neutral-950"
            >
              {t.storySkip}
            </button>
            <button
              type="button"
              onClick={finish}
              className="rounded-full bg-neutral-950 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800 max-lg:px-4 max-lg:py-2.5 max-lg:text-xs"
            >
              {t.storyCta}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
