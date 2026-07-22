import { Text } from '@react-three/drei'
import type { Attraction } from './topConfig'
import type { AttractionId } from './topStore'

/**
 * Park アトラクションのランドマーク入口。
 * シルエットを大きく変え、入口ドアさえあれば遷移は維持される。
 * - find: ドーム付き美術館
 * - traits: ネオン円筒タワー
 * - street: L字レンガ町屋＋アーチ
 */
export function AttractionBuilding({
  attraction,
  locale,
  onEnter,
}: {
  attraction: Attraction
  locale: 'en' | 'ja'
  onEnter: (id: AttractionId) => void
}) {
  const accent =
    attraction.id === 'find' ? '#d4b46a' : attraction.id === 'traits' ? '#5ee0ff' : '#e8a0ff'
  const frontZ = attraction.footprint.halfDepth

  return (
    <group
      position={[attraction.x, 0, attraction.z]}
      onClick={(event) => {
        event.stopPropagation()
        onEnter(attraction.id)
      }}
    >
      {attraction.id === 'find' ? (
        <MuseumLandmark color={attraction.color} roofColor={attraction.roofColor} accent={accent} />
      ) : attraction.id === 'traits' ? (
        <TraitTowerLandmark
          color={attraction.color}
          roofColor={attraction.roofColor}
          accent={accent}
        />
      ) : (
        <AlleyLandmark color={attraction.color} roofColor={attraction.roofColor} accent={accent} />
      )}

      <EntrancePortal
        accent={accent}
        frontZ={frontZ}
        doorHalfWidth={attraction.footprint.doorHalfWidth}
      />
      {/* 入口ドア直上（目線で読める高さ） */}
      <TitleBanner
        attraction={attraction}
        accent={accent}
        y={3.95}
        z={frontZ + 0.28}
      />
      <pointLight position={[0, 2.4, frontZ + 1.4]} intensity={12} distance={12} color={accent} />
      <AttractionInfoBoard
        position={[attraction.infoBoardLocal[0], 0, attraction.infoBoardLocal[1]]}
        accentColor={accent}
        description={attraction.description[locale]}
        heading={attraction.storyTitle[locale]}
      />
    </group>
  )
}

/** 美術館: 広い基壇・両翼・中央ドーム */
function MuseumLandmark({
  color,
  roofColor,
  accent,
}: {
  color: string
  roofColor: string
  accent: string
}) {
  return (
    <group>
      {/* 階段 */}
      {[0, 1, 2].map((step) => (
        <mesh
          key={step}
          position={[0, 0.1 + step * 0.14, 3.55 - step * 0.35]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[6.2 - step * 0.4, 0.16, 0.7]} />
          <meshStandardMaterial color="#9a9288" roughness={0.9} />
        </mesh>
      ))}

      {/* 中央本館 */}
      <mesh position={[0, 2.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[6.4, 5.2, 6.2]} />
        <meshStandardMaterial color={color} roughness={0.86} />
      </mesh>

      {/* 両翼 */}
      {[-4.8, 4.8].map((x) => (
        <mesh key={`wing-${x}`} position={[x, 1.7, 0.3]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 3.4, 4.2]} />
          <meshStandardMaterial color="#c4bdb2" roughness={0.88} />
        </mesh>
      ))}

      {/* コーニス */}
      <mesh position={[0, 5.3, 0]} castShadow>
        <boxGeometry args={[6.8, 0.28, 6.5]} />
        <meshStandardMaterial color="#e4ddd2" roughness={0.78} />
      </mesh>

      {/* ドーム */}
      <mesh position={[0, 6.55, -0.2]} castShadow>
        <sphereGeometry args={[2.15, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={roofColor} metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 7.85, -0.2]} castShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.7, 12]} />
        <meshStandardMaterial color={accent} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 8.35, -0.2]} castShadow>
        <sphereGeometry args={[0.28, 12, 10]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.55}
          metalness={0.6}
          roughness={0.3}
        />
      </mesh>

      {/* 列柱 */}
      {[-2.4, -0.8, 0.8, 2.4].map((x) => (
        <group key={`col-${x}`} position={[x, 0, 3.15]}>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.48, 0.25, 0.48]} />
            <meshStandardMaterial color="#cfc6b8" roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.5, 0]} castShadow>
            <cylinderGeometry args={[0.18, 0.22, 4.0, 14]} />
            <meshStandardMaterial color="#ebe4d8" roughness={0.75} />
          </mesh>
          <mesh position={[0, 4.6, 0]} castShadow>
            <boxGeometry args={[0.46, 0.22, 0.46]} />
            <meshStandardMaterial color="#cfc6b8" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* ペディメント帯 */}
      <mesh position={[0, 5.55, 3.15]} castShadow>
        <boxGeometry args={[5.8, 0.55, 0.35]} />
        <meshStandardMaterial color="#d8d0c4" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.55, 3.35]}>
        <boxGeometry args={[5.2, 0.08, 0.06]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

/** Trait Hunt: 背の高いネオン円筒タワー */
function TraitTowerLandmark({
  color,
  roofColor,
  accent,
}: {
  color: string
  roofColor: string
  accent: string
}) {
  const neon = ['#ff6b9d', '#5ee0ff', '#ffe066', '#a78bfa'] as const

  return (
    <group>
      {/* 基壇ディスク */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3.6, 3.8, 0.4, 24]} />
        <meshStandardMaterial color="#0d1822" metalness={0.35} roughness={0.5} />
      </mesh>

      {/* 本体タワー */}
      <mesh position={[0, 4.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.55, 2.85, 8.0, 24]} />
        <meshStandardMaterial color={color} metalness={0.22} roughness={0.48} />
      </mesh>

      {/* ネオンリング */}
      {[2.2, 4.4, 6.6].map((y, index) => (
        <mesh key={`ring-${y}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.7 + index * 0.05, 0.08, 8, 40]} />
          <meshStandardMaterial
            color={neon[index % neon.length]}
            emissive={neon[index % neon.length]}
            emissiveIntensity={1.15}
          />
        </mesh>
      ))}

      {/* 縦ネオン */}
      {Array.from({ length: 8 }, (_, index) => {
        const a = (index / 8) * Math.PI * 2
        return (
          <mesh
            key={`vneon-${index}`}
            position={[Math.cos(a) * 2.7, 4.2, Math.sin(a) * 2.7]}
            castShadow
          >
            <boxGeometry args={[0.1, 7.6, 0.1]} />
            <meshStandardMaterial
              color={neon[index % neon.length]}
              emissive={neon[index % neon.length]}
              emissiveIntensity={0.9}
            />
          </mesh>
        )
      })}

      {/* トレイト見本オーブ */}
      {[-1, 1].map((side) =>
        [0, 1, 2].map((row) => (
          <mesh
            key={`orb-${side}-${row}`}
            position={[side * 3.15, 2.4 + row * 1.35, 1.1]}
            castShadow
          >
            <sphereGeometry args={[0.32, 14, 12]} />
            <meshStandardMaterial
              color={neon[(row + (side > 0 ? 1 : 0)) % neon.length]}
              emissive={neon[(row + (side > 0 ? 1 : 0)) % neon.length]}
              emissiveIntensity={0.85}
              roughness={0.35}
            />
          </mesh>
        )),
      )}

      {/* 上空ディスク屋根 */}
      <mesh position={[0, 8.5, 0]} castShadow>
        <cylinderGeometry args={[3.4, 2.4, 0.55, 24]} />
        <meshStandardMaterial color={roofColor} metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0, 8.85, 0]}>
        <torusGeometry args={[2.6, 0.1, 8, 40]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.3} />
      </mesh>
      <mesh position={[0, 9.35, 0]} castShadow>
        <sphereGeometry args={[0.55, 16, 12]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.0} />
      </mesh>
    </group>
  )
}

/** 8th Street: 高い町屋 + L字横棟 + アーチ */
function AlleyLandmark({
  color,
  roofColor,
  accent,
}: {
  color: string
  roofColor: string
  accent: string
}) {
  return (
    <group>
      {/* 主棟（高い） */}
      <mesh position={[0.6, 4.0, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 8.0, 6.6]} />
        <meshStandardMaterial color={color} roughness={0.92} />
      </mesh>

      {/* L字横棟 */}
      <mesh position={[-3.6, 2.3, -0.8]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 4.6, 4.6]} />
        <meshStandardMaterial color="#6a3c32" roughness={0.93} />
      </mesh>

      {/* レンガ目地（正面） */}
      {Array.from({ length: 14 }, (_, row) => (
        <mesh key={`mortar-${row}`} position={[0.6, 0.55 + row * 0.52, 3.32]}>
          <boxGeometry args={[4.5, 0.035, 0.04]} />
          <meshStandardMaterial color="#3a2a28" roughness={0.95} />
        </mesh>
      ))}

      {/* 屋根 */}
      <mesh position={[0.6, 8.15, 0]} castShadow>
        <boxGeometry args={[5.1, 0.35, 6.9]} />
        <meshStandardMaterial color={roofColor} roughness={0.75} />
      </mesh>
      <mesh position={[-3.6, 4.7, -0.8]} castShadow>
        <boxGeometry args={[4.0, 0.28, 4.8]} />
        <meshStandardMaterial color={roofColor} roughness={0.75} />
      </mesh>

      {/* 屋上ウォータータワー（シルエット用） */}
      <group position={[1.2, 8.5, -1.2]}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.4, 6]} />
          <meshStandardMaterial color="#3a3238" metalness={0.55} roughness={0.4} />
        </mesh>
        <mesh position={[0.55, 0.7, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 1.4, 6]} />
          <meshStandardMaterial color="#3a3238" metalness={0.55} roughness={0.4} />
        </mesh>
        <mesh position={[0.28, 1.55, 0]} castShadow>
          <cylinderGeometry args={[0.75, 0.7, 1.1, 12]} />
          <meshStandardMaterial color="#4a4248" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0.28, 2.2, 0]} castShadow>
          <coneGeometry args={[0.82, 0.55, 8]} />
          <meshStandardMaterial color="#2a2228" roughness={0.65} />
        </mesh>
      </group>

      {/* 火事避難階段 */}
      {[0, 1, 2, 3].map((level) => (
        <group key={`fire-${level}`} position={[3.15, 1.4 + level * 1.55, 1.5]}>
          <mesh castShadow>
            <boxGeometry args={[0.12, 0.08, 1.8]} />
            <meshStandardMaterial color="#2a2228" metalness={0.5} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.55, 0.7]} castShadow>
            <boxGeometry args={[0.08, 1.1, 0.08]} />
            <meshStandardMaterial color="#2a2228" metalness={0.5} roughness={0.45} />
          </mesh>
        </group>
      ))}

      {/* アーチ入口枠（EntrancePortal と同じ x=0 に合わせる） */}
      <mesh position={[0, 3.2, 3.45]} castShadow>
        <boxGeometry args={[2.7, 0.32, 0.4]} />
        <meshStandardMaterial color="#1a1216" roughness={0.7} />
      </mesh>
      {[-1.25, 1.25].map((x) => (
        <mesh key={`arch-post-${x}`} position={[x, 1.55, 3.45]} castShadow>
          <boxGeometry args={[0.32, 3.1, 0.4]} />
          <meshStandardMaterial color="#1a1216" roughness={0.7} />
        </mesh>
      ))}

      {/* 縦ネオン */}
      <group position={[3.2, 4.2, 0.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.28, 4.2, 0.7]} />
          <meshStandardMaterial color="#120c14" roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0.16, 0, 0]}>
          <boxGeometry args={[0.08, 3.8, 0.55]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.15} />
        </mesh>
        <Text
          position={[0.22, 0.2, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.32}
          color="#1a0a20"
          anchorX="center"
          anchorY="middle"
        >
          8TH
        </Text>
      </group>

      {/* 夜窓 */}
      {[1.8, 3.6, 5.4].map((y) =>
        [-0.7, 1.9].map((x) => (
          <mesh key={`win-${x}-${y}`} position={[x, y, 3.32]} castShadow>
            <boxGeometry args={[0.85, 1.05, 0.1]} />
            <meshStandardMaterial
              color="#ffb070"
              emissive="#ff8a40"
              emissiveIntensity={0.7}
              roughness={0.45}
            />
          </mesh>
        )),
      )}
    </group>
  )
}

function EntrancePortal({
  accent,
  frontZ,
  doorHalfWidth,
}: {
  accent: string
  frontZ: number
  doorHalfWidth: number
}) {
  const doorW = doorHalfWidth * 2
  return (
    <group position={[0, 0, frontZ]}>
      <mesh position={[0, 0.12, 0.35]} receiveShadow>
        <boxGeometry args={[doorW + 0.6, 0.24, 1.1]} />
        <meshStandardMaterial color="#101014" roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.55, 0.02]} castShadow>
        <boxGeometry args={[doorW, 3.1, 0.18]} />
        <meshStandardMaterial color="#050608" roughness={0.7} />
      </mesh>
      <mesh position={[0, 3.2, 0.12]}>
        <boxGeometry args={[doorW + 0.25, 0.12, 0.14]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.55}
          metalness={0.4}
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}

function TitleBanner({
  attraction,
  accent,
  y,
  z,
}: {
  attraction: Attraction
  accent: string
  y: number
  z: number
}) {
  return (
    <group position={[0, y, z]}>
      <mesh castShadow>
        <boxGeometry args={[5.9, 1.25, 0.22]} />
        <meshStandardMaterial
          color="#0e0c12"
          emissive={accent}
          emissiveIntensity={0.14}
          roughness={0.48}
          metalness={0.22}
        />
      </mesh>
      <Text
        position={[0, 0.14, 0.15]}
        fontSize={0.44}
        color="#f6df9d"
        anchorX="center"
        anchorY="middle"
        maxWidth={5.4}
      >
        {attraction.title}
      </Text>
      <Text
        position={[0, -0.38, 0.13]}
        fontSize={0.22}
        color="#c5bda9"
        anchorX="center"
        anchorY="middle"
      >
        {attraction.subtitle}
      </Text>
    </group>
  )
}

function AttractionInfoBoard({
  position,
  accentColor,
  description,
  heading,
}: {
  position: [number, number, number]
  accentColor: string
  description: string
  heading: string
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.9, 0.24, 1.05]} />
        <meshStandardMaterial color="#29242c" roughness={0.62} />
      </mesh>
      {[-1.12, 1.12].map((x) => (
        <mesh key={x} position={[x, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.075, 2.15, 10]} />
          <meshStandardMaterial color="#a8864d" metalness={0.66} roughness={0.34} />
        </mesh>
      ))}
      <mesh position={[0, 1.55, 0.04]} castShadow>
        <boxGeometry args={[3.05, 1.58, 0.16]} />
        <meshStandardMaterial
          color="#17151d"
          emissive={accentColor}
          emissiveIntensity={0.08}
          metalness={0.18}
          roughness={0.5}
        />
      </mesh>
      <Text
        position={[0, 1.98, 0.15]}
        fontSize={0.18}
        color={accentColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={2.6}
      >
        {heading}
      </Text>
      <Text
        position={[0, 1.46, 0.15]}
        fontSize={0.2}
        lineHeight={1.45}
        color="#f1eadc"
        anchorX="center"
        anchorY="middle"
        textAlign="center"
        maxWidth={2.65}
      >
        {description}
      </Text>
    </group>
  )
}
