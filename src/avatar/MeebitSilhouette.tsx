type MeebitSilhouetteProps = {
  scale?: number
  tone?: 'default' | 'club'
}

const SILHOUETTE_COLORS = {
  default: '#050505',
  club: '#52525b',
} as const

function SilhouetteMaterial({ tone }: { tone: 'default' | 'club' }) {
  const isClub = tone === 'club'

  return (
    <meshStandardMaterial
      color={SILHOUETTE_COLORS[tone]}
      roughness={0.72}
      emissive={isClub ? '#3f3f46' : '#000000'}
      emissiveIntensity={isClub ? 0.25 : 0}
    />
  )
}

export function MeebitSilhouette({ scale = 0.52, tone = 'default' }: MeebitSilhouetteProps) {
  const mat = <SilhouetteMaterial tone={tone} />

  return (
    <group rotation={[0, Math.PI, 0]} scale={scale}>
      <mesh receiveShadow position={[0, 0.28, -0.04]}>
        <boxGeometry args={[0.78, 0.56, 0.5]} />
        {mat}
      </mesh>
      <mesh receiveShadow position={[-0.24, 0.95, 0]}>
        <boxGeometry args={[0.28, 1.2, 0.34]} />
        {mat}
      </mesh>
      <mesh receiveShadow position={[0.24, 0.95, 0]}>
        <boxGeometry args={[0.28, 1.2, 0.34]} />
        {mat}
      </mesh>
      <mesh receiveShadow position={[0, 1.75, 0]}>
        <boxGeometry args={[0.9, 1.25, 0.48]} />
        {mat}
      </mesh>
      <mesh receiveShadow position={[-0.58, 1.72, 0]}>
        <boxGeometry args={[0.28, 1.12, 0.28]} />
        {mat}
      </mesh>
      <mesh receiveShadow position={[0.58, 1.72, 0]}>
        <boxGeometry args={[0.28, 1.12, 0.28]} />
        {mat}
      </mesh>
      <mesh receiveShadow position={[0, 2.55, 0]}>
        <boxGeometry args={[1.08, 0.82, 0.72]} />
        {mat}
      </mesh>
      <mesh receiveShadow position={[0, 3.02, -0.03]}>
        <boxGeometry args={[1.2, 0.34, 0.78]} />
        {mat}
      </mesh>
    </group>
  )
}
