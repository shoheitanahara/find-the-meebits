import { DoubleSide } from 'three'
import type { ParkBenchPropKind } from './parkSeason'

/**
 * ベンチ横オブジェ。
 * `parkSeason.ts` / ゾーン look の benchProp で差し替える。
 *
 * - flowers: 花壇プランター
 * - beachSet: パラソル＋ビーチボール
 * - surfboard: 立てかけサーフボード
 * - campRock: ボクセル岩＋苔（マウンテン地区）
 */
export type { ParkBenchPropKind }

export function ParkBenchProp({
  kind,
  position,
  index = 0,
}: {
  kind: ParkBenchPropKind
  position: [number, number, number]
  index?: number
}) {
  if (kind === 'beachSet') return <BeachSet position={position} variant={index} />
  if (kind === 'surfboard') return <SurfboardStand position={position} variant={index} />
  if (kind === 'campRock') return <CampRockPile position={position} variant={index} />
  return <FlowerPlanter position={position} />
}

function FlowerPlanter({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.7, 0.58, 0.7, 16]} />
        <meshStandardMaterial color="#a18b70" roughness={0.7} />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((petalIndex) => {
        const angle = (petalIndex / 6) * Math.PI * 2
        return (
          <mesh
            key={petalIndex}
            position={[Math.cos(angle) * 0.38, 0.85, Math.sin(angle) * 0.38]}
          >
            <sphereGeometry args={[0.22, 10, 8]} />
            <meshStandardMaterial
              color={petalIndex % 2 === 0 ? '#d47b9a' : '#e2b35f'}
              emissive={petalIndex % 2 === 0 ? '#8a3455' : '#9b6724'}
              emissiveIntensity={0.18}
              roughness={0.75}
            />
          </mesh>
        )
      })}
    </group>
  )
}

/** ビーチパラソル＋足元のビーチボール（ドーム天蓋・骨・重し台） */
function BeachSet({
  position,
  variant,
}: {
  position: [number, number, number]
  variant: number
}) {
  const palettes = [
    { a: '#e85d4c', b: '#f5f0e6' },
    { a: '#3aa0c9', b: '#f0c94d' },
    { a: '#f0c94d', b: '#2a6f8a' },
    { a: '#e8a0b8', b: '#f5f0e6' },
  ] as const
  const palette = palettes[variant % palettes.length]
  // ごく軽い傾きだけ（倒れかけに見えない範囲）
  const lean = variant % 2 === 0 ? 0.06 : -0.05
  const panelCount = 8

  return (
    <group position={position} rotation={[0, variant * 0.55, 0]}>
      {/* 重し台 */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.42, 0.48, 0.2, 20]} />
        <meshStandardMaterial color="#6a6e74" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.22, 0]} receiveShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.06, 16]} />
        <meshStandardMaterial color="#4a4e54" metalness={0.4} roughness={0.48} />
      </mesh>

      {/* ポール一式（わずかに傾ける） */}
      <group rotation={[0, 0, lean]}>
        <mesh position={[0, 1.35, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.045, 2.2, 10]} />
          <meshStandardMaterial color="#c8b89a" metalness={0.42} roughness={0.4} />
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
            emissiveIntensity={0.08}
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
                emissiveIntensity={0.06}
                roughness={0.8}
                side={DoubleSide}
              />
            </mesh>
          )
        })}

        {/* 裾の縁リング */}
        <mesh position={[0, 2.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.18, 0.028, 8, 32]} />
          <meshStandardMaterial color="#8a7a5e" metalness={0.35} roughness={0.5} />
        </mesh>

        {/* 先端のフィニアル */}
        <mesh position={[0, 2.72, 0]} castShadow>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshStandardMaterial color="#e8dcc0" metalness={0.55} roughness={0.35} />
        </mesh>
        <mesh position={[0, 2.82, 0]} castShadow>
          <coneGeometry args={[0.035, 0.12, 8]} />
          <meshStandardMaterial color="#d4c4a0" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>

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

/** マウンテン地区: ボクセル岩の小さな山（マインクラフト風） */
function CampRockPile({
  position,
  variant,
}: {
  position: [number, number, number]
  variant: number
}) {
  const stones = [
    { x: 0, y: 0.35, z: 0, s: [0.9, 0.7, 0.85] as const, c: '#6a6e68' },
    { x: 0.45, y: 0.28, z: 0.2, s: [0.55, 0.55, 0.5] as const, c: '#7a8078' },
    { x: -0.4, y: 0.25, z: -0.15, s: [0.5, 0.5, 0.55] as const, c: '#5a5e58' },
    { x: 0.1, y: 0.75, z: -0.05, s: [0.48, 0.45, 0.42] as const, c: '#8a9080' },
  ] as const
  const moss = variant % 2 === 0 ? '#4a7a48' : '#3d6a40'

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
        <meshStandardMaterial color={moss} roughness={0.92} />
      </mesh>
      <mesh position={[-0.15, 0.55, 0.25]} castShadow>
        <boxGeometry args={[0.22, 0.12, 0.22]} />
        <meshStandardMaterial color={moss} roughness={0.92} />
      </mesh>
    </group>
  )
}
