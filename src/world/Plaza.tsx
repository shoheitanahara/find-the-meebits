const tilePositions = Array.from({ length: 13 }, (_, index) => -48 + index * 8)

export function Plaza() {
  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#f5f5f4" roughness={0.88} />
      </mesh>

      {tilePositions.map((x) =>
        tilePositions.map((z) => (
          <mesh
            key={`${x}-${z}`}
            receiveShadow
            rotation={[-Math.PI / 2, 0, 0]}
            position={[x, 0.025, z]}
          >
            <planeGeometry args={[7.6, 7.6]} />
            <meshStandardMaterial color={(x + z) % 16 === 0 ? '#fafaf9' : '#e7e5e4'} />
          </mesh>
        )),
      )}

      <GalleryFrame />
    </group>
  )
}

function GalleryFrame() {
  const frameSize = 34
  const thickness = 0.5

  return (
    <group position={[0, 0.04, 0]}>
      <FrameBar position={[0, 0, -frameSize / 2]} size={[frameSize, thickness]} />
      <FrameBar position={[0, 0, frameSize / 2]} size={[frameSize, thickness]} />
      <FrameBar position={[-frameSize / 2, 0, 0]} size={[thickness, frameSize]} />
      <FrameBar position={[frameSize / 2, 0, 0]} size={[thickness, frameSize]} />
    </group>
  )
}

function FrameBar({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={size} />
      <meshStandardMaterial color="#1c1917" roughness={0.9} />
    </mesh>
  )
}
