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
  'Tattoo Motif',
  'Jersey Number',
] as const

type TraitLine = {
  key: string
  line: string
  highlight: boolean
}

/** 背面スクリーン：番号・トレイト・本日テーマ（トレイトは2カラム全表示） */
export function RunwayScreen() {
  const onScreen = useRunwayStore((state) => state.onScreen)
  const themeTrait = useRunwayStore((state) => state.themeTrait)
  const locale = getLocale()
  const { screen, colors } = RUNWAY
  const padX = 0.55
  const contentWidth = screen.width - padX * 2
  const colWidth = contentWidth / 2 - 0.12
  const topY = screen.height / 2 - 0.38
  const bottomY = -screen.height / 2 + 0.32

  const themeLine = themeTrait ? formatRunwayThemeLabel(themeTrait, locale) : '—'

  const traitLines = useMemo((): TraitLine[] => {
    if (!onScreen) return []

    const entries = Object.entries(onScreen.traits)
    const rank = new Map(TRAIT_ORDER.map((key, index) => [key, index]))
    const isHighlight = (type: string, value: string) =>
      !!themeTrait &&
      (RUNWAY_COLOR_TRAIT_TYPES as readonly string[]).includes(type) &&
      value === themeTrait.traitValue

    const matchingColors = entries.filter(([type, value]) => isHighlight(type, value))
    const others = entries
      .filter(([type, value]) => !isHighlight(type, value))
      .sort((a, b) => {
        const ra = rank.get(a[0] as (typeof TRAIT_ORDER)[number]) ?? 100
        const rb = rank.get(b[0] as (typeof TRAIT_ORDER)[number]) ?? 100
        if (ra !== rb) return ra - rb
        return a[0].localeCompare(b[0])
      })

    // マッチカラーを先頭にしつつ、所持トレイトはすべて表示
    return [...matchingColors, ...others].map(([type, value]) => ({
      key: `${type}::${value}`,
      line: `${type} · ${formatTraitDisplayName(type, value)}`,
      highlight: isHighlight(type, value),
    }))
  }, [onScreen, themeTrait])

  const idY = topY - 0.95
  const listStartY = idY - 0.42
  const availableH = listStartY - bottomY
  const rowCount = Math.max(1, Math.ceil(traitLines.length / 2))
  const lineGap = Math.min(0.26, availableH / Math.max(rowCount, 1))
  const fontSize = Math.min(0.185, lineGap * 0.72)

  return (
    <group position={[screen.x, screen.y, screen.z + 0.05]}>
      <Text
        position={[0, topY, 0]}
        fontSize={0.2}
        color="#a8a8a8"
        anchorX="center"
        anchorY="middle"
        maxWidth={contentWidth}
      >
        {locale === 'ja' ? '本日のルック' : "TONIGHT'S LOOK"}
      </Text>
      <Text
        position={[0, topY - 0.34, 0]}
        fontSize={0.28}
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
            fontSize={0.46}
            color={colors.screenText}
            anchorX="center"
            anchorY="middle"
            maxWidth={contentWidth}
          >
            {`#${onScreen.meebitNumber}`}
          </Text>
          {traitLines.map((entry, index) => {
            const col = index % 2
            const row = Math.floor(index / 2)
            const x = col === 0 ? -contentWidth / 4 : contentWidth / 4
            const y = listStartY - row * lineGap
            return (
              <Text
                key={entry.key}
                position={[x, y, 0]}
                fontSize={fontSize}
                color={entry.highlight ? colors.accent : '#cfcfcf'}
                anchorX="center"
                anchorY="middle"
                maxWidth={colWidth}
                textAlign="center"
              >
                {entry.line}
              </Text>
            )
          })}
        </>
      ) : (
        <Text
          position={[0, 0, 0]}
          fontSize={0.28}
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
