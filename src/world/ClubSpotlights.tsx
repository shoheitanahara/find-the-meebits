import { useLayoutEffect, useRef } from 'react'
import type { Group, SpotLight } from 'three'
import { isMobilePerfMode } from '../game/perfConfig'
import { CLUB_SPOTLIGHT_PLACEMENTS } from './clubLandmarks'

/** Wide flood cone — actual avatar/prop illumination, not floor decal */
const SPOT_ANGLE = 1.32
/** +Z = entrance / camera side. Tilt lights from front toward back (-Z) to hit faces. */
const LIGHT_FORWARD_Z = 3.2
const TARGET_BACK_Z = 5
const TARGET_FACE_Y = 1.55
const FILL_FORWARD_Z = 2.2
const FILL_FACE_Y = 1.7

function ClubSpotPool({
  x,
  z,
  color,
  height,
  poolRadius,
  beamRadius,
  spotIntensity,
  fillIntensity,
}: {
  x: number
  z: number
  color: string
  height: number
  poolRadius: number
  beamRadius: number
  spotIntensity: number
  fillIntensity: number
}) {
  const spotRef = useRef<SpotLight>(null)
  const targetRef = useRef<Group>(null)

  const lightZ = z + LIGHT_FORWARD_Z
  const targetZ = z - TARGET_BACK_Z
  const fillZ = z + FILL_FORWARD_Z
  const fillDistance = beamRadius * 1.15

  useLayoutEffect(() => {
    const spot = spotRef.current
    const target = targetRef.current
    if (spot && target) {
      spot.target = target
    }
  }, [])

  return (
    <group>
      <group position={[x, height, lightZ]}>
        <mesh castShadow rotation={[0.42, 0, 0]} position={[0, 0, -0.08]}>
          <boxGeometry args={[0.55, 0.2, 0.35]} />
          <meshStandardMaterial color="#27272a" metalness={0.35} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.12, -0.18]} rotation={[0.42, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 0.12, 12]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} />
        </mesh>
      </group>

      <spotLight
        ref={spotRef}
        angle={SPOT_ANGLE}
        color={color}
        decay={1.1}
        distance={height + beamRadius + 18}
        intensity={spotIntensity}
        penumbra={0.9}
        position={[x, height - 0.1, lightZ]}
      />
      <pointLight
        color={color}
        decay={1.25}
        distance={fillDistance}
        intensity={fillIntensity}
        position={[x, FILL_FACE_Y, fillZ]}
      />
      <group ref={targetRef} position={[x, TARGET_FACE_Y, targetZ]} />

      <mesh position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[poolRadius, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.28}
          opacity={0.4}
          roughness={0.88}
          transparent
        />
      </mesh>
    </group>
  )
}

export function ClubSpotlights() {
  const mobile = isMobilePerfMode()

  return (
    <group>
      {CLUB_SPOTLIGHT_PLACEMENTS.map((spot) => (
        <ClubSpotPool
          key={spot.id}
          beamRadius={spot.beamRadius}
          color={spot.color}
          fillIntensity={mobile ? 8 : 12}
          height={spot.height}
          poolRadius={spot.poolRadius}
          spotIntensity={mobile ? 32 : 48}
          x={spot.x}
          z={spot.z}
        />
      ))}
    </group>
  )
}
