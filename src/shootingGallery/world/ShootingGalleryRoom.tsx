import { Text } from '@react-three/drei'
import { SHOOTING_GALLERY } from '../config'

const FLOOR_PLANK_Z = [-7.8, -6.2, -4.6, -3, -1.4, 0.2, 1.8, 3.4, 5] as const
const BACK_WALL_PLANK_Y = [0.45, 1.15, 1.85, 2.55, 3.25, 3.95, 4.65] as const
const PRACTICAL_LIGHT_X = [-3.4, 0, 3.4] as const

/** 木造遊園地風の射的場。西部劇風だがリアル戦闘施設にはしない。 */
export function ShootingGalleryRoom() {
  const { roomHalfX, roomMinZ, roomMaxZ, counterZ } = SHOOTING_GALLERY
  const depth = roomMaxZ - roomMinZ
  const centerZ = (roomMaxZ + roomMinZ) * 0.5

  return (
    <group>
      <color attach="background" args={['#100d0c']} />
      <fog attach="fog" args={['#15100d', 14, 34]} />
      <ambientLight intensity={0.24} color="#b8a080" />
      <hemisphereLight args={['#70849c', '#24170f', 0.42]} />
      <directionalLight
        castShadow
        position={[-5, 11, 7]}
        intensity={2.2}
        color="#ffd7a0"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={8}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0002}
      />
      <spotLight
        castShadow
        position={[1.2, 4.8, 2.5]}
        intensity={65}
        distance={18}
        angle={0.52}
        penumbra={0.65}
        decay={2}
        color="#ffd09a"
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[1.2, 3.5, -3.8]} intensity={24} distance={9} decay={2} color="#ffb65c" />
      <pointLight position={[-3.8, 2.7, 1.2]} intensity={10} distance={6} decay={2} color="#d17c3e" />

      {/* 床 */}
      <mesh position={[0, -0.05, centerZ]} receiveShadow>
        <boxGeometry args={[roomHalfX * 2 + 2, 0.12, depth + 2]} />
        <meshStandardMaterial color="#4a3a28" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.01, centerZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[roomHalfX * 2, depth]} />
        <meshStandardMaterial color="#59412d" roughness={0.88} />
      </mesh>
      {FLOOR_PLANK_Z.map((z) => (
        <mesh key={`floor-seam-${z}`} position={[0, 0.018, z]} receiveShadow>
          <boxGeometry args={[roomHalfX * 2, 0.012, 0.025]} />
          <meshStandardMaterial color="#251a14" roughness={0.95} />
        </mesh>
      ))}
      {[-4.4, 0, 4.4].map((x) => (
        <mesh key={`floor-inlay-${x}`} position={[x, 0.022, centerZ]} receiveShadow>
          <boxGeometry args={[0.035, 0.014, depth]} />
          <meshStandardMaterial color="#88603a" roughness={0.82} />
        </mesh>
      ))}

      {/* 背壁・側壁 */}
      <mesh position={[0, 2.4, roomMinZ - 0.2]} castShadow receiveShadow>
        <boxGeometry args={[roomHalfX * 2 + 1, 5.2, 0.4]} />
        <meshStandardMaterial color="#3a2c20" roughness={0.9} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * (roomHalfX + 0.15), 2.2, centerZ]} castShadow receiveShadow>
          <boxGeometry args={[0.35, 4.6, depth + 0.8]} />
          <meshStandardMaterial color="#463528" roughness={0.9} />
        </mesh>
      ))}
      {BACK_WALL_PLANK_Y.map((y, index) => (
        <mesh key={`back-plank-${y}`} position={[0, y, roomMinZ + 0.03]} receiveShadow>
          <boxGeometry args={[roomHalfX * 2, 0.62, 0.08]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? '#35251d' : '#402c20'}
            roughness={0.86}
          />
        </mesh>
      ))}

      {/* 山小屋の窓を思わせる、明快なターゲット舞台。 */}
      <group position={[1, 0, roomMinZ + 0.14]}>
        <mesh position={[0, 2.15, 0]} receiveShadow>
          <boxGeometry args={[7.35, 4.15, 0.16]} />
          <meshStandardMaterial color="#18252a" roughness={0.72} />
        </mesh>
        <MountainBackdrop />
        {([-3.78, 3.78] as const).map((x) => (
          <group key={`stage-column-${x}`} position={[x, 2.15, 0.2]}>
            <mesh castShadow>
              <boxGeometry args={[0.3, 4.5, 0.3]} />
              <meshStandardMaterial color="#765033" roughness={0.68} />
            </mesh>
            <mesh position={[0, 0, 0.17]}>
              <boxGeometry args={[0.07, 4.18, 0.04]} />
              <meshStandardMaterial color="#bd8a50" roughness={0.48} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 4.3, 0.2]} castShadow>
          <boxGeometry args={[7.85, 0.38, 0.34]} />
          <meshStandardMaterial color="#765033" roughness={0.68} />
        </mesh>
        <mesh position={[0, 4.2, 0.39]}>
          <boxGeometry args={[7.42, 0.055, 0.04]} />
          <meshStandardMaterial color="#e0b36a" emissive="#80501e" emissiveIntensity={0.22} />
        </mesh>
      </group>

      {/* 屋根梁 */}
      {[-4, -1, 2, 4.5].map((z) => (
        <mesh key={z} position={[0, 4.35, z]} castShadow>
          <boxGeometry args={[roomHalfX * 2 - 0.4, 0.28, 0.28]} />
          <meshStandardMaterial color="#704828" roughness={0.72} />
        </mesh>
      ))}
      {[-5.5, -2.75, 0, 2.75, 5.5].map((x) => (
        <mesh key={`roof-runner-${x}`} position={[x, 4.43, centerZ]} castShadow>
          <boxGeometry args={[0.16, 0.14, depth - 0.6]} />
          <meshStandardMaterial color="#39251a" roughness={0.82} />
        </mesh>
      ))}
      {PRACTICAL_LIGHT_X.map((x) => (
        <group key={`practical-${x}`} position={[x, 3.92, -0.8]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.22, 0.36, 0.18, 20]} />
            <meshStandardMaterial color="#292a2b" metalness={0.62} roughness={0.34} />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <sphereGeometry args={[0.105, 16, 10]} />
            <meshStandardMaterial color="#fff0bd" emissive="#ffae42" emissiveIntensity={2.4} />
          </mesh>
        </group>
      ))}

      {/* 射撃カウンター */}
      <mesh position={[0, 0.7, counterZ]} castShadow receiveShadow>
        <boxGeometry args={[8.2, 1.15, 0.7]} />
        <meshStandardMaterial color="#4d3021" roughness={0.76} />
      </mesh>
      <mesh position={[0, 1.32, counterZ]} castShadow>
        <boxGeometry args={[8.5, 0.14, 0.9]} />
        <meshStandardMaterial color="#a06c3d" roughness={0.58} />
      </mesh>
      {[-3.4, -1.15, 1.15, 3.4].map((x) => (
        <mesh key={x} position={[x, 0.55, counterZ + 0.05]} castShadow>
          <boxGeometry args={[0.18, 1.0, 0.55]} />
          <meshStandardMaterial color="#4a3224" roughness={0.88} />
        </mesh>
      ))}
      {[-3.05, -1.02, 1.02, 3.05].map((x) => (
        <group key={`counter-panel-${x}`} position={[x, 0.7, counterZ + 0.365]}>
          <mesh>
            <boxGeometry args={[1.72, 0.82, 0.045]} />
            <meshStandardMaterial color="#2c1d18" roughness={0.82} />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <boxGeometry args={[1.48, 0.6, 0.025]} />
            <meshStandardMaterial color="#654127" roughness={0.7} />
          </mesh>
          {([-0.68, 0.68] as const).map((studX) => (
            <mesh key={studX} position={[studX, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.025, 12]} />
              <meshStandardMaterial color="#d0a052" metalness={0.65} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, 1.4, counterZ + 0.1]}>
        <boxGeometry args={[8.15, 0.035, 0.72]} />
        <meshStandardMaterial color="#e0b068" metalness={0.45} roughness={0.3} />
      </mesh>
      {/* ロッジバーらしい真鍮のフットレールと客席。 */}
      <mesh position={[0, 0.38, counterZ + 0.66]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 7.5, 14]} />
        <meshStandardMaterial color="#c99a50" metalness={0.76} roughness={0.25} />
      </mesh>
      {[-3.45, 3.45].map((x) => (
        <mesh key={`foot-rail-bracket-${x}`} position={[x, 0.38, counterZ + 0.48]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.38, 12]} />
          <meshStandardMaterial color="#b48243" metalness={0.7} roughness={0.28} />
        </mesh>
      ))}
      <BarStool position={[-2.55, 0, counterZ + 1.15]} rotationY={0.12} />
      <BarStool position={[2.45, 0, counterZ + 1.2]} rotationY={-0.16} />

      {/* 三段の木製ターゲット棚。機械設備に見える装飾は置かない。 */}
      {SHOOTING_GALLERY.laneZ.map((z, index) => (
        <group key={z}>
          <mesh position={[1, 0.14 + index * 0.035, z]} receiveShadow castShadow>
            <boxGeometry args={[7.25, 0.2, 0.48]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#70492d' : '#5d3d29'} roughness={0.7} />
          </mesh>
          <mesh position={[1, 0.27 + index * 0.035, z + 0.22]}>
            <boxGeometry args={[7.05, 0.055, 0.045]} />
            <meshStandardMaterial color="#d1a165" roughness={0.44} />
          </mesh>
        </group>
      ))}
      {SHOOTING_GALLERY.barObstacleSegments.map(({ x, z, width }, index) => (
        <BackBarCounter key={`${x}-${z}`} position={[x, 0, z]} width={width} bottleOffset={index} />
      ))}

      {/* 木箱・樽・岩 */}
      <Crate position={[-4.8, 0.4, 1.6]} />
      <Crate position={[4.6, 0.35, 1.2]} scale={0.85} />
      <Barrel position={[-5.2, 0.55, 3.4]} />
      <Barrel position={[5.1, 0.55, 3.2]} />
      <Rock position={[-5.4, 0.35, -1.8]} />
      <Rock position={[5.2, 0.4, -3.5]} />
      <Rock position={[-3.8, 0.3, -6.8]} />
      <BottleShelf position={[-4.75, 2.05, -1.7]} />
      <BottleShelf position={[5.15, 2.2, -2.8]} />
      <LogStack position={[-5.2, 0.38, -4.9]} />
      <LogStack position={[5.35, 0.38, -5.4]} />

      {/* 看板 */}
      <group position={[0, 3.9, counterZ + 0.2]}>
        <mesh position={[0, 0, -0.06]} castShadow>
          <boxGeometry args={[5.55, 1.38, 0.2]} />
          <meshStandardMaterial color="#8b5a30" roughness={0.62} />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[5.2, 1.05, 0.2]} />
          <meshStandardMaterial color="#151a1f" roughness={0.62} emissive="#9c5b22" emissiveIntensity={0.14} />
        </mesh>
        <mesh position={[0, 0, 0.115]}>
          <boxGeometry args={[4.92, 0.82, 0.025]} />
          <meshStandardMaterial color="#202b31" roughness={0.5} />
        </mesh>
        <Text position={[0, 0.08, 0.14]} fontSize={0.38} color="#f6df9d" anchorX="center" anchorY="middle">
          SHOOTING GALLERY
        </Text>
        <Text position={[0, -0.32, 0.12]} fontSize={0.18} color="#c5bda9" anchorX="center" anchorY="middle">
          HIT THE MARK
        </Text>
        {[-2.35, -1.55, -0.78, 0, 0.78, 1.55, 2.35].map((x) => (
          <mesh key={`marquee-bulb-${x}`} position={[x, 0.6, 0.14]}>
            <sphereGeometry args={[0.045, 10, 8]} />
            <meshStandardMaterial color="#ffe7ac" emissive="#ff9d2e" emissiveIntensity={2.5} />
          </mesh>
        ))}
      </group>

    </group>
  )
}

function MountainBackdrop() {
  return (
    <group position={[0, 0, 0.11]}>
      {/* 塗装された遠景と手前の山並み。射的レーンの背景として静的に見せる。 */}
      <mesh position={[-1.9, 1.65, 0]} scale={[2.5, 1.75, 1]}>
        <circleGeometry args={[1, 3, Math.PI / 2]} />
        <meshStandardMaterial color="#354d50" roughness={0.92} />
      </mesh>
      <mesh position={[1.55, 1.55, 0.01]} scale={[2.9, 1.95, 1]}>
        <circleGeometry args={[1, 3, Math.PI / 2]} />
        <meshStandardMaterial color="#2b4142" roughness={0.94} />
      </mesh>
      <mesh position={[-1.9, 2.88, 0.025]} scale={[0.72, 0.48, 1]}>
        <circleGeometry args={[1, 3, Math.PI / 2]} />
        <meshStandardMaterial color="#d8d4c5" roughness={0.84} />
      </mesh>
      <mesh position={[1.55, 2.94, 0.03]} scale={[0.82, 0.52, 1]}>
        <circleGeometry args={[1, 3, Math.PI / 2]} />
        <meshStandardMaterial color="#e5dfcf" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.68, 0.04]} scale={[4.3, 1.08, 1]}>
        <circleGeometry args={[1, 3, Math.PI / 2]} />
        <meshStandardMaterial color="#203536" roughness={0.96} />
      </mesh>

      {([-3.25, -2.78, 2.85, 3.3] as const).map((x, index) => (
        <PineSilhouette
          key={x}
          position={[x, 0.92 + (index % 2) * 0.16, 0.08]}
          scale={index % 2 === 0 ? 0.9 : 0.72}
        />
      ))}

      <Text
        position={[0, 3.7, 0.08]}
        fontSize={0.19}
        color="#e4c88c"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.16}
      >
        HIGH PEAK LODGE
      </Text>
    </group>
  )
}

function PineSilhouette({
  position,
  scale,
}: {
  position: [number, number, number]
  scale: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, -0.48, 0]}>
        <boxGeometry args={[0.12, 0.7, 0.06]} />
        <meshStandardMaterial color="#172724" roughness={0.95} />
      </mesh>
      {[0.38, 0, -0.38].map((y, index) => (
        <mesh key={y} position={[0, y, 0]} scale={[1 - index * 0.16, 1, 1]}>
          <circleGeometry args={[0.64, 3, Math.PI / 2]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#244139' : '#1d352f'} roughness={0.96} />
        </mesh>
      ))}
    </group>
  )
}

function LogStack({ position }: { position: [number, number, number] }) {
  const logs = [
    [-0.34, 0, 0],
    [0.34, 0, 0],
    [0, 0.42, 0],
  ] as const

  return (
    <group position={position}>
      {logs.map(([x, y, z]) => (
        <group key={`${x}-${y}`} position={[x, y, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.28, 0.3, 0.72, 14]} />
            <meshStandardMaterial color="#654127" roughness={0.82} />
          </mesh>
          <mesh position={[0, 0, 0.37]}>
            <circleGeometry args={[0.255, 14]} />
            <meshStandardMaterial color="#b47b49" roughness={0.76} />
          </mesh>
          <mesh position={[0, 0, 0.375]}>
            <ringGeometry args={[0.11, 0.135, 14]} />
            <meshStandardMaterial color="#7c4d2b" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Crate({
  position,
  scale = 1,
}: {
  position: [number, number, number]
  scale?: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.95, 0.85, 0.95]} />
        <meshStandardMaterial color="#684226" roughness={0.78} />
      </mesh>
      {([-0.39, 0.39] as const).map((x) => (
        <mesh key={x} position={[x, 0, 0.49]} castShadow>
          <boxGeometry args={[0.09, 0.78, 0.05]} />
          <meshStandardMaterial color="#a16c3b" roughness={0.68} />
        </mesh>
      ))}
      {[-0.31, 0, 0.31].map((y) => (
        <mesh key={y} position={[0, y, 0.5]} castShadow>
          <boxGeometry args={[0.85, 0.075, 0.055]} />
          <meshStandardMaterial color="#8e5b31" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.54]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.08, 0.82, 0.045]} />
        <meshStandardMaterial color="#b17a43" roughness={0.62} />
      </mesh>
    </group>
  )
}

function Barrel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.43, 0.47, 1.05, 16]} />
        <meshStandardMaterial color="#704626" roughness={0.74} />
      </mesh>
      {[-0.37, 0, 0.37].map((y) => (
        <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[0.46 - Math.abs(y) * 0.05, 0.035, 8, 20]} />
          <meshStandardMaterial color="#46484a" metalness={0.58} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0, 0.53, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.39, 0.39, 0.035, 16]} />
        <meshStandardMaterial color="#8b5c35" roughness={0.72} />
      </mesh>
    </group>
  )
}

function Rock({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} rotation={[0.08, 0.35, -0.06]} scale={[1.15, 0.78, 0.92]} castShadow receiveShadow>
      <dodecahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial color="#625d52" roughness={0.9} />
    </mesh>
  )
}

/** 的を完全には隠さず、移動中に見え隠れさせるバックバーの什器。 */
function BackBarCounter({
  position,
  width,
  bottleOffset,
}: {
  position: [number, number, number]
  width: number
  bottleOffset: number
}) {
  const bottleColors = ['#50745e', '#805044', '#496b73'] as const

  return (
    <group position={position}>
      <mesh position={[0, 0.43, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 0.78, 0.62]} />
        <meshStandardMaterial color="#4a2d20" roughness={0.76} />
      </mesh>
      <mesh position={[0, 0.84, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[width + 0.16, 0.13, 0.76]} />
        <meshStandardMaterial color="#9b6638" roughness={0.54} />
      </mesh>
      <mesh position={[0, 0.91, 0.03]}>
        <boxGeometry args={[width + 0.08, 0.025, 0.66]} />
        <meshStandardMaterial color="#d1a05d" metalness={0.3} roughness={0.38} />
      </mesh>
      {([-0.32, 0.32] as const).map((panelX) => (
        <mesh key={panelX} position={[panelX * width, 0.43, 0.325]}>
          <boxGeometry args={[width * 0.48, 0.58, 0.035]} />
          <meshStandardMaterial color="#684027" roughness={0.68} />
        </mesh>
      ))}
      {([-0.31, 0, 0.31] as const).map((ratio, index) => (
        <DecorativeBottle
          key={ratio}
          position={[ratio * width, 1.2, 0.02]}
          color={bottleColors[(index + bottleOffset) % bottleColors.length]!}
          scale={0.78 + ((index + bottleOffset) % 2) * 0.14}
        />
      ))}
      <mesh position={[width * 0.37, 1.03, 0.04]} rotation={[0, 0, -0.12]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.34, 14]} />
        <meshStandardMaterial color="#a67b4d" roughness={0.5} metalness={0.18} />
      </mesh>
    </group>
  )
}

function BottleShelf({ position }: { position: [number, number, number] }) {
  const shelfLevels = [-0.78, 0, 0.78] as const
  const bottleColors = [
    ['#567f6b', '#8b633d', '#4e7180'],
    ['#764b42', '#50745e', '#977443'],
    ['#496b73', '#6c8053', '#805044'],
  ] as const

  return (
    <group position={position}>
      <mesh position={[0, 0.1, -0.16]} castShadow receiveShadow>
        <boxGeometry args={[1.75, 2.75, 0.16]} />
        <meshStandardMaterial color="#2b211c" roughness={0.82} />
      </mesh>
      {([-0.83, 0.83] as const).map((x) => (
        <mesh key={`shelf-side-${x}`} position={[x, 0.1, 0]} castShadow>
          <boxGeometry args={[0.12, 2.9, 0.42]} />
          <meshStandardMaterial color="#80502d" roughness={0.66} />
        </mesh>
      ))}
      {shelfLevels.map((shelfY, row) => (
        <group key={shelfY}>
          <mesh position={[0, shelfY, 0]} castShadow>
            <boxGeometry args={[1.68, 0.11, 0.46]} />
            <meshStandardMaterial color="#9b6638" roughness={0.62} />
          </mesh>
          <mesh position={[0, shelfY + 0.02, 0.24]}>
            <boxGeometry args={[1.55, 0.035, 0.035]} />
            <meshStandardMaterial color="#d0a060" metalness={0.45} roughness={0.36} />
          </mesh>
          {([-0.52, 0, 0.52] as const).map((x, column) => (
            <DecorativeBottle
              key={`${shelfY}-${x}`}
              position={[x, shelfY + 0.34, 0.08]}
              color={bottleColors[row]![column]!}
              scale={0.82 + ((row + column) % 3) * 0.1}
            />
          ))}
        </group>
      ))}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[1.82, 0.16, 0.46]} />
        <meshStandardMaterial color="#9b6638" roughness={0.62} />
      </mesh>
    </group>
  )
}

function DecorativeBottle({
  position,
  color,
  scale,
}: {
  position: [number, number, number]
  color: string
  scale: number
}) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow>
        <cylinderGeometry args={[0.11, 0.14, 0.46, 14]} />
        <meshStandardMaterial color={color} roughness={0.24} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.08, 0.18, 14]} />
        <meshStandardMaterial color={color} roughness={0.22} />
      </mesh>
      <mesh position={[0, -0.03, 0.115]}>
        <planeGeometry args={[0.13, 0.16]} />
        <meshStandardMaterial color="#dfcfa8" roughness={0.7} />
      </mesh>
    </group>
  )
}

function BarStool({
  position,
  rotationY,
}: {
  position: [number, number, number]
  rotationY: number
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1.02, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.44, 0.16, 20]} />
        <meshStandardMaterial color="#513225" roughness={0.58} />
      </mesh>
      <mesh position={[0, 1.12, 0]}>
        <cylinderGeometry args={[0.36, 0.38, 0.08, 20]} />
        <meshStandardMaterial color="#9a513d" roughness={0.46} />
      </mesh>
      {([-0.25, 0.25] as const).flatMap((x) =>
        ([-0.2, 0.2] as const).map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.5, z]} castShadow>
            <cylinderGeometry args={[0.035, 0.045, 0.95, 10]} />
            <meshStandardMaterial color="#493326" roughness={0.7} />
          </mesh>
        )),
      )}
      <mesh position={[0, 0.48, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.025, 8, 20]} />
        <meshStandardMaterial color="#b88749" metalness={0.52} roughness={0.35} />
      </mesh>
      {([-0.25, 0.25] as const).map((x) => (
        <mesh key={`back-post-${x}`} position={[x, 1.48, -0.22]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 0.78, 10]} />
          <meshStandardMaterial color="#493326" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 1.82, -0.22]} castShadow>
        <boxGeometry args={[0.68, 0.38, 0.14]} />
        <meshStandardMaterial color="#8e4938" roughness={0.54} />
      </mesh>
    </group>
  )
}
