import { Text } from '@react-three/drei'
import { SHOOTING_GALLERY } from '../config'

const FLOOR_PLANK_Z = [-7.8, -6.2, -4.6, -3, -1.4, 0.2, 1.8, 3.4, 5] as const
const BACK_WALL_PLANK_Y = [0.45, 1.15, 1.85, 2.55, 3.25, 3.95, 4.65] as const
const PRACTICAL_LIGHT_X = [-3.4, 0, 3.4] as const
const COVER_X = [-0.15, 1.25, 2.65] as const

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

      {/* 的を引き立てる中央舞台。奥壁と的のコントラストを分離する。 */}
      <group position={[1.25, 0, roomMinZ + 0.14]}>
        <mesh position={[0, 2.05, 0]} receiveShadow>
          <boxGeometry args={[5.7, 3.65, 0.16]} />
          <meshStandardMaterial color="#172128" roughness={0.66} metalness={0.08} />
        </mesh>
        {([-2.95, 2.95] as const).map((x) => (
          <group key={`stage-column-${x}`} position={[x, 2.05, 0.18]}>
            <mesh castShadow>
              <boxGeometry args={[0.24, 4.05, 0.24]} />
              <meshStandardMaterial color="#8a5b32" roughness={0.58} />
            </mesh>
            <mesh position={[0, 0, 0.14]}>
              <boxGeometry args={[0.07, 3.75, 0.04]} />
              <meshStandardMaterial color="#d2a55a" metalness={0.48} roughness={0.3} />
            </mesh>
          </group>
        ))}
        <mesh position={[0, 4.02, 0.18]} castShadow>
          <boxGeometry args={[6.15, 0.34, 0.28]} />
          <meshStandardMaterial color="#8a5b32" roughness={0.58} />
        </mesh>
        <mesh position={[0, 3.97, 0.35]}>
          <boxGeometry args={[5.75, 0.055, 0.04]} />
          <meshStandardMaterial color="#e1b45f" emissive="#8a4e16" emissiveIntensity={0.3} metalness={0.55} />
        </mesh>
        {[-1.75, 0, 1.75].map((x) => (
          <mesh key={`back-panel-${x}`} position={[x, 2.05, 0.1]}>
            <boxGeometry args={[0.025, 3.35, 0.03]} />
            <meshStandardMaterial color="#4d6267" emissive="#1b343b" emissiveIntensity={0.16} />
          </mesh>
        ))}
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

      {/* レーン仕切り */}
      {SHOOTING_GALLERY.laneZ.map((z, index) => (
        <group key={z}>
          <mesh position={[1.25, 0.12 + index * 0.025, z]} receiveShadow castShadow>
            <boxGeometry args={[5.85, 0.16, 0.5]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#563720' : '#432b1e'} roughness={0.72} />
          </mesh>
          <mesh position={[1.25, 0.23 + index * 0.025, z + 0.24]}>
            <boxGeometry args={[5.65, 0.055, 0.04]} />
            <meshStandardMaterial color="#c6924d" metalness={0.38} roughness={0.36} />
          </mesh>
          {([-1.8, 4.3] as const).map((x) => (
            <mesh key={x} position={[x, 1.05, z]} castShadow>
              <boxGeometry args={[0.16, 1.9, 0.16]} />
              <meshStandardMaterial color="#6e4527" roughness={0.68} />
            </mesh>
          ))}
        </group>
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

      {/* トロッコレール（奥レーン） */}
      <mesh position={[1.25, 0.14, SHOOTING_GALLERY.laneZ[0]]} receiveShadow>
        <boxGeometry args={[5.7, 0.07, 0.62]} />
        <meshStandardMaterial color="#282522" roughness={0.78} metalness={0.22} />
      </mesh>
      {[-0.2, 0.2].map((zOffset) => (
        <mesh key={zOffset} position={[1.25, 0.2, SHOOTING_GALLERY.laneZ[0] + zOffset]}>
          <boxGeometry args={[5.55, 0.055, 0.07]} />
          <meshStandardMaterial color="#a9a29a" metalness={0.72} roughness={0.28} />
        </mesh>
      ))}
      {[-1.2, -0.2, 0.8, 1.8, 2.8, 3.8].map((x) => (
        <mesh key={`rail-tie-${x}`} position={[x, 0.16, SHOOTING_GALLERY.laneZ[0]]}>
          <boxGeometry args={[0.12, 0.04, 0.56]} />
          <meshStandardMaterial color="#553720" roughness={0.76} />
        </mesh>
      ))}

      {/* ロープ・歯車デコ */}
      {([-3.8, 3.8] as const).map((x) => (
        <group key={`gear-${x}`} position={[x, 2.8, roomMinZ + 0.4]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.18, 16]} />
            <meshStandardMaterial color="#75613c" metalness={0.58} roughness={0.36} />
          </mesh>
          <mesh position={[0, 0, 0.12]}>
            <torusGeometry args={[0.39, 0.07, 8, 20]} />
            <meshStandardMaterial color="#bc9451" metalness={0.62} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.14]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.78, 0.11, 0.06]} />
            <meshStandardMaterial color="#d0a35a" metalness={0.55} roughness={0.32} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 3.6, roomMinZ + 0.35]}>
        <torusGeometry args={[1.8, 0.04, 8, 32]} />
        <meshStandardMaterial color="#6a5038" roughness={0.8} />
      </mesh>

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

      {/* 遮蔽用木箱（出現演出用） */}
      {COVER_X.map((x, index) => (
        <group key={`cover-${x}`} position={[x, 0.62, -3.5]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.95, 1.12 + index * 0.08, 0.62]} />
            <meshStandardMaterial color={index % 2 === 0 ? '#5b3922' : '#704627'} roughness={0.76} />
          </mesh>
          <mesh position={[0, 0.1, 0.33]}>
            <boxGeometry args={[0.7, 0.055, 0.025]} />
            <meshStandardMaterial color="#b17a43" roughness={0.58} />
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

function BottleShelf({ position }: { position: [number, number, number] }) {
  const bottles = [
    { x: -0.32, color: '#567f6b', scale: 0.9 },
    { x: 0, color: '#7e6848', scale: 1.08 },
    { x: 0.32, color: '#4e7180', scale: 0.82 },
  ] as const

  return (
    <group position={position}>
      <mesh position={[0, -0.42, 0]} castShadow>
        <boxGeometry args={[1.12, 0.1, 0.38]} />
        <meshStandardMaterial color="#80502d" roughness={0.66} />
      </mesh>
      <mesh position={[0, -0.48, -0.13]} castShadow>
        <boxGeometry args={[1.2, 0.12, 0.1]} />
        <meshStandardMaterial color="#c18a4f" roughness={0.55} />
      </mesh>
      {bottles.map(({ x, color, scale }) => (
        <group key={x} position={[x, -0.1, 0]} scale={scale}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.15, 0.5, 14]} />
            <meshStandardMaterial color={color} roughness={0.26} metalness={0.06} />
          </mesh>
          <mesh position={[0, 0.33, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.09, 0.2, 14]} />
            <meshStandardMaterial color={color} roughness={0.24} />
          </mesh>
          <mesh position={[0, -0.04, 0.125]}>
            <planeGeometry args={[0.14, 0.18]} />
            <meshStandardMaterial color="#d8c69a" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
