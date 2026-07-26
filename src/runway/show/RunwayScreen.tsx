import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import { formatTraitDisplayName } from '../../game/traitHunt'
import { getLocale } from '../../i18n/locale'
import {
  formatRunwayThemeLabel,
  RUNWAY_COLOR_TRAIT_TYPES,
} from '../dailyRunway'
import { RUNWAY } from '../config'
import { useRunwayStore } from '../store'

/** モニター掲載順（カラーは本体トレイトの直後） */
const TRAIT_ORDER = [
  'Type',
  'Hair Style',
  'Hair Color',
  'Glasses',
  'Glasses Color',
  'Hat',
  'Hat Color',
  'Beard',
  'Beard Color',
  'Shirt',
  'Shirt Color',
  'Overshirt',
  'Overshirt Color',
  'Pants',
  'Pants Color',
  'Shoes',
  'Shoes Color',
  'Necklace',
  'Earring',
  'Tattoo',
] as const

const MAX_TRAIT_LINES = 10

/** 背面スクリーン：番号・トレイト・本日テーマ */
export function RunwayScreen() {
  const onScreen = useRunwayStore((state) => state.onScreen)
  const themeTrait = useRunwayStore((state) => state.themeTrait)
  const locale = getLocale()
  const { screen, colors } = RUNWAY
  const padX = 0.85
  const contentWidth = screen.width - padX * 2
  const topY = screen.height / 2 - 0.45
  const bottomY = -screen.height / 2 + 0.4

  const themeLine = themeTrait ? formatRunwayThemeLabel(themeTrait, locale) : '—'

  const traitLines = useMemo(() => {
    if (!onScreen) return []

    const entries = Object.entries(onScreen.traits)
    const rank = new Map(TRAIT_ORDER.map((key, index) => [key, index]))
    const isHighlight = (type: string, value: string) =>
      !!themeTrait &&
      (RUNWAY_COLOR_TRAIT_TYPES as readonly string[]).includes(type) &&
      value === themeTrait.traitValue

    // マッチしたカラーは必ず先頭付近に出す
    const matchingColors = entries.filter(([type, value]) => isHighlight(type, value))
    const others = entries
      .filter(([type, value]) => !isHighlight(type, value))
      .sort((a, b) => {
        const ra = rank.get(a[0] as (typeof TRAIT_ORDER)[number]) ?? 100
        const rb = rank.get(b[0] as (typeof TRAIT_ORDER)[number]) ?? 100
        if (ra !== rb) return ra - rb
        return a[0].localeCompare(b[0])
      })

    const ordered = [...matchingColors, ...others].slice(0, MAX_TRAIT_LINES)

    return ordered.map(([type, value]) => ({
      key: `${type}::${value}`,
      line: `${type} · ${formatTraitDisplayName(type, value)}`,
      highlight: isHighlight(type, value),
    }))
  }, [onScreen, themeTrait])

  const idY = topY - 1.05
  const listStartY = idY - 0.55
  const lineGap = 0.28

  return (
    <group position={[screen.x, screen.y, screen.z + 0.05]}>
      <Text
        position={[0, topY, 0]}
        fontSize={0.22}
        color="#a8a8a8"
        anchorX="center"
        anchorY="middle"
        maxWidth={contentWidth}
      >
        {locale === 'ja' ? '本日のルック' : "TONIGHT'S LOOK"}
      </Text>
      <Text
        position={[0, topY - 0.38, 0]}
        fontSize={0.3}
        color={colors.accent}
        anchorX="center"
        anchorY="middle"
        maxWidth={contentWidth}
      >
        {themeLine}
      </Text>

      {onScreen ? (
        <>
          <Text
            position={[0, idY, 0]}
            fontSize={0.52}
            color={colors.screenText}
            anchorX="center"
            anchorY="middle"
            maxWidth={contentWidth}
          >
            {`#${onScreen.meebitNumber}`}
          </Text>
          {traitLines.map((entry, index) => {
            const y = listStartY - index * lineGap
            if (y < bottomY) return null
            return (
              <Text
                key={entry.key}
                position={[0, y, 0]}
                fontSize={0.2}
                color={entry.highlight ? colors.accent : '#cfcfcf'}
                anchorX="center"
                anchorY="middle"
                maxWidth={contentWidth}
              >
                {entry.line}
              </Text>
            )
          })}
        </>
      ) : (
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="#777"
          anchorX="center"
          anchorY="middle"
          maxWidth={contentWidth}
        >
          {locale === 'ja' ? '次のモデル準備中…' : 'Preparing next model…'}
        </Text>
      )}
    </group>
  )
}
