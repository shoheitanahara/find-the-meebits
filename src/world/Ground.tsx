import { getMuseumSeasonLook } from './museumSeason'

export function Ground() {
  const look = getMuseumSeasonLook()

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[144, 144]} />
        <meshStandardMaterial color={look.groundOuterColor} roughness={0.94} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[132, 132]} />
        <meshStandardMaterial color={look.groundInnerColor} roughness={0.95} />
      </mesh>
    </group>
  )
}
