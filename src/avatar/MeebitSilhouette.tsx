type MeebitSilhouetteProps = {
  scale?: number
}

export function MeebitSilhouette({ scale = 0.52 }: MeebitSilhouetteProps) {
  return (
    <group rotation={[0, Math.PI, 0]} scale={scale}>
      <mesh receiveShadow position={[0, 0.28, -0.04]}>
        <boxGeometry args={[0.78, 0.56, 0.5]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[-0.24, 0.95, 0]}>
        <boxGeometry args={[0.28, 1.2, 0.34]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[0.24, 0.95, 0]}>
        <boxGeometry args={[0.28, 1.2, 0.34]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[0, 1.75, 0]}>
        <boxGeometry args={[0.9, 1.25, 0.48]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[-0.58, 1.72, 0]}>
        <boxGeometry args={[0.28, 1.12, 0.28]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[0.58, 1.72, 0]}>
        <boxGeometry args={[0.28, 1.12, 0.28]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[0, 2.55, 0]}>
        <boxGeometry args={[1.08, 0.82, 0.72]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
      <mesh receiveShadow position={[0, 3.02, -0.03]}>
        <boxGeometry args={[1.2, 0.34, 0.78]} />
        <meshStandardMaterial color="#050505" roughness={0.72} />
      </mesh>
    </group>
  )
}
