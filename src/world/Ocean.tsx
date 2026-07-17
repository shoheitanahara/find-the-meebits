import { getMuseumSeasonLook } from './museumSeason'

export function Ocean() {
  const look = getMuseumSeasonLook()

  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
      <planeGeometry args={[174, 174]} />
      <meshStandardMaterial
        color={look.oceanColor}
        roughness={look.oceanColor === '#0a0a0a' ? 0.82 : 0.35}
        metalness={look.oceanColor === '#0a0a0a' ? 0.05 : 0.18}
      />
    </mesh>
  )
}
