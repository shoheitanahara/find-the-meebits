import { DoubleSide } from 'three'
import type { ParkBenchPropKind } from './parkLook'

/**
 * ベンチ横オブジェ。
 * `parkLook.ts` / ゾーン look の benchProp で差し替える。
 *
 * - flowers: 花壇プランター
 * - beachSet: パラソル＋ビーチボール（Plaza / Culture / Sea のデフォルト）
 *   ※ christmas 時は赤緑金パラソル＋プレゼント箱（Sea は christmas=false）
 * - surfboard: 立てかけサーフボード
 * - campRock: ボクセル岩＋苔（マウンテンエリア）
 */
export type { ParkBenchPropKind }

export function ParkBenchProp({
  kind,
  position,
  index = 0,
  christmas = false,
}: {
  kind: ParkBenchPropKind
  position: [number, number, number]
  index?: number
  christmas?: boolean
}) {
  if (kind === 'beachSet') {
    return <BeachSet position={position} variant={index} christmas={christmas} />
  }
  if (kind === 'surfboard') return <SurfboardStand position={position} variant={index} />
  if (kind === 'campRock') {
    return <CampRockPile position={position} variant={index} christmas={christmas} />
  }
  return <FlowerPlanter position={position} christmas={christmas} />
}

function FlowerPlanter({
  position,
  christmas = false,
}: {
  position: [number, number, number]
  christmas?: boolean
}) {
  const petalColors = christmas
    ? (['#e04040', '#f0d040'] as const)
    : (['#d47b9a', '#e2b35f'] as const)
  const petalEmissive = christmas
    ? (['#8a2020', '#9b7820'] as const)
    : (['#8a3455', '#9b6724'] as const)

  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.7, 0.58, 0.7, 16]} />
        <meshStandardMaterial color={christmas ? '#5a4030' : '#a18b70'} roughness={0.7} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((petalIndex) => {
        const angle = (petalIndex / 6) * Math.PI * 2
        const color = petalColors[petalIndex % 2]
        return (
          <mesh
            key={petalIndex}
            position={[Math.cos(angle) * 0.38, 0.85, Math.sin(angle) * 0.38]}
          >
            <sphereGeometry args={[0.22, 10, 8]} />
            <meshStandardMaterial
              color={color}
              emissive={petalEmissive[petalIndex % 2]}
              emissiveIntensity={christmas ? 0.35 : 0.18}
              roughness={0.75}
            />
          </mesh>
        )
      })}
      {christmas ? (
        <mesh position={[0, 1.05, 0]} castShadow>
          <octahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial
            color="#ffe090"
            emissive="#ffd060"
            emissiveIntensity={0.7}
            metalness={0.4}
            roughness={0.3}
          />
        </mesh>
      ) : null}
    </group>
  )
}

/** ビーチパラソル＋足元のビーチボール（ドーム天蓋・骨・重し台） */
function BeachSet({
  position,
  variant,
  christmas = false,
}: {
  position: [number, number, number]
  variant: number
  christmas?: boolean
}) {
  const palettes = christmas
    ? [
        { a: '#c42828', b: '#f5f0e6' },
        { a: '#1e7a3a', b: '#f0d050' },
        { a: '#c42828', b: '#1e7a3a' },
        { a: '#f0d050', b: '#c42828' },
      ]
    : [
        { a: '#e85d4c', b: '#f5f0e6' },
        { a: '#3aa0c9', b: '#f0c94d' },
        { a: '#f0c94d', b: '#2a6f8a' },
        { a: '#e8a0b8', b: '#f5f0e6' },
      ]
  const palette = palettes[variant % palettes.length]
  // ごく軽い傾きだけ（倒れかけに見えない範囲）
  const lean = variant % 2 === 0 ? 0.06 : -0.05
  const panelCount = 8
  const giftA = variant % 2 === 0
    ? { box: '#c42828', ribbon: '#f0d050', lid: '#1e6a38' }
    : { box: '#1e6a38', ribbon: '#f0d050', lid: '#c42828' }
  const giftB = variant % 2 === 0
    ? { box: '#1e6a38', ribbon: '#e8e8e8', lid: '#c42828' }
    : { box: '#c42828', ribbon: '#e8e8e8', lid: '#1e6a38' }

  return (
    <group position={position} rotation={[0, variant * 0.55, 0]}>
      {/* 重し台 */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.42, 0.48, 0.2, 20]} />
        <meshStandardMaterial
          color={christmas ? '#4a3a30' : '#6a6e74'}
          metalness={christmas ? 0.2 : 0.35}
          roughness={0.55}
        />
      </mesh>
      <mesh position={[0, 0.22, 0]} receiveShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.06, 16]} />
        <meshStandardMaterial
          color={christmas ? '#3a2a20' : '#4a4e54'}
          metalness={0.4}
          roughness={0.48}
        />
      </mesh>

      {/* ポール一式（わずかに傾ける） */}
      <group rotation={[0, 0, lean]}>
        <mesh position={[0, 1.35, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.045, 2.2, 10]} />
          <meshStandardMaterial
            color={christmas ? '#d4b878' : '#c8b89a'}
            metalness={0.42}
            roughness={0.4}
          />
        </mesh>

        {/* 天蓋ハブ */}
        <mesh position={[0, 2.42, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.1, 12]} />
          <meshStandardMaterial color="#b8a888" metalness={0.45} roughness={0.4} />
        </mesh>

        {/* ドーム天蓋（浅い半球） */}
        <mesh
          position={[0, 2.38, 0]}
          scale={[1.28, 0.52, 1.28]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[0.95, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <meshStandardMaterial
            color={palette.a}
            emissive={palette.a}
            emissiveIntensity={christmas ? 0.16 : 0.08}
            roughness={0.82}
            side={DoubleSide}
          />
        </mesh>

        {/* 交互ストライプのパネル（楔） */}
        {Array.from({ length: panelCount }, (_, index) => {
          if (index % 2 === 0) return null
          const angle = (index / panelCount) * Math.PI * 2
          return (
            <mesh
              key={`panel-${index}`}
              position={[0, 2.385, 0]}
              rotation={[0, angle, 0]}
              scale={[1.285, 0.525, 1.285]}
              castShadow
            >
              <sphereGeometry
                args={[0.952, 8, 10, 0, (Math.PI * 2) / panelCount, 0, Math.PI * 0.52]}
              />
              <meshStandardMaterial
                color={palette.b}
                emissive={palette.b}
                emissiveIntensity={christmas ? 0.12 : 0.06}
                roughness={0.8}
                side={DoubleSide}
              />
            </mesh>
          )
        })}

        {/* 裾の縁リング */}
        <mesh position={[0, 2.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.18, 0.028, 8, 32]} />
          <meshStandardMaterial
            color={christmas ? '#c4a050' : '#8a7a5e'}
            metalness={0.45}
            roughness={0.45}
          />
        </mesh>

        {/* 先端：通常はフィニアル、クリスマスは星 */}
        {christmas ? (
          <mesh position={[0, 2.78, 0]} castShadow>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color="#ffe090"
              emissive="#ffd060"
              emissiveIntensity={0.85}
              metalness={0.5}
              roughness={0.28}
            />
          </mesh>
        ) : (
          <>
            <mesh position={[0, 2.72, 0]} castShadow>
              <sphereGeometry args={[0.055, 10, 8]} />
              <meshStandardMaterial color="#e8dcc0" metalness={0.55} roughness={0.35} />
            </mesh>
            <mesh position={[0, 2.82, 0]} castShadow>
              <coneGeometry args={[0.035, 0.12, 8]} />
              <meshStandardMaterial color="#d4c4a0" metalness={0.5} roughness={0.4} />
            </mesh>
          </>
        )}
      </group>

      {christmas ? (
        <>
          {/* プレゼント箱（大） */}
          <GiftBox position={[0.52, 0, 0.3]} size={[0.42, 0.36, 0.42]} colors={giftA} />
          {/* プレゼント箱（小・横） */}
          <GiftBox
            position={[-0.42, 0, 0.38]}
            size={[0.3, 0.26, 0.3]}
            colors={giftB}
            yaw={0.35}
          />
        </>
      ) : (
        <>
          {/* ビーチボール（台の横） */}
          <mesh position={[0.55, 0.3, 0.28]} castShadow>
            <sphereGeometry args={[0.3, 16, 14]} />
            <meshStandardMaterial
              color="#f4f2ee"
              emissive="#666"
              emissiveIntensity={0.12}
              roughness={0.42}
            />
          </mesh>
          {[0, 1, 2].map((band) => (
            <mesh
              key={band}
              position={[0.55, 0.3, 0.28]}
              rotation={[band * 1.1, band * 0.8, band * 0.4]}
            >
              <torusGeometry args={[0.24, 0.04, 8, 24]} />
              <meshStandardMaterial
                color={band === 1 ? palette.a : '#3aa0c9'}
                roughness={0.5}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

function GiftBox({
  position,
  size,
  colors,
  yaw = 0,
}: {
  position: [number, number, number]
  size: [number, number, number]
  colors: { box: string; ribbon: string; lid: string }
  yaw?: number
}) {
  const [w, h, d] = size
  const ribbon = Math.min(w, d) * 0.18
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, h * 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={colors.box} roughness={0.75} />
      </mesh>
      <mesh position={[0, h + 0.03, 0]} castShadow>
        <boxGeometry args={[w * 1.04, 0.06, d * 1.04]} />
        <meshStandardMaterial color={colors.lid} roughness={0.65} />
      </mesh>
      <mesh position={[0, h * 0.5, 0]} castShadow>
        <boxGeometry args={[ribbon, h + 0.04, d * 1.02]} />
        <meshStandardMaterial color={colors.ribbon} roughness={0.5} />
      </mesh>
      <mesh position={[0, h * 0.5, 0]} castShadow>
        <boxGeometry args={[w * 1.02, h + 0.04, ribbon]} />
        <meshStandardMaterial color={colors.ribbon} roughness={0.5} />
      </mesh>
      <mesh position={[0, h + 0.1, 0]} castShadow>
        <sphereGeometry args={[ribbon * 0.7, 8, 6]} />
        <meshStandardMaterial
          color={colors.ribbon}
          emissive={colors.ribbon}
          emissiveIntensity={0.2}
          roughness={0.45}
        />
      </mesh>
    </group>
  )
}

/** 立てかけサーフボード（2枚） */
function SurfboardStand({
  position,
  variant,
}: {
  position: [number, number, number]
  variant: number
}) {
  const colors = [
    ['#3aa0c9', '#f0c94d'],
    ['#e85d4c', '#f2f2f0'],
    ['#2f8f6a', '#e8a0b8'],
    ['#f0c94d', '#3aa0c9'],
  ] as const
  const pair = colors[variant % colors.length]

  return (
    <group position={position} rotation={[0, variant * 0.55, 0]}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[0.7, 0.14, 0.45]} />
        <meshStandardMaterial color="#5c4030" roughness={0.85} />
      </mesh>
      {pair.map((color, boardIndex) => {
        const lean = boardIndex === 0 ? -0.35 : 0.28
        const x = boardIndex === 0 ? -0.12 : 0.14
        return (
          <mesh
            key={boardIndex}
            position={[x, 0.95, 0.02]}
            rotation={[0, 0.15, lean]}
            castShadow
          >
            <capsuleGeometry args={[0.14, 1.55, 6, 10]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.1}
              roughness={0.55}
              metalness={0.08}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/** マウンテンエリア: ボクセル岩の小さな山（マインクラフト風） */
function CampRockPile({
  position,
  variant,
  christmas = false,
}: {
  position: [number, number, number]
  variant: number
  christmas?: boolean
}) {
  const stones = [
    { x: 0, y: 0.35, z: 0, s: [0.9, 0.7, 0.85] as const, c: '#6a6e68' },
    { x: 0.45, y: 0.28, z: 0.2, s: [0.55, 0.55, 0.5] as const, c: '#7a8078' },
    { x: -0.4, y: 0.25, z: -0.15, s: [0.5, 0.5, 0.55] as const, c: '#5a5e58' },
    { x: 0.1, y: 0.75, z: -0.05, s: [0.48, 0.45, 0.42] as const, c: '#8a9080' },
  ] as const
  const moss = variant % 2 === 0 ? '#4a7a48' : '#3d6a40'
  const snow = '#e8eef4'

  return (
    <group position={position} rotation={[0, variant * 0.7, 0]}>
      {stones.map((stone, index) => (
        <mesh
          key={index}
          position={[stone.x, stone.y, stone.z]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[...stone.s]} />
          <meshStandardMaterial color={stone.c} roughness={0.95} />
        </mesh>
      ))}
      <mesh position={[0.05, 0.95, 0.08]} castShadow>
        <boxGeometry args={[0.35, 0.18, 0.35]} />
        <meshStandardMaterial color={christmas ? snow : moss} roughness={0.92} />
      </mesh>
      <mesh position={[-0.15, 0.55, 0.25]} castShadow>
        <boxGeometry args={[0.22, 0.12, 0.22]} />
        <meshStandardMaterial color={christmas ? snow : moss} roughness={0.92} />
      </mesh>
      {christmas ? (
        <mesh position={[0.12, 1.18, -0.02]} castShadow>
          <boxGeometry args={[0.22, 0.12, 0.2]} />
          <meshStandardMaterial color={snow} roughness={0.9} />
        </mesh>
      ) : null}
    </group>
  )
}
