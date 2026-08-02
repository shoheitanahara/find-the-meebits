import { useEffect, useState } from 'react'
import { getLocale } from '../i18n/locale'
import { getParkDailyResetCopy } from './parkDailyReset'

/** 入場前に日替わりリセットと残り時間を示す。 */
export function ParkDailyResetNotice({ compact = false }: { compact?: boolean }) {
  const locale = getLocale()
  const [copy, setCopy] = useState(() => getParkDailyResetCopy(locale))

  useEffect(() => {
    const tick = () => setCopy(getParkDailyResetCopy(locale))
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [locale])

  if (compact) {
    return (
      <p className="mt-3 text-[0.7rem] leading-5 text-[#caa75b]/90">
        <span className="font-semibold text-[#e2c77f]">{copy.title}</span>
        {' — '}
        {copy.summary} {copy.countdownLine}
      </p>
    )
  }

  return (
    <div className="mt-4 rounded-2xl border border-[#d4b46a]/25 bg-[#141522]/85 px-3.5 py-3">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#e2c77f]">
        {copy.title}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-[#b8b2a6]">{copy.summary}</p>
      <p className="mt-1.5 text-xs font-semibold tabular-nums leading-relaxed text-[#f1d48c]">
        {copy.countdownLine}
      </p>
    </div>
  )
}
