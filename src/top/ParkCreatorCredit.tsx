import { getLocale } from '../i18n/locale'

const SHAWN_X_URL = 'https://x.com/shawn_t_art'

/**
 * 入場前: 非公式ファンプロジェクトであることのクレジット。
 */
export function ParkCreatorCredit({ className = '' }: { className?: string }) {
  const locale = getLocale()
  const linkClass =
    'font-semibold text-[#c9b48a] underline decoration-[#c9b48a]/35 underline-offset-2 transition hover:text-[#e2c77f] hover:decoration-[#e2c77f]/70'

  const nameLink = (
    <a
      href={SHAWN_X_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={linkClass}
    >
      Shawn T. Art
    </a>
  )

  return (
    <p className={`mt-3 text-[0.68rem] leading-5 text-[#8a8478] ${className}`.trim()}>
      {locale === 'ja' ? (
        <>
          {nameLink} による非公式ファンプロジェクト ・ Meeb Co. とは無関係です
        </>
      ) : (
        <>
          Unofficial fan project by {nameLink}
          {' ・ '}
          Not affiliated with Meeb Co.
        </>
      )}
    </p>
  )
}
