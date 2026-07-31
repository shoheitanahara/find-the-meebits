import { Text } from '@react-three/drei'
import { ABOUT_MEEBITS_BOARD_POSITION } from './aboutMeebits'

/** Culture 地区: About Meebits 掲示板。 */
export function AboutMeebitsBoard({ locale }: { locale: 'en' | 'ja' }) {
  const heading = locale === 'ja' ? 'ABOUT MEEBITS' : 'ABOUT MEEBITS'
  const title = locale === 'ja' ? 'ミービッツとは' : 'What are Meebits?'
  const body =
    locale === 'ja'
      ? 'Larva Labs 公式。\n20,000体の3Dボクセル。'
      : 'Official Larva Labs page.\n20,000 unique 3D voxels.'
  const hint = locale === 'ja' ? 'E で記事を読む' : 'Press E to read'

  return (
    <group position={ABOUT_MEEBITS_BOARD_POSITION}>
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.1, 0.2, 0.88]} />
        <meshStandardMaterial color="#1a2234" roughness={0.55} metalness={0.35} />
      </mesh>
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 2.2, 10]} />
          <meshStandardMaterial color="#7a90b8" metalness={0.7} roughness={0.32} />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0.04]} castShadow>
        <boxGeometry args={[3.15, 1.72, 0.14]} />
        <meshStandardMaterial
          color="#0e1422"
          emissive="#5ce0ff"
          emissiveIntensity={0.08}
          metalness={0.22}
          roughness={0.48}
        />
      </mesh>
      <mesh position={[0, 2.22, 0.05]}>
        <boxGeometry args={[2.95, 0.36, 0.04]} />
        <meshStandardMaterial color="#152038" roughness={0.5} metalness={0.2} />
      </mesh>
      <Text
        position={[0, 2.22, 0.14]}
        fontSize={0.15}
        color="#8fdfff"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.8}
      >
        {heading}
      </Text>
      <Text
        position={[0, 1.78, 0.15]}
        fontSize={0.22}
        color="#f4ead2"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.8}
      >
        {title}
      </Text>
      <Text
        position={[0, 1.35, 0.15]}
        fontSize={0.13}
        color="#c8d8f0"
        anchorX="center"
        anchorY="middle"
        maxWidth={2.7}
        textAlign="center"
      >
        {body}
      </Text>
      <mesh position={[0, 0.92, 0.13]}>
        <boxGeometry args={[2.4, 0.28, 0.03]} />
        <meshStandardMaterial
          color="#243858"
          emissive="#5ce0ff"
          emissiveIntensity={0.18}
          roughness={0.4}
        />
      </mesh>
      <Text
        position={[0, 0.92, 0.16]}
        fontSize={0.12}
        color="#dff8ff"
        anchorX="center"
        anchorY="middle"
      >
        {hint}
      </Text>
    </group>
  )
}
