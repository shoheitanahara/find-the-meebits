import { JAZZ_BAR } from '../config'
import { useJazzBarStore } from '../store'

/** Jazz Bar：ステージスクリーン＋丸テーブル／丸椅子 */
export function JazzBarRoom() {
  const playbackStarted = useJazzBarStore((state) => state.playbackStarted)
  const {
    roomHalfX,
    roomMinZ,
    roomMaxZ,
    wallHeight,
    ceilingY,
    screen,
    stools,
    tables,
    colors,
    entranceHalf,
    backWallThickness,
  } = JAZZ_BAR

  const roomDepth = roomMaxZ - roomMinZ
  const roomCenterZ = (roomMinZ + roomMaxZ) / 2
  const wallT = backWallThickness
  const wallZ = roomMinZ
  /** 映像用の開口（枠の内側） */
  const openHalfW = screen.width / 2 + 0.04
  const openHalfH = screen.height / 2 + 0.04
  const bottomH = Math.max(0.08, screen.y - openHalfH)
  const topH = Math.max(0.08, wallHeight - (screen.y + openHalfH))
  const sideW = Math.max(0.08, roomHalfX - openHalfW)

  return (
    <group>
      {/* blending 用: 背景は透明。暗さは main の bg と壁・床で稼ぐ */}
      <fog attach="fog" args={['#1a2434', 28, 58]} />

      <ambientLight intensity={0.48} color="#b8c8dc" />
      <hemisphereLight args={['#6a88b0', '#1a2030', 0.55]} />
      <directionalLight position={[0, 8, 4]} intensity={0.42} color="#d0e0ff" />

      <spotLight
        position={[0, screen.y + 2.2, screen.z + 3.5]}
        angle={0.78}
        penumbra={0.55}
        intensity={48}
        distance={28}
        decay={1.5}
        color="#d8ecff"
      >
        <object3D attach="target" position={[0, screen.y - 0.4, screen.z + 0.5]} />
      </spotLight>
      <pointLight position={[0, 3.4, 6]} intensity={9} distance={16} decay={2} color="#f0b878" />
      <pointLight position={[-4, 3.0, 1]} intensity={6.5} distance={12} decay={2} color="#f0c090" />
      <pointLight position={[4, 3.0, 1]} intensity={6.5} distance={12} decay={2} color="#f0c090" />

      <mesh position={[0, 0, roomCenterZ]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomHalfX * 2, roomDepth]} />
        <meshStandardMaterial color={colors.floor} roughness={0.92} />
      </mesh>

      {/* 組と組のあいだの通路 */}
      {JAZZ_BAR.aisleXs.map((x) => (
        <mesh key={`aisle-${x}`} position={[x, 0.01, 1.0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[JAZZ_BAR.aisleCarpetWidth, 18]} />
          <meshStandardMaterial color={colors.carpet} roughness={0.95} />
        </mesh>
      ))}

      {/* 通路の足元灯 */}
      {JAZZ_BAR.aisleXs.map((x) =>
        JAZZ_BAR.aisleLightZs.map((z) => (
          <AisleFloorLight key={`floor-light-${x}-${z}`} x={x} z={z} />
        )),
      )}

      <mesh position={[0, ceilingY, roomCenterZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomHalfX * 2, roomDepth]} />
        <meshStandardMaterial color={colors.ceiling} roughness={1} />
      </mesh>

      {/* 奥壁: スクリーン開口を空けて4枚に分割（映像が壁に張り付いて見える） */}
      <mesh position={[0, bottomH / 2, wallZ]}>
        <boxGeometry args={[roomHalfX * 2, bottomH, wallT]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh position={[0, screen.y + openHalfH + topH / 2, wallZ]}>
        <boxGeometry args={[roomHalfX * 2, topH, wallT]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh position={[-(openHalfW + sideW / 2), wallHeight / 2, wallZ]}>
        <boxGeometry args={[sideW, wallHeight, wallT]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh position={[openHalfW + sideW / 2, wallHeight / 2, wallZ]}>
        <boxGeometry args={[sideW, wallHeight, wallT]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      <mesh position={[-(roomHalfX + entranceHalf) / 2, wallHeight / 2, roomMaxZ]}>
        <boxGeometry args={[roomHalfX - entranceHalf, wallHeight, 0.4]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh position={[(roomHalfX + entranceHalf) / 2, wallHeight / 2, roomMaxZ]}>
        <boxGeometry args={[roomHalfX - entranceHalf, wallHeight, 0.4]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      <mesh position={[-roomHalfX, wallHeight / 2, roomCenterZ]}>
        <boxGeometry args={[0.4, wallHeight, roomDepth]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh position={[roomHalfX, wallHeight / 2, roomCenterZ]}>
        <boxGeometry args={[0.4, wallHeight, roomDepth]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      {/* スクリーン枠（開口の縁だけ。中は空けて映像を通す） */}
      <ScreenFrame />

      {/* 再生前だけ開口を黒で塞ぐ */}
      {!playbackStarted ? (
        <mesh position={[screen.x, screen.y, screen.z]}>
          <planeGeometry args={[screen.width, screen.height]} />
          <meshStandardMaterial
            color={colors.screenBg}
            emissive="#102030"
            emissiveIntensity={0.35}
            roughness={0.5}
          />
        </mesh>
      ) : null}

      {tables.map((table, index) => (
        <JazzBarRoundTable key={`table-${index}`} x={table.x} z={table.z} />
      ))}
      {stools.map((stool, index) => (
        <JazzBarStool key={`stool-${index}`} x={stool.x} z={stool.z} />
      ))}
    </group>
  )
}

/** 通路の足元灯：薄い発光プレート + 短い pointLight */
function AisleFloorLight({ x, z }: { x: number; z: number }) {
  const glow = JAZZ_BAR.colors.accent
  return (
    <group position={[x, 0.03, z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.55, 0.18]} />
        <meshStandardMaterial
          color="#0a1820"
          emissive={glow}
          emissiveIntensity={0.85}
          roughness={0.4}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.58, 0.04, 0.2]} />
        <meshStandardMaterial color="#151c28" roughness={0.7} metalness={0.35} />
      </mesh>
      <pointLight
        position={[0, 0.35, 0]}
        intensity={4.2}
        distance={4.0}
        decay={2}
        color={glow}
      />
    </group>
  )
}

function ScreenFrame() {
  const { screen, colors } = JAZZ_BAR
  const bead = 0.14
  const depth = 0.16
  const z = screen.z - 0.02
  const innerW = screen.width
  const innerH = screen.height
  const outerW = innerW + bead * 2
  const outerH = innerH + bead * 2

  return (
    <group>
      {/* 上下 */}
      <mesh position={[0, screen.y + (innerH + bead) / 2, z]}>
        <boxGeometry args={[outerW, bead, depth]} />
        <meshStandardMaterial color={colors.screenFrame} roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[0, screen.y - (innerH + bead) / 2, z]}>
        <boxGeometry args={[outerW, bead, depth]} />
        <meshStandardMaterial color={colors.screenFrame} roughness={0.55} metalness={0.35} />
      </mesh>
      {/* 左右 */}
      <mesh position={[-(innerW + bead) / 2, screen.y, z]}>
        <boxGeometry args={[bead, innerH, depth]} />
        <meshStandardMaterial color={colors.screenFrame} roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[(innerW + bead) / 2, screen.y, z]}>
        <boxGeometry args={[bead, innerH, depth]} />
        <meshStandardMaterial color={colors.screenFrame} roughness={0.55} metalness={0.35} />
      </mesh>
    </group>
  )
}

function JazzBarStool({ x, z }: { x: number; z: number }) {
  const seat = JAZZ_BAR.colors.seat
  const accent = JAZZ_BAR.colors.seatAccent
  return (
    <group position={[x, JAZZ_BAR.stoolGroundY, z]}>
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.36, 0.1, 20]} />
        <meshStandardMaterial color={seat} roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.3, 0.04, 20]} />
        <meshStandardMaterial color={accent} roughness={0.65} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.07, 0.42, 12]} />
        <meshStandardMaterial color={seat} roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.28, 0.05, 16]} />
        <meshStandardMaterial color="#243040" roughness={0.85} metalness={0.15} />
      </mesh>
    </group>
  )
}

function JazzBarRoundTable({ x, z }: { x: number; z: number }) {
  const { table, tableTop } = JAZZ_BAR.colors
  return (
    <group position={[x, JAZZ_BAR.tableGroundY, z]}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.74, 0.08, 28]} />
        <meshStandardMaterial color={tableTop} roughness={0.55} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.38, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.1, 0.62, 12]} />
        <meshStandardMaterial color={table} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.44, 0.08, 20]} />
        <meshStandardMaterial color={table} roughness={0.8} metalness={0.15} />
      </mesh>
    </group>
  )
}
