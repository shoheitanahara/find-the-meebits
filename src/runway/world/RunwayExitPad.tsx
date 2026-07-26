import { Text } from '@react-three/drei'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getLocale } from '../../i18n/locale'
import { playSfx } from '../../ui/sfx'
import { RUNWAY } from '../config'
import { runwayPlayerWorld } from '../playerWorld'

/** 手前床の EXIT サイン。乗るとパークへ戻る。 */
export function RunwayExitPad({ enabled }: { enabled: boolean }) {
  const triggeredRef = useRef(false)
  const { playerExit, colors } = RUNWAY

  useFrame(() => {
    if (!enabled || triggeredRef.current || !runwayPlayerWorld.ready) return

    const dx = Math.abs(runwayPlayerWorld.x - playerExit.x)
    const dz = Math.abs(runwayPlayerWorld.z - playerExit.z)
    if (dx <= playerExit.halfX && dz <= playerExit.halfZ) {
      triggeredRef.current = true
      playSfx('uiConfirm')
      const locale = getLocale()
      const parkPath = locale === 'ja' ? '/jp' : '/'
      window.location.assign(`${parkPath}?from=runway`)
    }
  })

  return (
    <group position={[playerExit.x, 0.04, playerExit.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[playerExit.halfX * 2, playerExit.halfZ * 2]} />
        <meshStandardMaterial
          color="#f5f5f5"
          emissive={colors.accent}
          emissiveIntensity={0.35}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[playerExit.halfX * 2 - 0.2, playerExit.halfZ * 2 - 0.2]} />
        <meshStandardMaterial color="#111111" roughness={0.85} />
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
      <pointLight position={[0, 1.2, 0]} intensity={6} distance={6} color="#ffffff" />
    </group>
  )
}
