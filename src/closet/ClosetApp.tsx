import { useEffect, useMemo, useState } from 'react'
import { ensureClosetTypePools } from './closetPools'
import { getLocale } from '../i18n/locale'
import { usePlayerStore } from '../stores/playerStore'
import { LanguageSwitcher } from '../ui/LanguageSwitcher'
import { ParkReturnButton } from '../ui/ParkReturnButton'
import { playSfx, unlockAudioIfNeeded } from '../ui/sfx'
import { TargetPreview } from '../ui/TargetPreview'
import { TargetPreviewCapture } from '../ui/TargetPreviewCapture'
import { TraitQuestVisual } from '../ui/TraitQuestVisual'
import { formatTraitDisplayName } from '../game/traitHunt'
import { getMatchPreviewIds, applyTraitSelection, filterCompatibleTraitOptions } from './matchMeebits'
import {
  CLOSET_MATCH_PREVIEW_LIMIT,
  getClosetTraitTypes,
  getClosetTraitsByType,
  type ClosetTraitOption,
  type ClosetTraitSelection,
} from './traitCatalog'

const copy = {
  en: {
    eyebrow: 'Culture District',
    title: 'Look Locker',
    subtitle: 'Pick a type first — then mix looks and try them on.',
    typeStep: 'Step 1 · Type',
    typeHint: 'Who are you dressing up?',
    changeType: 'Change',
    looksStep: 'Step 2 · Looks',
    selectTypeFirst: 'Pick a type above to unlock looks.',
    matches: 'Matches',
    none: 'No Meebits match. Try fewer looks.',
    noCompatible: 'Nothing here works with your current picks.',
    more: (n: number) => `+${n} more`,
    loadMore: 'Show more',
    wear: 'Wear this look',
    wearing: 'Already wearing',
    clear: 'Clear',
    selected: 'Selected',
    nowLook: 'Now',
    newLook: 'New',
    sameLook: 'Same look',
  },
  ja: {
    eyebrow: 'カルチャー地区',
    title: 'ルックロッカー',
    subtitle: 'まずタイプ → 見た目を足す → きせかえ！',
    typeStep: 'ステップ1 · タイプ',
    typeHint: 'どんな Meebit をきせかえる？',
    changeType: '変更',
    looksStep: 'ステップ2 · 見た目',
    selectTypeFirst: '上でタイプを選ぶと、見た目を選べるよ。',
    matches: 'マッチ',
    none: '一致するMeebitがいないよ。条件を減らしてみて。',
    noCompatible: '今の選択と両立するものがありません。',
    more: (n: number) => `ほか ${n} 体`,
    loadMore: 'もっと見る',
    wear: 'この姿にきせかえ',
    wearing: 'いまこの姿',
    clear: 'クリア',
    selected: '選択中',
    nowLook: 'いま',
    newLook: 'ためし着',
    sameLook: '同じ姿',
  },
} as const

const CATEGORY_LABEL: Record<string, { en: string; ja: string }> = {
  Type: { en: 'Type', ja: 'タイプ' },
  'Hair Style': { en: 'Hair', ja: '髪型' },
  Hat: { en: 'Hat', ja: '帽子' },
  Glasses: { en: 'Glasses', ja: 'メガネ' },
  Beard: { en: 'Beard', ja: 'ヒゲ' },
  Shirt: { en: 'Shirt', ja: 'シャツ' },
  Overshirt: { en: 'Outer', ja: 'アウター' },
  Pants: { en: 'Pants', ja: 'パンツ' },
  Shoes: { en: 'Shoes', ja: 'くつ' },
  Necklace: { en: 'Necklace', ja: 'ネックレス' },
  Earring: { en: 'Earring', ja: 'ピアス' },
  Tattoo: { en: 'Tattoo', ja: 'タトゥー' },
}

function TraitOptionButton({
  option,
  selected,
  onToggle,
  compact = false,
}: {
  option: ClosetTraitOption
  selected: boolean
  onToggle: (option: ClosetTraitOption) => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(option)}
      className={`flex w-full flex-col items-center gap-1 self-start rounded-2xl border text-left transition ${
        compact ? 'p-1.5' : 'p-2'
      } ${
        selected
          ? 'border-[#f1d48c] bg-[#f1d48c]/15 shadow-[0_0_0_1px_rgba(241,212,140,0.35)]'
          : 'border-white/10 bg-black/20 hover:border-[#8eb4e8]/45 hover:bg-[#8eb4e8]/10'
      }`}
    >
      <TraitQuestVisual
        traitType={option.traitType}
        traitValue={option.traitValue}
        sizeClassName={
          compact
            ? 'h-12 w-full shrink-0 rounded-lg border-0 bg-[#f4f6fa] sm:h-14'
            : 'h-14 w-full shrink-0 rounded-xl border-0 bg-[#f4f6fa] sm:h-16'
        }
      />
      <span className="line-clamp-2 w-full text-center text-[0.55rem] font-semibold leading-snug text-[#dce6f5] sm:text-[0.58rem]">
        {formatTraitDisplayName(option.traitType, option.traitValue)}
      </span>
    </button>
  )
}

function returnToPark(locale: 'en' | 'ja') {
  const parkPath = locale === 'ja' ? '/jp' : '/'
  window.location.assign(`${parkPath}?from=closet`)
}

export function ClosetApp() {
  const locale = getLocale()
  const t = copy[locale]
  const savedMeebit = usePlayerStore((state) => state.meebitNumber)
  const setMeebitNumber = usePlayerStore((state) => state.setMeebitNumber)

  const traitTypes = useMemo(() => getClosetTraitTypes(), [])
  const traitsByType = useMemo(() => getClosetTraitsByType(), [])
  const lookTraitTypes = useMemo(() => traitTypes.filter((type) => type !== 'Type'), [traitTypes])
  const typeOptions = useMemo(() => traitsByType.get('Type') ?? [], [traitsByType])

  const [activeLookType, setActiveLookType] = useState(lookTraitTypes[0] ?? 'Hair Style')
  const [selections, setSelections] = useState<ClosetTraitSelection[]>([])
  const [previewId, setPreviewId] = useState(savedMeebit)
  const [typePickerOpen, setTypePickerOpen] = useState(true)
  const [matchLimit, setMatchLimit] = useState(CLOSET_MATCH_PREVIEW_LIMIT)

  useEffect(() => {
    void ensureClosetTypePools()
  }, [])

  useEffect(() => {
    if (selections.length === 0) {
      setPreviewId(savedMeebit)
    }
  }, [savedMeebit, selections.length])

  const selectedType = selections.find((item) => item.traitType === 'Type')
  const hasTypeSelected = Boolean(selectedType)

  useEffect(() => {
    if (!hasTypeSelected) {
      setTypePickerOpen(true)
    }
  }, [hasTypeSelected])

  const activeOptions = traitsByType.get(activeLookType) ?? []
  const compatibleOptions = useMemo(
    () => (hasTypeSelected ? filterCompatibleTraitOptions(selections, activeOptions) : []),
    [activeOptions, hasTypeSelected, selections],
  )
  const compatibleCountByType = useMemo(() => {
    const counts = new Map<string, number>()
    for (const type of lookTraitTypes) {
      const options = traitsByType.get(type) ?? []
      counts.set(type, filterCompatibleTraitOptions(selections, options).length)
    }
    return counts
  }, [lookTraitTypes, selections, traitsByType])

  // Human 以外は Hair Style が実質 Bald のみなので、選択肢タブから外す。
  const availableLookTypes = useMemo(() => {
    const isHuman = selectedType?.traitValue === 'Human'
    return lookTraitTypes.filter((type) => {
      if (!isHuman && type === 'Hair Style') return false
      return (compatibleCountByType.get(type) ?? 0) > 0
    })
  }, [compatibleCountByType, lookTraitTypes, selectedType?.traitValue])

  useEffect(() => {
    setMatchLimit(CLOSET_MATCH_PREVIEW_LIMIT)
  }, [selections])

  const match = useMemo(
    () => getMatchPreviewIds(selections, matchLimit, savedMeebit),
    [matchLimit, savedMeebit, selections],
  )

  useEffect(() => {
    if (!hasTypeSelected) return
    if ((compatibleCountByType.get(activeLookType) ?? 0) > 0) return
    const fallback = availableLookTypes[0]
    if (fallback) setActiveLookType(fallback)
  }, [activeLookType, availableLookTypes, compatibleCountByType, hasTypeSelected])

  useEffect(() => {
    if (selections.length === 0) return
    if (match.ids.length === 0) return
    if (!match.ids.includes(previewId)) {
      setPreviewId(match.ids[0])
    }
  }, [match.ids, previewId, selections.length])

  const toggleTrait = (option: ClosetTraitOption) => {
    void unlockAudioIfNeeded().then(() => playSfx('uiClick'))
    setSelections((prev) => applyTraitSelection(prev, option))
    if (option.traitType === 'Type') {
      const isDeselect = selections.some(
        (item) => item.traitType === 'Type' && item.traitValue === option.traitValue,
      )
      setTypePickerOpen(isDeselect)
    }
  }

  const clearSelections = () => {
    void unlockAudioIfNeeded().then(() => playSfx('uiClick'))
    setSelections([])
    setPreviewId(savedMeebit)
    setTypePickerOpen(true)
  }

  const selectMatch = (meebitNumber: number) => {
    void unlockAudioIfNeeded().then(() => playSfx('uiClick'))
    setPreviewId(meebitNumber)
  }

  const loadMoreMatches = () => {
    void unlockAudioIfNeeded().then(() => playSfx('uiClick'))
    setMatchLimit((prev) => prev + CLOSET_MATCH_PREVIEW_LIMIT)
  }

  const wearPreview = () => {
    if (previewId === savedMeebit) return
    void unlockAudioIfNeeded().then(() => playSfx('uiConfirm'))
    setMeebitNumber(previewId)
    returnToPark(locale)
  }

  const isSelected = (option: ClosetTraitOption) =>
    selections.some(
      (item) => item.traitType === option.traitType && item.traitValue === option.traitValue,
    )

  const isWearingPreview = previewId === savedMeebit
  const showTypeGrid = typePickerOpen || !hasTypeSelected

  return (
    <main className="relative h-dvh w-dvw overflow-hidden bg-[#070914] text-[#f4ead2]">
      <TargetPreviewCapture />
      <ParkReturnButton />
      <LanguageSwitcher
        className="pointer-events-auto absolute right-4 top-[max(3.25rem,calc(env(safe-area-inset-top)+2.75rem))] z-[60]"
        tone="dark"
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(88,120,180,0.28),transparent_42%),linear-gradient(180deg,#0c1428_0%,#070914_55%,#05060e_100%)]" />

      <div className="relative z-10 flex h-full min-h-0 flex-col px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(3.4rem,calc(env(safe-area-inset-top)+2.9rem))] sm:px-5">
        <header className="mb-2 flex shrink-0 flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.32em] text-[#8eb4e8]">
              {t.eyebrow}
            </p>
            <h1 className="mt-1 font-[family-name:Georgia,Times_New_Roman,serif] text-xl leading-none text-[#f4ead2] sm:text-3xl">
              {t.title}
            </h1>
            <p className="mt-1 max-w-md text-[0.7rem] leading-5 text-[#a8b4c8] sm:text-xs">
              {t.subtitle}
            </p>
          </div>
          {selections.length > 0 ? (
            <button
              type="button"
              onClick={clearSelections}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#c8d4e8] transition hover:border-[#8eb4e8]/50 hover:bg-[#8eb4e8]/10"
            >
              {t.clear}
            </button>
          ) : null}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 pb-4 lg:grid lg:grid-cols-[minmax(280px,0.95fr)_minmax(0,1.35fr)] lg:items-start lg:gap-4">
            {/* NOW LOOK / NEW LOOK 比較 */}
            <section className="rounded-[1.25rem] border border-[#6a9ee8]/35 bg-[#0c1528]/90 p-3 shadow-xl lg:sticky lg:top-0 lg:rounded-[1.5rem] lg:p-4">
              <div className="flex items-end justify-center gap-2 sm:gap-3">
                <div className="flex min-w-0 flex-1 flex-col items-center">
                  <p className="mb-1.5 text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#8a96aa]">
                    {t.nowLook}
                  </p>
                  <TargetPreview
                    meebitNumber={savedMeebit}
                    sizeClassName="h-24 w-24 rounded-[1.1rem] border border-white/15 bg-[#10182a] sm:h-28 sm:w-28 lg:h-40 lg:w-40 lg:rounded-[1.25rem]"
                  />
                  <p className="mt-1.5 font-[family-name:Georgia,Times_New_Roman,serif] text-sm text-[#a8b4c8]">
                    #{savedMeebit}
                  </p>
                </div>

                <div className="mb-8 flex shrink-0 flex-col items-center gap-1 self-center sm:mb-10 lg:mb-12">
                  <span
                    className={`text-lg leading-none ${isWearingPreview ? 'text-[#5a6478]' : 'text-[#f1d48c]'}`}
                    aria-hidden
                  >
                    →
                  </span>
                  {isWearingPreview ? (
                    <span className="text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#5a6478]">
                      {t.sameLook}
                    </span>
                  ) : null}
                </div>

                <div className="flex min-w-0 flex-1 flex-col items-center">
                  <p
                    className={`mb-1.5 text-[0.55rem] font-bold uppercase tracking-[0.2em] ${
                      isWearingPreview ? 'text-[#8a96aa]' : 'text-[#f1d48c]'
                    }`}
                  >
                    {t.newLook}
                  </p>
                  <TargetPreview
                    meebitNumber={previewId}
                    sizeClassName={`h-24 w-24 rounded-[1.1rem] border bg-[#10182a] sm:h-28 sm:w-28 lg:h-40 lg:w-40 lg:rounded-[1.25rem] ${
                      isWearingPreview
                        ? 'border-white/15'
                        : 'border-[#f1d48c]/55 shadow-[0_0_0_1px_rgba(241,212,140,0.25)]'
                    }`}
                  />
                  <p className="mt-1.5 font-[family-name:Georgia,Times_New_Roman,serif] text-sm text-[#e8f0ff]">
                    #{previewId}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  disabled={isWearingPreview}
                  onClick={wearPreview}
                  className="w-full rounded-xl border border-[#ead394]/50 bg-gradient-to-b from-[#b18a3f] to-[#7f5d22] px-3 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#fff9e9] transition hover:brightness-110 disabled:cursor-default disabled:opacity-40 sm:py-3"
                >
                  {isWearingPreview ? t.wearing : t.wear}
                </button>
                {selections.length > 0 ? (
                  <div className="rounded-xl border border-[#6a9ee8]/25 bg-black/20 px-2.5 py-2">
                    <p className="text-[0.5rem] font-bold uppercase tracking-[0.18em] text-[#8eb4e8]">
                      {t.selected} · {selections.length}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {selections.map((item) => (
                        <span
                          key={item.poolKey}
                          className="rounded-full border border-[#8eb4e8]/35 bg-[#8eb4e8]/10 px-2 py-0.5 text-[0.58rem] text-[#d8e6ff]"
                        >
                          {formatTraitDisplayName(item.traitType, item.traitValue)}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="flex min-w-0 flex-col gap-2.5">
              {/* Step 1 */}
              <div
                className={`rounded-[1.25rem] border bg-[#0c1528]/85 p-2.5 sm:p-3 ${
                  hasTypeSelected
                    ? 'border-[#6a9ee8]/30'
                    : 'border-[#8eb4e8]/55 ring-1 ring-[#8eb4e8]/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#8eb4e8]">
                    {t.typeStep}
                  </p>
                  {!showTypeGrid && selectedType ? (
                    <button
                      type="button"
                      onClick={() => {
                        void unlockAudioIfNeeded().then(() => playSfx('uiClick'))
                        setTypePickerOpen(true)
                      }}
                      className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.12em] text-[#c8d4e8]"
                    >
                      {t.changeType}
                    </button>
                  ) : (
                    <p className="text-[0.62rem] text-[#a8b4c8]">{t.typeHint}</p>
                  )}
                </div>

                {!showTypeGrid && selectedType ? (
                  <div className="mt-2 flex items-center gap-2">
                    <TraitQuestVisual
                      traitType={selectedType.traitType}
                      traitValue={selectedType.traitValue}
                      sizeClassName="h-12 w-12 shrink-0 rounded-lg border-0 bg-[#f4f6fa]"
                    />
                    <p className="text-sm font-semibold text-[#e8f0ff]">
                      {formatTraitDisplayName(selectedType.traitType, selectedType.traitValue)}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                    {typeOptions.map((option) => (
                      <TraitOptionButton
                        key={option.poolKey}
                        option={option}
                        selected={isSelected(option)}
                        onToggle={toggleTrait}
                        compact
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2 — 高さは中身任せ、max だけ制限 */}
              <div
                className={`rounded-[1.25rem] border bg-[#0c1528]/85 p-2.5 sm:p-3 ${
                  hasTypeSelected ? 'border-[#6a9ee8]/30' : 'border-white/10 opacity-60'
                }`}
              >
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#8eb4e8]">
                  {t.looksStep}
                </p>

                {!hasTypeSelected ? (
                  <p className="mt-2 py-3 text-center text-sm text-[#8a96aa]">{t.selectTypeFirst}</p>
                ) : (
                  <>
                    <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {availableLookTypes.map((type) => {
                        const label = CATEGORY_LABEL[type]?.[locale] ?? type
                        const active = type === activeLookType
                        const hasPick = selections.some((item) => item.traitType === type)
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => {
                              void unlockAudioIfNeeded().then(() => playSfx('uiClick'))
                              setActiveLookType(type)
                            }}
                            className={`shrink-0 rounded-full px-2.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.1em] transition sm:px-3 ${
                              active
                                ? 'bg-[#6a9ee8] text-[#070914]'
                                : hasPick
                                  ? 'border border-[#f1d48c]/50 bg-[#f1d48c]/15 text-[#f1d48c]'
                                  : 'border border-white/10 bg-white/5 text-[#c8d4e8] hover:border-white/25'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>

                    {compatibleOptions.length === 0 ? (
                      <p className="mt-3 py-3 text-center text-sm text-[#8a96aa]">{t.noCompatible}</p>
                    ) : (
                      <div className="mt-2 grid grid-cols-3 items-start gap-1.5 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
                        {compatibleOptions.map((option) => (
                          <TraitOptionButton
                            key={option.poolKey}
                            option={option}
                            selected={isSelected(option)}
                            onToggle={toggleTrait}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Matches */}
              <div className="rounded-[1.25rem] border border-[#6a9ee8]/30 bg-[#0c1528]/85 p-2.5 sm:p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-[#8eb4e8]">
                    {t.matches}
                  </p>
                  {hasTypeSelected ? (
                    <p className="text-[0.7rem] font-semibold text-[#c8d4e8]">{match.total}</p>
                  ) : null}
                </div>

                {!hasTypeSelected ? (
                  <p className="mt-2 text-sm text-[#8a96aa]">{t.selectTypeFirst}</p>
                ) : match.total === 0 ? (
                  <p className="mt-2 text-sm text-[#c9a24a]">{t.none}</p>
                ) : (
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {match.ids.map((id) => {
                      const active = id === previewId
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => selectMatch(id)}
                          className={`shrink-0 rounded-2xl border p-1.5 transition ${
                            active
                              ? 'border-[#f1d48c] bg-[#f1d48c]/15'
                              : 'border-white/10 bg-black/25 hover:border-[#8eb4e8]/40'
                          }`}
                        >
                          <TargetPreview
                            meebitNumber={id}
                            sizeClassName="h-14 w-14 rounded-xl border-0 bg-[#10182a] sm:h-16 sm:w-16"
                          />
                          <span className="mt-1 block text-center text-[0.55rem] font-bold text-[#c8d4e8]">
                            #{id}
                          </span>
                        </button>
                      )
                    })}
                    {match.total > match.ids.length ? (
                      <button
                        type="button"
                        onClick={loadMoreMatches}
                        className="flex h-[4.75rem] w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl border border-dashed border-[#8eb4e8]/45 bg-[#8eb4e8]/10 px-1 text-[#c8d4e8] transition hover:border-[#f1d48c]/55 hover:bg-[#f1d48c]/10 hover:text-[#f4ead2] sm:h-[5.5rem] sm:w-[4.5rem]"
                        aria-label={t.loadMore}
                      >
                        <span className="text-[0.62rem] font-bold leading-tight">
                          {t.more(match.total - match.ids.length)}
                        </span>
                        <span className="text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-[#8eb4e8]">
                          {t.loadMore}
                        </span>
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
