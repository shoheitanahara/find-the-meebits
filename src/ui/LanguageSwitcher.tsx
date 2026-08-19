import { getLocale, getLocaleHomePath, type Locale } from '../i18n/locale'
import { ui } from '../i18n/ui'
import { saveParkLocaleResume } from '../top/parkSession'

/** ParkReturnButton ヘッダー直下・右上（各アトラクション共通） */
export const LANGUAGE_SWITCHER_ATTRACTION_CLASS =
  'pointer-events-auto absolute right-3 top-[max(3.25rem,calc(env(safe-area-inset-top)+2.75rem))] z-[60] sm:right-4 phone-land:top-[max(2.35rem,calc(env(safe-area-inset-top)+1.85rem))]'

export function LanguageSwitcher({
  className = '',
  tone = 'dark',
  persistParkSessionOnSwitch = false,
}: {
  className?: string
  tone?: 'light' | 'dark'
  /** パーク内で言語切替したとき、位置を保持して同じ場所から再開 */
  persistParkSessionOnSwitch?: boolean
}) {
  const current = getLocale()
  const t = ui()
  const linkClass =
    tone === 'dark'
      ? 'rounded-full px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] transition'
      : 'rounded-full px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] transition'

  const activeClass =
    tone === 'dark'
      ? 'bg-fuchsia-500 text-white'
      : 'bg-neutral-950 text-white'

  const idleClass =
    tone === 'dark'
      ? 'text-fuchsia-100/80 hover:text-white'
      : 'text-neutral-500 hover:text-neutral-950'

  return (
    <nav className={`inline-flex items-center gap-1 ${className}`} aria-label="Language">
      {(['en', 'ja'] as const).map((locale: Locale) => {
        const href = getLocaleHomePath(locale)
        const isActive = current === locale

        return (
          <a
            key={locale}
            href={href}
            className={`${linkClass} ${isActive ? activeClass : idleClass}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => {
              if (isActive || !persistParkSessionOnSwitch) return
              saveParkLocaleResume()
            }}
          >
            {locale === 'ja' ? t.langJa : t.langEn}
          </a>
        )
      })}
    </nav>
  )
}
