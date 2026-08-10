import { Text, useTexture } from '@react-three/drei'
import { DoubleSide } from 'three'
import { OPEN_SEA_MARKET } from '../config'
import { MarketPedestals } from './MarketPedestals'
import { MarketWalkers } from './MarketWalkers'

/** 青系 Digital Sculpture 展示ホール */
export function MarketRoom() {
  const { roomHalfX, roomMinZ, roomMaxZ, wallHeight, colors, entranceHalf } = OPEN_SEA_MARKET
  const depth = roomMaxZ - roomMinZ
  const centerZ = (roomMinZ + roomMaxZ) / 2
  const shadowExtent = Math.max(roomHalfX, depth / 2) + 2

  return (
    <group>
      <color attach="background" args={['#102030']} />
      <fog attach="fog" args={['#102030', 70, 155]} />

      <ambientLight intensity={0.55} color="#dceeff" />
      <hemisphereLight args={['#e8f4ff', '#1a3048', 0.72]} />
      <directionalLight
        castShadow
        position={[14, 28, 12]}
        intensity={1.45}
        color="#f2f8ff"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-camera-near={0.5}
        shadow-camera-far={110}
        shadow-bias={-0.00015}
        shadow-normalBias={0.04}
      />
      <pointLight position={[0, 4.6, 0]} intensity={36} distance={58} color={colors.glow} />
      <pointLight
        position={[-roomHalfX * 0.55, 4.0, centerZ]}
        intensity={20}
        distance={40}
        color="#9ad0ff"
      />
      <pointLight
        position={[roomHalfX * 0.55, 4.0, centerZ]}
        intensity={20}
        distance={40}
        color="#9ad0ff"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]} receiveShadow>
        <planeGeometry args={[roomHalfX * 2, depth]} />
        <meshStandardMaterial color={colors.floor} roughness={0.78} metalness={0.1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[roomHalfX * 0.55, depth * 0.35]} />
        <meshStandardMaterial color={colors.floorAccent} roughness={0.72} metalness={0.14} />
      </mesh>

      <OpenSeaFloorLogo />

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

      <mesh position={[0, 3.8, roomMinZ + 0.22]}>
        <boxGeometry args={[roomHalfX * 1.2, 0.2, 0.08]} />
        <meshStandardMaterial
          color={colors.accent}
          emissive={colors.accent}
          emissiveIntensity={0.55}
        />
      </mesh>
      <Text
        position={[0, 4.25, roomMinZ + 0.28]}
        fontSize={0.55}
        color="#e8f4ff"
        anchorX="center"
        anchorY="middle"
      >
        OpenSea Market
      </Text>
      <Text
        position={[0, 3.55, roomMinZ + 0.28]}
        fontSize={0.22}
        color="#7ec4ff"
        anchorX="center"
        anchorY="middle"
      >
        Digital Sculpture Gallery
      </Text>

      <MarketPedestals />
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
