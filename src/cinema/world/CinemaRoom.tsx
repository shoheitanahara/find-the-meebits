import { CINEMA } from '../config'
import { useCinemaStore } from '../store'

/** 暗い上映室＋スクリーン開口付き奥壁＋スクリーン向きベンチ */
export function CinemaRoom() {
  const playbackStarted = useCinemaStore((state) => state.playbackStarted)
  const {
    roomHalfX,
    roomMinZ,
    roomMaxZ,
    wallHeight,
    ceilingY,
    screen,
    benches,
    colors,
    entranceHalf,
    backWallThickness,
  } = CINEMA

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
      <fog attach="fog" args={['#07090f', 24, 52]} />

      <ambientLight intensity={0.28} color="#a8b4c8" />
      <hemisphereLight args={['#4a6080', '#1a1018', 0.35]} />
      <directionalLight position={[0, 8, 4]} intensity={0.22} color="#c8d8ff" />

      <spotLight
        position={[0, screen.y + 2.2, screen.z + 3.5]}
        angle={0.78}
        penumbra={0.55}
        intensity={42}
        distance={28}
        decay={1.5}
        color="#dff4ff"
      >
        <object3D attach="target" position={[0, screen.y - 0.4, screen.z + 0.5]} />
      </spotLight>
      <pointLight position={[0, 3.2, 6]} intensity={4.5} distance={14} decay={2} color="#ffc89a" />

      <mesh position={[0, 0, roomCenterZ]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomHalfX * 2, roomDepth]} />
        <meshStandardMaterial color={colors.floor} roughness={0.96} />
      </mesh>

      {/* 1-2-1 配置の左右すき間を通路カーペットに */}
      {CINEMA.aisleXs.map((x) => (
        <mesh key={`aisle-${x}`} position={[x, 0.01, 3.2]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[CINEMA.aisleCarpetWidth, 18]} />
          <meshStandardMaterial color={colors.carpet} roughness={0.98} />
        </mesh>
      ))}

      {/* 通路フロアライト（足元が分かる程度の弱い光） */}
      {CINEMA.aisleXs.map((x) =>
        CINEMA.aisleLightZs.map((z) => (
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

      {benches.map((bench, index) => (
        <CinemaBench key={`bench-${index}`} x={bench.x} z={bench.z} rotationY={bench.rotationY} />
      ))}
    </group>
  )
}

/** 通路の足元灯：薄い発光プレート + 短い pointLight */
function AisleFloorLight({ x, z }: { x: number; z: number }) {
  const glow = CINEMA.colors.accent
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
        intensity={2.8}
        distance={3.4}
        decay={2}
        color={glow}
      />
    </group>
  )
}

function ScreenFrame() {
  const { screen, colors } = CINEMA
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

function CinemaBench({ x, z, rotationY }: { x: number; z: number; rotationY: number }) {
  const seat = CINEMA.colors.seat
  const accent = CINEMA.colors.seatAccent
  const legs: Array<[number, number]> = [
    [-1.0, 0.2],
    [1.0, 0.2],
    [-1.0, -0.25],
    [1.0, -0.25],
  ]
  return (
    <group position={[x, CINEMA.benchGroundY, z]} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.12, 0.7]} />
        <meshStandardMaterial color={seat} roughness={0.78} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.78, -0.28]} castShadow>
        <boxGeometry args={[2.4, 0.55, 0.12]} />
        <meshStandardMaterial color={accent} roughness={0.8} metalness={0.08} />
      </mesh>
      {legs.map(([lx, lz]) => (
        <mesh key={`${lx}-${lz}`} position={[lx, 0.2 - CINEMA.benchLegEmbed / 2, lz]} castShadow>
          <boxGeometry args={[0.12, 0.4 + CINEMA.benchLegEmbed, 0.12]} />
          <meshStandardMaterial color={seat} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}
