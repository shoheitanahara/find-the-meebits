import { useEffect, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { Stars } from '@react-three/drei'
import { advanceStarlightRide, resetStarlightRide, starlightRideRuntime } from '../ridePath'
import { useStarlightRushStore } from '../store'
import { StarlightShip } from './StarlightShip'
import { StarlightCelestials } from './StarlightCelestials'
import { StarlightStations } from './StarlightStations'

/** 暗い宇宙空間 + ライド根グループ（船・プレイヤー・流星の親）。 */
export function StarlightSpace({ children }: { children: ReactNode }) {
  const rideRef = useRef<Group>(null)
  const sessionKey = useStarlightRushStore((state) => state.sessionKey)

  useEffect(() => {
    resetStarlightRide()
  }, [sessionKey])

  useFrame((_, delta) => {
    advanceStarlightRide(delta)
    const ride = rideRef.current
    if (!ride) return
    ride.position.copy(starlightRideRuntime.position)
    ride.quaternion.copy(starlightRideRuntime.quaternion)
  })

  return (
    <>
      <color attach="background" args={['#02060f']} />
      <fog attach="fog" args={['#02060f', 36, 110]} />
      <ambientLight intensity={0.28} />
      <directionalLight position={[8, 14, 6]} intensity={0.4} color="#c8dcff" />
      <hemisphereLight args={['#3a5080', '#080a14', 0.45]} />

      <Stars radius={110} depth={60} count={2200} factor={3.6} saturation={0.55} fade speed={0.45} />
      <StarlightCelestials />
      <StarlightStations />
      <WarpStreaks />

      <group ref={rideRef}>
        <StarlightShip />
        {children}
      </group>
    </>
  )
}

function WarpStreaks() {
  const ref = useRef<Group>(null)
  useFrame(() => {
    if (!ref.current) return
    const boost = starlightRideRuntime.warpBoost
    ref.current.visible = boost > 0.05
    ref.current.scale.setScalar(1 + boost * 1.8)
  })
  return (
    <group ref={ref} visible={false}>
      {Array.from({ length: 36 }, (_, i) => {
        const x = ((i * 47) % 24) - 12
        const y = ((i * 31) % 16) - 8
        return (
          <mesh key={i} position={[x, y, -6 - (i % 6)]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.015, 0.035, 5 + (i % 4), 4]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? '#dff8ff' : '#ffc8f0'}
              transparent
              opacity={0.4}
              toneMapped={false}
            />
          </mesh>
        )
      })}
    </group>
  )
}
