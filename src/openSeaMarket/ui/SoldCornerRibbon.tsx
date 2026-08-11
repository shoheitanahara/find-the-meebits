/** 商品カード風の左上コーナリボン */
export function SoldCornerRibbon({ label = 'SOLD' }: { label?: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      aria-hidden
    >
      <div className="absolute -left-[2.7rem] top-[1.05rem] w-[10.2rem] rotate-[-45deg] bg-gradient-to-b from-[#d42a3d] via-[#b01c30] to-[#7a1220] py-[0.32rem] text-center shadow-[0_1px_0_#4a0c16]">
        <span
          className="block text-[0.78rem] font-black tracking-[0.2em] text-[#e8c56a]"
          style={{ textShadow: '0 1px 0 #3a0a10, 0 0 0 #3a0a10' }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
