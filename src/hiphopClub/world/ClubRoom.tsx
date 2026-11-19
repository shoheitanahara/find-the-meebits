import { DoubleSide } from 'three'
import { CLUB } from '../config'
import { useClubStore } from '../store'
import { OCCLUDER_USER_DATA } from '../../world/CameraOcclusionFader'

/** クラブ空間: 正面スクリーン＋中央ダンスフロア（椅子なし） */
export function ClubRoom() {
  const playbackStarted = useClubStore((state) => state.playbackStarted)
  const {
    roomHalfX,
    roomMinZ,
    roomMaxZ,
    wallHeight,
    ceilingY,
    screen,
    colors,
    entranceHalf,
    backWallThickness,
    danceFloor,
  } = CLUB

  const roomDepth = roomMaxZ - roomMinZ
  const roomCenterZ = (roomMinZ + roomMaxZ) / 2
  const wallT = backWallThickness
  const wallZ = roomMinZ
  const openHalfW = screen.width / 2 + 0.04
  const openHalfH = screen.height / 2 + 0.04
  const bottomH = Math.max(0.08, screen.y - openHalfH)
  const topH = Math.max(0.08, wallHeight - (screen.y + openHalfH))
  const sideW = Math.max(0.08, roomHalfX - openHalfW)

  return (
    <group>
      <fog attach="fog" args={['#0c0610', 22, 50]} />

      <ambientLight intensity={0.28} color="#d0a0c8" />
      <hemisphereLight args={['#9060a0', '#180818', 0.42]} />
      <directionalLight position={[0, 8, 4]} intensity={0.2} color="#ffd0f0" />

      <spotLight
        position={[0, screen.y + 2.2, screen.z + 3.5]}
        angle={0.78}
        penumbra={0.55}
        intensity={46}
        distance={28}
        decay={1.5}
        color="#ffb0e8"
      >
        <object3D attach="target" position={[0, screen.y - 0.4, screen.z + 0.5]} />
      </spotLight>
      <pointLight position={[0, 3.4, danceFloor.z]} intensity={10} distance={16} decay={2} color="#e85cff" />
      <pointLight position={[-4.5, 2.8, danceFloor.z + 1]} intensity={5} distance={10} decay={2} color="#ffc46a" />
      <pointLight position={[4.5, 2.8, danceFloor.z + 1]} intensity={5} distance={10} decay={2} color="#ff7ad9" />

      <mesh position={[0, 0, roomCenterZ]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomHalfX * 2, roomDepth]} />
        <meshStandardMaterial color={colors.floor} roughness={0.96} />
      </mesh>

      {/* ダンスフロア本体 */}
      <mesh position={[0, 0.02, danceFloor.z]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[danceFloor.halfX * 2, danceFloor.halfZ * 2]} />
        <meshStandardMaterial color={colors.dance} roughness={0.55} metalness={0.25} />
      </mesh>
      {/* チェッカー風タイル */}
      {([-3, -1, 1, 3] as const).map((gx) =>
        ([-2, 0, 2] as const).map((gz) => (
          <mesh
            key={`tile-${gx}-${gz}`}
            position={[gx * 1.6, 0.03, danceFloor.z + gz * 1.6]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[1.45, 1.45]} />
            <meshStandardMaterial
              color={(gx + gz) % 4 === 0 ? colors.danceAlt : colors.dance}
              emissive={colors.danceEdge}
              emissiveIntensity={(gx + gz) % 4 === 0 ? 0.12 : 0.04}
              roughness={0.5}
              metalness={0.3}
            />
          </mesh>
        )),
      )}
      {/* フロア縁ネオン */}
      <mesh position={[0, 0.05, danceFloor.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[Math.min(danceFloor.halfX, danceFloor.halfZ) - 0.2, Math.min(danceFloor.halfX, danceFloor.halfZ), 48]} />
        <meshStandardMaterial
          color={colors.danceEdge}
          emissive={colors.danceEdge}
          emissiveIntensity={0.55}
          roughness={0.35}
          metalness={0.4}
          side={DoubleSide}
        />
      </mesh>

      {/* スピーカーシルエット */}
      {([-9.6, 9.6] as const).map((x) => (
        <group key={`spk-${x}`} position={[x, 0, -2.5]}>
          <mesh position={[0, 1.4, 0]} castShadow>
            <boxGeometry args={[1.1, 2.8, 0.9]} />
            <meshStandardMaterial color="#1a1018" roughness={0.85} />
          </mesh>
          <mesh position={[0, 1.9, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.1, 16]} />
            <meshStandardMaterial color="#2a1a28" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.9, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.1, 16]} />
            <meshStandardMaterial color="#2a1a28" roughness={0.7} />
          </mesh>
          <mesh position={[0, 2.95, 0]}>
            <boxGeometry args={[0.9, 0.12, 0.7]} />
            <meshStandardMaterial color={colors.accent} emissive={colors.accent} emissiveIntensity={0.5} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, ceilingY, roomCenterZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[roomHalfX * 2, roomDepth]} />
        <meshStandardMaterial color={colors.ceiling} roughness={1} />
      </mesh>

      <mesh userData={OCCLUDER_USER_DATA} position={[0, bottomH / 2, wallZ]}>
        <boxGeometry args={[roomHalfX * 2, bottomH, wallT]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh userData={OCCLUDER_USER_DATA} position={[0, screen.y + openHalfH + topH / 2, wallZ]}>
        <boxGeometry args={[roomHalfX * 2, topH, wallT]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh userData={OCCLUDER_USER_DATA} position={[-(openHalfW + sideW / 2), wallHeight / 2, wallZ]}>
        <boxGeometry args={[sideW, wallHeight, wallT]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh userData={OCCLUDER_USER_DATA} position={[openHalfW + sideW / 2, wallHeight / 2, wallZ]}>
        <boxGeometry args={[sideW, wallHeight, wallT]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      <mesh userData={OCCLUDER_USER_DATA} position={[-(roomHalfX + entranceHalf) / 2, wallHeight / 2, roomMaxZ]}>
        <boxGeometry args={[roomHalfX - entranceHalf, wallHeight, 0.4]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh userData={OCCLUDER_USER_DATA} position={[(roomHalfX + entranceHalf) / 2, wallHeight / 2, roomMaxZ]}>
        <boxGeometry args={[roomHalfX - entranceHalf, wallHeight, 0.4]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      <mesh userData={OCCLUDER_USER_DATA} position={[-roomHalfX, wallHeight / 2, roomCenterZ]}>
        <boxGeometry args={[0.4, wallHeight, roomDepth]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>
      <mesh userData={OCCLUDER_USER_DATA} position={[roomHalfX, wallHeight / 2, roomCenterZ]}>
        <boxGeometry args={[0.4, wallHeight, roomDepth]} />
        <meshStandardMaterial color={colors.wall} roughness={0.9} />
      </mesh>

      <ScreenFrame />

      {!playbackStarted ? (
        <mesh position={[screen.x, screen.y, screen.z]}>
          <planeGeometry args={[screen.width, screen.height]} />
          <meshStandardMaterial
            color={colors.screenBg}
            emissive="#301040"
            emissiveIntensity={0.4}
            roughness={0.5}
          />
        </mesh>
      ) : null}
    </group>
  )
}

function ScreenFrame() {
  const { screen, colors } = CLUB
  const frameT = 0.18
  const halfW = screen.width / 2
  const halfH = screen.height / 2
  return (
    <group position={[screen.x, screen.y, screen.z + 0.02]}>
      {[
        [0, halfH + frameT / 2, screen.width + frameT * 2, frameT],
        [0, -(halfH + frameT / 2), screen.width + frameT * 2, frameT],
        [-(halfW + frameT / 2), 0, frameT, screen.height],
        [halfW + frameT / 2, 0, frameT, screen.height],
      ].map(([x, y, w, h], i) => (
        <mesh key={i} position={[x as number, y as number, 0]}>
          <boxGeometry args={[w as number, h as number, 0.12]} />
          <meshStandardMaterial
            color={colors.screenFrame}
            emissive={colors.accent}
            emissiveIntensity={0.18}
            roughness={0.45}
            metalness={0.35}
          />
        </mesh>
      ))}
    </group>
  )
}
