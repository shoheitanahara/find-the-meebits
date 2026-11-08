import { Text } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getLocale } from '../../i18n/locale'
import { playSfx } from '../../ui/sfx'
import { PODCAST } from '../config'
import { podcastPlayerWorld } from '../playerWorld'

export function PodcastExitPad({ enabled }: { enabled: boolean }) {
  const triggeredRef = useRef(false)
  const { playerExit, colors } = PODCAST

  useFrame(() => {
    if (!enabled || triggeredRef.current || !podcastPlayerWorld.ready) return

    const dx = Math.abs(podcastPlayerWorld.x - playerExit.x)
    const dz = Math.abs(podcastPlayerWorld.z - playerExit.z)
    if (dx <= playerExit.halfX && dz <= playerExit.halfZ) {
      triggeredRef.current = true
      playSfx('uiConfirm')
      const locale = getLocale()
      const parkPath = locale === 'ja' ? '/jp' : '/'
      window.location.assign(`${parkPath}?from=podcast`)
    }
  })

  return (
    <group position={[playerExit.x, 0.04, playerExit.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[playerExit.halfX * 2, playerExit.halfZ * 2]} />
        <meshStandardMaterial
          color="#dff8ff"
          emissive={colors.accent}
          emissiveIntensity={0.4}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[playerExit.halfX * 2 - 0.2, playerExit.halfZ * 2 - 0.2]} />
        <meshStandardMaterial color="#0a1018" roughness={0.85} />
      </mesh>
      <Text
        position={[0, 0.05, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        fontSize={0.55}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        EXIT
      </Text>
      <pointLight position={[0, 1.2, 0]} intensity={6} distance={6} color={colors.accent} />
    </group>
  )
}
