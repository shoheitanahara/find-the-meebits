import { Text } from '@react-three/drei'
import { formatTraitDisplayName } from '../../game/traitHunt'
import { getLocale } from '../../i18n/locale'
import { RUNWAY } from '../config'
import { useRunwayStore } from '../store'

/** 背面スクリーン：番号・トレイト・本日テーマ */
export function RunwayScreen() {
  const onScreen = useRunwayStore((state) => state.onScreen)
  const themeTrait = useRunwayStore((state) => state.themeTrait)
  const locale = getLocale()
  const { screen, colors } = RUNWAY

  const themeLine = themeTrait
    ? `${themeTrait.traitType} · ${formatTraitDisplayName(themeTrait.traitType, themeTrait.traitValue)}`
    : '—'

  const traitLines = onScreen
    ? Object.entries(onScreen.traits)
        .slice(0, 6)
        .map(([type, value]) => `${type} · ${formatTraitDisplayName(type, value)}`)
    : []

  return (
    <group position={[screen.x, screen.y, screen.z + 0.05]}>
      <Text
        position={[0, screen.height * 0.38, 0]}
        fontSize={0.28}
        color="#a8a8a8"
        anchorX="center"
        anchorY="middle"
        maxWidth={screen.width - 0.6}
      >
        {locale === 'ja' ? '本日のルック' : "TONIGHT'S LOOK"}
      </Text>
      <Text
        position={[0, screen.height * 0.28, 0]}
        fontSize={0.34}
        color={colors.accent}
        anchorX="center"
        anchorY="middle"
        maxWidth={screen.width - 0.6}
      >
        {themeLine}
      </Text>

      {onScreen ? (
        <>
          <Text
            position={[0, 0.35, 0]}
            fontSize={0.72}
            color={colors.screenText}
            anchorX="center"
            anchorY="middle"
          >
            {`#${onScreen.meebitNumber}`}
          </Text>
          {traitLines.map((line, index) => (
            <Text
              key={line}
              position={[0, -0.15 - index * 0.32, 0]}
              fontSize={0.26}
              color={
                themeTrait && line.startsWith(`${themeTrait.traitType} ·`)
                  ? colors.accent
                  : '#cfcfcf'
              }
              anchorX="center"
              anchorY="middle"
              maxWidth={screen.width - 0.8}
            >
              {line}
            </Text>
          ))}
        </>
      ) : (
        <Text
          position={[0, 0, 0]}
          fontSize={0.36}
          color="#777"
          anchorX="center"
          anchorY="middle"
        >
          {locale === 'ja' ? '次のモデル準備中…' : 'Preparing next model…'}
        </Text>
      )}
    </group>
  )
}
