import { Text } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getLocale } from '../../i18n/locale'
import { playSfx } from '../../ui/sfx'
import { OPEN_SEA_MARKET } from '../config'
import { openSeaMarketPlayerWorld } from '../playerWorld'

export function MarketExitPad() {
  const triggeredRef = useRef(false)
  const { playerExit, colors } = OPEN_SEA_MARKET

  useFrame(() => {
    if (triggeredRef.current || !openSeaMarketPlayerWorld.ready) return
    const dx = Math.abs(openSeaMarketPlayerWorld.x - playerExit.x)
    const dz = Math.abs(openSeaMarketPlayerWorld.z - playerExit.z)
    if (dx <= playerExit.halfX && dz <= playerExit.halfZ) {
      triggeredRef.current = true
      playSfx('uiConfirm')
      const locale = getLocale()
      const parkPath = locale === 'ja' ? '/jp' : '/'
      window.location.assign(`${parkPath}?from=opensea`)
    }
  })

  return (
    <group position={[playerExit.x, 0.04, playerExit.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[playerExit.halfX * 2, playerExit.halfZ * 2]} />
        <meshStandardMaterial
          color="#dcecff"
          emissive={colors.accent}
          emissiveIntensity={0.28}
          roughness={0.6}
        />
      </mesh>
      <Text
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        fontSize={0.42}
        color="#1a3a60"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        EXIT
      </Text>
    </group>
  )
}
