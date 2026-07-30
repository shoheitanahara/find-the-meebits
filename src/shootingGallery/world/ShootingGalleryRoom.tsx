import { useEffect, useState } from 'react'
import { Text } from '@react-three/drei'
import { CanvasTexture, SRGBColorSpace, TextureLoader, Vector2, type Texture } from 'three'
import { SHOOTING_GALLERY } from '../config'
import {
  createSeededRng,
  getJstDateKey,
  hashStringToSeed,
  MEEBIT_ID_MAX,
} from '../../top/dailyFeatured'
import {
  DEFAULT_PREVIEW_PRIORITY,
  getTargetPreviewImage,
  requestTargetPreview,
  subscribeTargetPreview,
} from '../../ui/targetPreviewCache'

const FLOOR_PLANK_Z = [-7.8, -6.2, -4.6, -3, -1.4, 0.2, 1.8, 3.4, 5] as const
const BACK_WALL_PLANK_Y = [0.45, 1.15, 1.85, 2.55, 3.25, 3.95, 4.65] as const
const PRACTICAL_LIGHT_X = [-3.4, 0, 3.4] as const
const BOTTLE_PROFILE = [
  new Vector2(0, -0.29),
  new Vector2(0.12, -0.29),
  new Vector2(0.145, -0.25),
  new Vector2(0.15, -0.18),
  new Vector2(0.15, 0.12),
  new Vector2(0.14, 0.18),
  new Vector2(0.095, 0.25),
  new Vector2(0.06, 0.28),
  new Vector2(0.055, 0.43),
  new Vector2(0, 0.43),
]

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

      {/* 石積みと重い木梁で構成したマウンテンロッジのターゲット舞台。 */}
      <group position={[1, 0, roomMinZ + 0.14]}>
        <mesh position={[0, 2.15, 0]} receiveShadow>
          <boxGeometry args={[7.35, 4.15, 0.16]} />
          <meshStandardMaterial color="#18252a" roughness={0.72} />
        </mesh>
        <LodgeBackWall />
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

function LodgeBackWall() {
  const stoneBlockX = [-3.25, -2.45, -1.65, -0.82, 0, 0.82, 1.65, 2.45, 3.25] as const

  return (
    <group position={[0, 0, 0.11]}>
      {/* 深い色の横板。的の輪郭を保ちながらロッジの室内壁に見せる。 */}
      {[0.48, 1.04, 1.6, 2.16, 2.72, 3.28, 3.84].map((y, index) => (
        <mesh key={`lodge-plank-${y}`} position={[0, y, 0]}>
          <boxGeometry args={[7.15, 0.5, 0.08]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? '#273029' : '#31382f'}
            roughness={0.88}
          />
        </mesh>
      ))}

      {/* 不揃いな石積みの腰壁。 */}
      {[0.22, 0.7].map((y, row) =>
        stoneBlockX.map((x, index) => (
          <mesh
            key={`stone-${row}-${x}`}
            position={[x + (row === 0 ? 0 : 0.22), y, 0.11]}
            rotation={[0, 0, ((index + row) % 3 - 1) * 0.025]}
            castShadow
          >
            <boxGeometry args={[0.72 + ((index + row) % 2) * 0.08, 0.4, 0.16]} />
            <meshStandardMaterial
              color={(index + row) % 2 === 0 ? '#777267' : '#625f58'}
              roughness={0.96}
            />
          </mesh>
        )),
      )}

      {/* ロッジ建築らしい柱・梁・方杖。 */}
      {([-2.78, 2.78] as const).map((x) => (
        <mesh key={`lodge-post-${x}`} position={[x, 2.32, 0.16]} castShadow>
          <boxGeometry args={[0.24, 3.05, 0.2]} />
          <meshStandardMaterial color="#6f472b" roughness={0.72} />
        </mesh>
      ))}
      <mesh position={[0, 3.22, 0.16]} castShadow>
        <boxGeometry args={[6.05, 0.25, 0.2]} />
        <meshStandardMaterial color="#70472a" roughness={0.7} />
      </mesh>
      <mesh position={[-2.08, 2.68, 0.17]} rotation={[0, 0, -0.58]} castShadow>
        <boxGeometry args={[1.45, 0.16, 0.18]} />
        <meshStandardMaterial color="#795033" roughness={0.72} />
      </mesh>
      <mesh position={[2.08, 2.68, 0.17]} rotation={[0, 0, 0.58]} castShadow>
        <boxGeometry args={[1.45, 0.16, 0.18]} />
        <meshStandardMaterial color="#795033" roughness={0.72} />
      </mesh>

      <WeatheredMeebitPosters />
      <LodgeLantern position={[-3.3, 3.2, 0.28]} />
      <LodgeLantern position={[3.3, 3.2, 0.28]} />

      <mesh position={[0, 3.7, 0.22]} castShadow>
        <boxGeometry args={[2.9, 0.62, 0.16]} />
        <meshStandardMaterial color="#6b4328" roughness={0.68} />
      </mesh>
      <mesh position={[0, 3.7, 0.32]}>
        <boxGeometry args={[2.66, 0.42, 0.035]} />
        <meshStandardMaterial color="#2b2924" roughness={0.8} />
      </mesh>
      <Text
        position={[0, 3.7, 0.36]}
        fontSize={0.2}
        color="#f0d39a"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        HIGH PEAK LODGE
      </Text>
    </group>
  )
}

/**
 * ポスターの Meebit は日替わりの固定 2 体。
 * 訪問ごとの完全ランダムにすると毎回新規プレビュー生成が走るため、
 * 日付シードで全ユーザー共通にしてキャッシュを効かせる。
 */
function pickDailyPosterIds(): [number, number] {
  const rng = createSeededRng(hashStringToSeed(`shooting-gallery-poster:${getJstDateKey()}`))
  const first = Math.floor(rng() * MEEBIT_ID_MAX) + 1
  let second = Math.floor(rng() * MEEBIT_ID_MAX) + 1
  if (second === first) {
    second = (second % MEEBIT_ID_MAX) + 1
  }
  return [first, second]
}

const POSTER_MEEBIT_IDS = pickDailyPosterIds()

/** Preview画像だけにセピア・黄ばみ・周辺劣化を焼き込む。元キャッシュは変更しない。 */
function createWeatheredPosterTexture(source: Texture): Texture {
  const image = source.image as HTMLImageElement | undefined
  const width = image?.naturalWidth || image?.width || 0
  const height = image?.naturalHeight || image?.height || 0
  if (!image || width <= 0 || height <= 0) {
    source.colorSpace = SRGBColorSpace
    return source
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    source.colorSpace = SRGBColorSpace
    return source
  }

  try {
    context.filter = 'sepia(68%) saturate(58%) contrast(88%) brightness(92%)'
    context.drawImage(image, 0, 0, width, height)
    context.filter = 'none'

    context.globalCompositeOperation = 'multiply'
    context.fillStyle = 'rgba(185, 137, 63, 0.22)'
    context.fillRect(0, 0, width, height)

    const edgeStain = context.createRadialGradient(
      width * 0.5,
      height * 0.46,
      Math.min(width, height) * 0.2,
      width * 0.5,
      height * 0.46,
      Math.max(width, height) * 0.72,
    )
    edgeStain.addColorStop(0, 'rgba(255, 245, 205, 0)')
    edgeStain.addColorStop(0.72, 'rgba(122, 78, 28, 0.08)')
    edgeStain.addColorStop(1, 'rgba(77, 43, 17, 0.36)')
    context.fillStyle = edgeStain
    context.fillRect(0, 0, width, height)

    context.globalCompositeOperation = 'source-over'
    context.fillStyle = 'rgba(91, 55, 23, 0.09)'
    for (let index = 0; index < 12; index += 1) {
      const x = ((index * 83 + 37) % 101) / 101 * width
      const y = ((index * 47 + 19) % 97) / 97 * height
      const radius = Math.max(2, Math.min(width, height) * (0.008 + (index % 3) * 0.004))
      context.beginPath()
      context.arc(x, y, radius, 0, Math.PI * 2)
      context.fill()
    }

    // 汚染された canvas は WebGL 転送時に失敗するため、加工前の画像へ退避する。
    context.getImageData(0, 0, 1, 1)
  } catch {
    source.colorSpace = SRGBColorSpace
    return source
  }

  const weatheredTexture = new CanvasTexture(canvas)
  weatheredTexture.colorSpace = SRGBColorSpace
  source.dispose()
  return weatheredTexture
}

/** 既存プレビューキャッシュ（静止画 → VRM キャプチャ）経由でテクスチャを得る。 */
function useMeebitPosterTexture(meebitNumber: number) {
  const [imageSrc, setImageSrc] = useState(() => getTargetPreviewImage(meebitNumber))
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    requestTargetPreview(meebitNumber, DEFAULT_PREVIEW_PRIORITY)
    setImageSrc(getTargetPreviewImage(meebitNumber))
    return subscribeTargetPreview(meebitNumber, () => {
      setImageSrc(getTargetPreviewImage(meebitNumber))
    })
  }, [meebitNumber])

  useEffect(() => {
    if (!imageSrc) return

    let disposed = false
    let loaded: Texture | null = null

    new TextureLoader().load(imageSrc, (next) => {
      if (disposed) {
        next.dispose()
        return
      }
      loaded = createWeatheredPosterTexture(next)
      setTexture(loaded)
    })

    return () => {
      disposed = true
      loaded?.dispose()
    }
  }, [imageSrc])

  return texture
}

function WeatheredMeebitPosters() {
  const [leftMeebitId, rightMeebitId] = POSTER_MEEBIT_IDS
  const leftTexture = useMeebitPosterTexture(leftMeebitId)
  const rightTexture = useMeebitPosterTexture(rightMeebitId)

  return (
    <group>
      <WeatheredMeebitPoster
        position={[-1.9, 1.82, 0.24]}
        rotationZ={-0.045}
        meebitId={leftMeebitId}
        texture={leftTexture}
      />
      <WeatheredMeebitPoster
        position={[1.9, 1.82, 0.24]}
        rotationZ={0.035}
        meebitId={rightMeebitId}
        texture={rightTexture}
      />
    </group>
  )
}

function WeatheredMeebitPoster({
  position,
  rotationZ,
  meebitId,
  texture,
}: {
  position: [number, number, number]
  rotationZ: number
  meebitId: number
  texture: Texture | null
}) {
  return (
    <group position={position} rotation={[0, 0, rotationZ]}>
      <mesh castShadow>
        <boxGeometry args={[1.12, 1.48, 0.055]} />
        <meshStandardMaterial color="#b69a69" roughness={0.96} />
      </mesh>
      <mesh position={[0, 0.05, 0.034]}>
        <planeGeometry args={[0.84, 0.9]} />
        <meshBasicMaterial
          map={texture ?? undefined}
          color={texture ? '#d8c18e' : '#665944'}
          toneMapped={false}
        />
      </mesh>
      <Text
        position={[0, 0.62, 0.04]}
        fontSize={0.105}
        color="#4e3322"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        MOUNTAIN CLUB
      </Text>
      <Text
        position={[0, -0.59, 0.04]}
        fontSize={0.095}
        color="#513522"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        {`MEEBIT #${meebitId}`}
      </Text>
      {([
        [-0.49, -0.66],
        [0.49, -0.66],
        [-0.49, 0.66],
        [0.49, 0.66],
      ] as const).map(([x, y]) => (
        <mesh key={`${x}-${y}`} position={[x, y, 0.055]}>
          <sphereGeometry args={[0.025, 10, 8]} />
          <meshStandardMaterial color="#553b28" metalness={0.42} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-0.41, 0.52, 0.05]} rotation={[0, 0, -0.35]}>
        <circleGeometry args={[0.13, 18]} />
        <meshBasicMaterial color="#68472d" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh position={[0.43, -0.48, 0.05]} rotation={[0, 0, 0.25]}>
        <circleGeometry args={[0.1, 18]} />
        <meshBasicMaterial color="#68472d" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    </group>
  )
}

function LodgeLantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.34, 0.5, 0.12]} />
        <meshStandardMaterial color="#272524" metalness={0.62} roughness={0.36} />
      </mesh>
      <mesh position={[0, 0.1, 0.075]}>
        <boxGeometry args={[0.2, 0.34, 0.04]} />
        <meshStandardMaterial
          color="#ffe1a0"
          emissive="#ff9d32"
          emissiveIntensity={2.1}
          roughness={0.28}
        />
      </mesh>
      {([-0.13, 0.13] as const).map((x) => (
        <mesh key={x} position={[x, 0.1, 0.14]}>
          <boxGeometry args={[0.025, 0.48, 0.025]} />
          <meshStandardMaterial color="#191817" metalness={0.7} roughness={0.32} />
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
      <mesh castShadow receiveShadow>
        <latheGeometry args={[BOTTLE_PROFILE, 28]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.18}
          metalness={0.02}
          transmission={0.08}
          thickness={0.18}
          transparent
          opacity={0.92}
        />
      </mesh>
      {/* 胴を一周する紙ラベル。平面よりボトルの丸みに馴染ませる。 */}
      <mesh position={[0, -0.04, 0]} castShadow>
        <cylinderGeometry args={[0.152, 0.152, 0.16, 28]} />
        <meshStandardMaterial color="#dfcfa8" roughness={0.76} />
      </mesh>
      <mesh position={[0, -0.035, 0.154]}>
        <planeGeometry args={[0.105, 0.075]} />
        <meshStandardMaterial color="#68452d" roughness={0.68} />
      </mesh>
      <mesh position={[0, 0.43, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.056, 0.012, 8, 20]} />
        <meshStandardMaterial color="#bd9255" metalness={0.42} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.47, 0]} castShadow>
        <cylinderGeometry args={[0.048, 0.048, 0.075, 18]} />
        <meshStandardMaterial color="#8d6845" roughness={0.88} />
      </mesh>
      <mesh position={[-0.1, 0.08, 0.12]} rotation={[0, 0.25, 0]}>
        <planeGeometry args={[0.025, 0.24]} />
        <meshBasicMaterial color="#d9f4de" transparent opacity={0.36} />
      </mesh>
    </group>
  )
}
