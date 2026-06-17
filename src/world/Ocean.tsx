export function Ocean() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]}>
      <planeGeometry args={[174, 174]} />
      <meshStandardMaterial color="#0a0a0a" roughness={0.82} metalness={0.05} />
    </mesh>
  )
}
