import { getMuseumSurfaceLook } from '../game/venueConfig'

export function Ocean() {
  const look = getMuseumSurfaceLook()

  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
      <planeGeometry args={[174, 174]} />
      <meshStandardMaterial
        color={look.oceanColor}
        roughness={look.oceanRoughness}
        metalness={look.oceanMetalness}
      />
    </mesh>
  )
}
