import { ClubProps } from './ClubProps'
import { WORLD_RADIUS } from '../game/gameConfig'
import { VrmSculpturePreloader } from './VrmSculpturePreloader'

const FLOOR_SIZE = WORLD_RADIUS * 2 + 8

function ClubGround() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
      <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
      <meshStandardMaterial
        color="#3b2860"
        emissive="#6d28d9"
        emissiveIntensity={0.14}
        metalness={0.22}
        roughness={0.78}
      />
    </mesh>
  )
}

export function ClubWorld() {
  return (
    <group>
      <VrmSculpturePreloader venueId="club" />
      <ClubGround />
      <ClubProps />
    </group>
  )
}
