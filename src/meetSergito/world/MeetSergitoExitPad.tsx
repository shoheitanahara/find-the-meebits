import { Text } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getLocale } from '../../i18n/locale'
import { playSfx } from '../../ui/sfx'
import { MEET_SERGITO } from '../config'
import { meetSergitoPlayerWorld } from '../playerWorld'

export function MeetSergitoExitPad() {
  const triggeredRef = useRef(false)
  const { playerExit, colors } = MEET_SERGITO

  useFrame(() => {
    if (triggeredRef.current || !meetSergitoPlayerWorld.ready) return

    const dx = Math.abs(meetSergitoPlayerWorld.x - playerExit.x)
    const dz = Math.abs(meetSergitoPlayerWorld.z - playerExit.z)
    if (dx <= playerExit.halfX && dz <= playerExit.halfZ) {
      triggeredRef.current = true
      playSfx('uiConfirm')
      const locale = getLocale()
      const parkPath = locale === 'ja' ? '/jp' : '/'
      window.location.assign(`${parkPath}?from=sergito`)
    }
  })

  return (
    <group position={[playerExit.x, 0.04, playerExit.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[playerExit.halfX * 2, playerExit.halfZ * 2]} />
        <meshStandardMaterial
          color="#f0e6d4"
          emissive={colors.accent}
          emissiveIntensity={0.25}
          roughness={0.65}
        />
      </mesh>
      <Text
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        fontSize={0.42}
        color="#5a4030"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        EXIT
      </Text>
    </group>
  )
}
