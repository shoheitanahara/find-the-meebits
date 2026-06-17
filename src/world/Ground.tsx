export function Ground() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[144, 144]} />
        <meshStandardMaterial color="#d6d3d1" roughness={0.92} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
        <planeGeometry args={[132, 132]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.95} />
      </mesh>
    </group>
  )
}
