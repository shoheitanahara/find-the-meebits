import { PHOTO_STUDIO } from '../config'

/** Figure ポーズ用の1段黒台座。底は影受け面に合わせる。 */
export function StudioFigurePedestal() {
  const { size, y, color, roughness, metalness, envMapIntensity } =
    PHOTO_STUDIO.figurePedestal

  return (
    <mesh position={[0, y, 0]} castShadow receiveShadow>
      <boxGeometry args={[size[0], size[1], size[2]]} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        envMapIntensity={envMapIntensity}
      />
    </mesh>
  )
}
