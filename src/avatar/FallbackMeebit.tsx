export function FallbackMeebit() {
  return (
    <group>
      <mesh castShadow receiveShadow position={[0, 1.15, 0]}>
        <boxGeometry args={[0.85, 1.5, 0.55]} />
        <meshStandardMaterial color="#4f8df7" roughness={0.82} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 2.15, 0]}>
        <boxGeometry args={[0.95, 0.8, 0.7]} />
        <meshStandardMaterial color="#ffd8a8" roughness={0.78} />
      </mesh>
      <mesh castShadow position={[-0.22, 2.2, -0.37]}>
        <boxGeometry args={[0.12, 0.12, 0.04]} />
        <meshStandardMaterial color="#172033" />
      </mesh>
      <mesh castShadow position={[0.22, 2.2, -0.37]}>
        <boxGeometry args={[0.12, 0.12, 0.04]} />
        <meshStandardMaterial color="#172033" />
      </mesh>
    </group>
  )
}
