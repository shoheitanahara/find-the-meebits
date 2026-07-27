import { RUNWAY } from '../config'

/** 暗い部屋＋輝く白黒ランウェイ＋背面スクリーン枠 */
export function RunwayRoom() {
  const {
    roomHalfX,
    roomMinZ,
    roomMaxZ,
    wallHeight,
    ceilingY,
    runwayHalfWidth,
    runwayStartZ,
    runwayEndZ,
    runwayY,
    screen,
    benches,
    colors,
  } = RUNWAY

  const roomDepth = roomMaxZ - roomMinZ
  const roomCenterZ = (roomMinZ + roomMaxZ) / 2
  const runwayLength = runwayEndZ - runwayStartZ
  const runwayCenterZ = (runwayStartZ + runwayEndZ) / 2
  const entranceHalf = RUNWAY.entranceHalf

  return (
    <group>
      <color attach="background" args={['#080808']} />
      {/* 暗室だが奥側も顔が読めるよう、ランウェイ全体を均一に照らす */}
      <fog attach="fog" args={['#080808', 28, 55]} />

      <ambientLight intensity={0.62} color="#e0e0e0" />
      <hemisphereLight args={['#ffffff', '#282828', 0.5]} />
      <directionalLight position={[2, 10, -4]} intensity={0.42} color="#ffffff" />
      <directionalLight position={[-2, 9, 8]} intensity={0.35} color="#f5f5f5" />

      {/* ランウェイ上のシーリングライト（手前〜奥を均等） */}
      {[-9.5, -7, -4.5, -2, 0.5, 2.2].map((z) => (
        <spotLight
          key={`runway-ceiling-${z}`}
          position={[0, 6.8, z]}
          angle={0.72}
          penumbra={0.55}
          intensity={48}
          distance={24}
          decay={1.4}
          color="#ffffff"
        >
          <object3D attach="target" position={[0, 0.9, z]} />
        </spotLight>
      ))}

      {/* 背面スクリーン周辺の補助光 */}
      <spotLight
        position={[0, 5.8, screen.z + 2]}
        angle={0.85}
        penumbra={0.5}
        intensity={55}
        distance={28}
        color="#f8f8f8"
      >
        <object3D attach="target" position={[0, 2.2, screen.z + 1]} />
      </spotLight>

      {/* 観客席エリアの床面補助（弱め） */}
      <pointLight position={[0, 3.2, 8]} intensity={6} distance={16} decay={2} color="#ffffff" />
      <pointLight position={[0, 3.2, -8]} intensity={6} distance={16} decay={2} color="#ffffff" />

      {/* 床 */}
      <mesh position={[0, 0, roomCenterZ]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomHalfX * 2, roomDepth]} />
        <meshStandardMaterial color={colors.floor} roughness={0.95} />
      </mesh>

      {/* 天井 */}
      <mesh position={[0, ceilingY, roomCenterZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomHalfX * 2, roomDepth]} />
        <meshStandardMaterial color={colors.ceiling} roughness={1} />
      </mesh>

      {/* 奥壁（スクリーン側） */}
      <mesh position={[0, wallHeight / 2, roomMinZ]}>
        <boxGeometry args={[roomHalfX * 2, wallHeight, 0.4]} />
        <meshStandardMaterial color={colors.wall} roughness={0.92} />
      </mesh>

      {/* 手前壁は入口を開ける（カメラが外に出ても黒壁で塞がれない） */}
      <mesh position={[-(roomHalfX + entranceHalf) / 2, wallHeight / 2, roomMaxZ]}>
        <boxGeometry args={[roomHalfX - entranceHalf, wallHeight, 0.4]} />
        <meshStandardMaterial color={colors.wall} roughness={0.92} />
      </mesh>
      <mesh position={[(roomHalfX + entranceHalf) / 2, wallHeight / 2, roomMaxZ]}>
        <boxGeometry args={[roomHalfX - entranceHalf, wallHeight, 0.4]} />
        <meshStandardMaterial color={colors.wall} roughness={0.92} />
      </mesh>

      <mesh position={[-roomHalfX, wallHeight / 2, roomCenterZ]}>
        <boxGeometry args={[0.4, wallHeight, roomDepth]} />
        <meshStandardMaterial color={colors.wall} roughness={0.92} />
      </mesh>
      <mesh position={[roomHalfX, wallHeight / 2, roomCenterZ]}>
        <boxGeometry args={[0.4, wallHeight, roomDepth]} />
        <meshStandardMaterial color={colors.wall} roughness={0.92} />
      </mesh>

      {/* ランウェイ本体 */}
      <mesh position={[0, runwayY, runwayCenterZ]} receiveShadow>
        <boxGeometry args={[runwayHalfWidth * 2, 0.1, runwayLength]} />
        <meshStandardMaterial
          color={colors.runway}
          emissive={colors.runwayEdge}
          emissiveIntensity={0.65}
          roughness={0.35}
          metalness={0.12}
        />
      </mesh>
      <mesh position={[-runwayHalfWidth - 0.04, runwayY + 0.02, runwayCenterZ]}>
        <boxGeometry args={[0.08, 0.04, runwayLength]} />
        <meshStandardMaterial color="#111" emissive="#fff" emissiveIntensity={0.85} />
      </mesh>
      <mesh position={[runwayHalfWidth + 0.04, runwayY + 0.02, runwayCenterZ]}>
        <boxGeometry args={[0.08, 0.04, runwayLength]} />
        <meshStandardMaterial color="#111" emissive="#fff" emissiveIntensity={0.85} />
      </mesh>

      {/* スクリーン枠 */}
      <mesh position={[screen.x, screen.y, screen.z - 0.12]}>
        <boxGeometry args={[screen.width + 0.35, screen.height + 0.35, 0.18]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.7} metalness={0.25} />
      </mesh>
      <mesh position={[screen.x, screen.y, screen.z]}>
        <boxGeometry args={[screen.width, screen.height, 0.06]} />
        <meshStandardMaterial
          color={colors.screenBg}
          emissive="#222222"
          emissiveIntensity={0.45}
          roughness={0.55}
        />
      </mesh>

      {benches.map((bench, index) => (
        <RunwayBench key={`bench-${index}`} x={bench.x} z={bench.z} rotationY={bench.rotationY} />
      ))}
    </group>
  )
}

function RunwayBench({ x, z, rotationY }: { x: number; z: number; rotationY: number }) {
  const seat = RUNWAY.colors.seat
  const accent = RUNWAY.colors.seatAccent
  const legs: Array<[number, number]> = [
    [-1.0, 0.2],
    [1.0, 0.2],
    [-1.0, -0.25],
    [1.0, -0.25],
  ]
  return (
    <group position={[x, RUNWAY.benchGroundY, z]} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.12, 0.7]} />
        <meshStandardMaterial color={seat} roughness={0.72} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.78, -0.28]} castShadow>
        <boxGeometry args={[2.4, 0.55, 0.12]} />
        <meshStandardMaterial color={accent} roughness={0.75} metalness={0.05} />
      </mesh>
      {legs.map(([lx, lz]) => (
        <mesh key={`${lx}-${lz}`} position={[lx, 0.2 - RUNWAY.benchLegEmbed / 2, lz]} castShadow>
          <boxGeometry args={[0.12, 0.4 + RUNWAY.benchLegEmbed, 0.12]} />
          <meshStandardMaterial color={seat} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}
