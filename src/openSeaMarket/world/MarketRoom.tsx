import { Text, useTexture } from '@react-three/drei'
import { DoubleSide } from 'three'
import { OPEN_SEA_MARKET, MARKET_OBSTACLES } from '../config'
import { MarketWalkers } from './MarketWalkers'

/** 青系の軽量マーケット室内（広め・影カメラを会場全体に合わせる） */
export function MarketRoom() {
  const { roomHalfX, roomMinZ, roomMaxZ, wallHeight, colors, entranceHalf } = OPEN_SEA_MARKET
  const depth = roomMaxZ - roomMinZ
  const centerZ = (roomMinZ + roomMaxZ) / 2
  const shadowExtent = Math.max(roomHalfX, depth / 2) + 2

  return (
    <group>
      <color attach="background" args={['#102030']} />
      <fog attach="fog" args={['#102030', 42, 95]} />

      <ambientLight intensity={0.55} color="#dceeff" />
      <hemisphereLight args={['#e8f4ff', '#1a3048', 0.72]} />
      <directionalLight
        castShadow
        position={[10, 22, 8]}
        intensity={1.45}
        color="#f2f8ff"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-camera-near={0.5}
        shadow-camera-far={70}
        shadow-bias={-0.00015}
      />
      <pointLight position={[0, 4.2, 0]} intensity={28} distance={40} color={colors.glow} />
      <pointLight position={[-roomHalfX * 0.55, 3.8, centerZ]} intensity={16} distance={28} color="#9ad0ff" />
      <pointLight position={[roomHalfX * 0.55, 3.8, centerZ]} intensity={16} distance={28} color="#9ad0ff" />

      {/* 床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]} receiveShadow>
        <planeGeometry args={[roomHalfX * 2, depth]} />
        <meshStandardMaterial color={colors.floor} roughness={0.78} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[roomHalfX * 0.95, depth * 0.55]} />
        <meshStandardMaterial color={colors.floorAccent} roughness={0.72} metalness={0.14} />
      </mesh>

      <OpenSeaFloorLogo />

      {/* 壁 */}
      <mesh position={[0, wallHeight / 2, roomMinZ]} castShadow receiveShadow>
        <boxGeometry args={[roomHalfX * 2 + 0.4, wallHeight, 0.35]} />
        <meshStandardMaterial color={colors.wall} roughness={0.78} />
      </mesh>
      <mesh
        position={[-(roomHalfX + entranceHalf) / 2, wallHeight / 2, roomMaxZ]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[roomHalfX - entranceHalf, wallHeight, 0.35]} />
        <meshStandardMaterial color={colors.wall} roughness={0.78} />
      </mesh>
      <mesh
        position={[(roomHalfX + entranceHalf) / 2, wallHeight / 2, roomMaxZ]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[roomHalfX - entranceHalf, wallHeight, 0.35]} />
        <meshStandardMaterial color={colors.wall} roughness={0.78} />
      </mesh>
      <mesh position={[-roomHalfX, wallHeight / 2, centerZ]} castShadow receiveShadow>
        <boxGeometry args={[0.35, wallHeight, depth]} />
        <meshStandardMaterial color={colors.wall} roughness={0.78} />
      </mesh>
      <mesh position={[roomHalfX, wallHeight / 2, centerZ]} castShadow receiveShadow>
        <boxGeometry args={[0.35, wallHeight, depth]} />
        <meshStandardMaterial color={colors.wall} roughness={0.78} />
      </mesh>

      {/* アクセント帯 */}
      <mesh position={[0, 3.6, roomMinZ + 0.22]}>
        <boxGeometry args={[roomHalfX * 1.35, 0.2, 0.08]} />
        <meshStandardMaterial
          color={colors.accent}
          emissive={colors.accent}
          emissiveIntensity={0.55}
        />
      </mesh>
      <Text
        position={[0, 4.05, roomMinZ + 0.28]}
        fontSize={0.55}
        color="#e8f4ff"
        anchorX="center"
        anchorY="middle"
      >
        OpenSea Market
      </Text>

      {MARKET_OBSTACLES.map((o, i) => (
        <mesh key={i} position={[o.x, 0.55, o.z]} castShadow receiveShadow>
          <boxGeometry args={[o.halfX * 2, 1.1, o.halfZ * 2]} />
          <meshStandardMaterial color="#243e5c" roughness={0.7} metalness={0.15} />
        </mesh>
      ))}

      <MarketWalkers />
    </group>
  )
}

/** 床中央の OpenSea ロゴ（白文字・透過背景の床用アセット） */
function OpenSeaFloorLogo() {
  const map = useTexture('/brand-opensea-floor.png')
  map.anisotropy = 8

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
      <planeGeometry args={[8.5, 3.0]} />
      <meshBasicMaterial
        map={map}
        transparent
        toneMapped={false}
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  )
}
