const SHAWN_X_URL = 'https://x.com/shawn_t_art'

/**
 * 入場前: 非公式ファンプロジェクトであることのクレジット。
 * 文言は EN 固定（Visit Pass の disclaimer と同様）。
 */
export function ParkCreatorCredit({ className = '' }: { className?: string }) {
  return (
    <p
      className={`mt-3 text-[0.68rem] leading-5 text-[#8a8478] ${className}`.trim()}
    >
      Unofficial fan project by{' '}
      <a
        href={SHAWN_X_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-[#c9b48a] underline decoration-[#c9b48a]/35 underline-offset-2 transition hover:text-[#e2c77f] hover:decoration-[#e2c77f]/70"
      >
        Shawn T. Art
      </a>
      {' ・ '}
      Not affiliated with Meeb Co.
    </p>
  )
}
