import { getLocale, getLocaleHomePath, type Locale } from '../i18n/locale'
import { ui } from '../i18n/ui'

export function LanguageSwitcher({
  className = '',
  tone = 'light',
}: {
  className?: string
  tone?: 'light' | 'dark'
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
          >
            {locale === 'ja' ? t.langJa : t.langEn}
          </a>
        )
      })}
    </nav>
  )
}
