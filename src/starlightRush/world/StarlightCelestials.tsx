import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Group, MathUtils } from 'three'
import { starlightRideRuntime } from '../ridePath'

/**
 * 背景の天体: 太陽・地球・火星。
 * テクスチャなしの手続きメッシュで、ライド中に通り過ぎる景色として配置。
 */
export function StarlightCelestials() {
  return (
    <group>
      <SunBody />
      <EarthBody />
      <MarsBody />
      <NebulaClouds />
      <FarStarfield />
    </group>
  )
}

function SunBody() {
  const ref = useRef<Group>(null)
  const coronaRef = useRef<Group>(null)

  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.08
    if (coronaRef.current) {
      coronaRef.current.rotation.z += delta * 0.12
      coronaRef.current.rotation.x += delta * 0.04
    }
    // ワープ時は少し近づいて迫力を出す
    const boost = starlightRideRuntime.warpBoost
    ref.current.position.x = MathUtils.lerp(-32, -22, boost)
    ref.current.position.y = MathUtils.lerp(14, 10, boost)
  })

  return (
    <group ref={ref} position={[-32, 14, -55]}>
      <mesh>
        <sphereGeometry args={[9, 32, 32]} />
        <meshStandardMaterial
          color="#ffcc55"
          emissive="#ff8a1a"
          emissiveIntensity={1.4}
          roughness={0.45}
          metalness={0.05}
          toneMapped={false}
        />
      </mesh>
      {/* コロナ */}
      <group ref={coronaRef}>
        <mesh scale={1.18}>
          <sphereGeometry args={[9, 24, 24]} />
          <meshBasicMaterial color="#ffb040" transparent opacity={0.22} depthWrite={false} />
        </mesh>
        <mesh scale={1.38}>
          <sphereGeometry args={[9, 20, 20]} />
          <meshBasicMaterial color="#ff6a20" transparent opacity={0.12} depthWrite={false} />
        </mesh>
        {/* フレアっぽい薄いリング */}
        <mesh rotation={[0.4, 0.2, 0.5]}>
          <torusGeometry args={[11.5, 0.35, 8, 48]} />
          <meshBasicMaterial color="#ffe08a" transparent opacity={0.28} depthWrite={false} />
        </mesh>
      </group>
      <pointLight intensity={45} distance={120} color="#ffc060" decay={2} />
      <pointLight intensity={18} distance={80} color="#ff7040" decay={2} position={[0, 0, 8]} />
    </group>
  )
}

function EarthBody() {
  const ref = useRef<Group>(null)
  const cloudRef = useRef<Group>(null)

  const continents = useMemo(
    () =>
      [
        { x: 0.55, y: 0.35, z: 0.75, s: [1.4, 0.9, 0.55], rot: [0.2, 0.4, 0] as [number, number, number] },
        { x: -0.7, y: 0.15, z: 0.65, s: [1.1, 1.3, 0.5], rot: [0.1, -0.5, 0.2] as [number, number, number] },
        { x: 0.2, y: -0.55, z: 0.78, s: [1.6, 0.7, 0.45], rot: [-0.3, 0.2, 0] as [number, number, number] },
        { x: -0.3, y: 0.7, z: 0.55, s: [0.9, 0.7, 0.4], rot: [0.5, 0, 0.1] as [number, number, number] },
        { x: 0.75, y: -0.2, z: -0.55, s: [1.2, 1.0, 0.5], rot: [0, 2.2, 0.2] as [number, number, number] },
      ] as const,
    [],
  )

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.12
    if (cloudRef.current) cloudRef.current.rotation.y += delta * 0.16
    const boost = starlightRideRuntime.warpBoost
    if (ref.current) {
      ref.current.position.z = MathUtils.lerp(8, 18, boost)
    }
  })

  const R = 5.2

  return (
    <group ref={ref} position={[22, 2, 8]}>
      {/* 海 */}
      <mesh>
        <sphereGeometry args={[R, 36, 36]} />
        <meshStandardMaterial
          color="#1a5f9e"
          emissive="#0a2a50"
          emissiveIntensity={0.25}
          roughness={0.45}
          metalness={0.15}
        />
      </mesh>
      {/* 大陸パッチ */}
      {continents.map((c, i) => (
        <mesh
          key={i}
          position={[c.x * R * 0.92, c.y * R * 0.92, c.z * R * 0.92]}
          rotation={c.rot}
          scale={c.s}
        >
          <sphereGeometry args={[1.15, 12, 10]} />
          <meshStandardMaterial color="#3d8a4a" roughness={0.85} metalness={0.05} />
        </mesh>
      ))}
      {/* 極冠 */}
      <mesh position={[0, R * 0.92, 0]} scale={[1.4, 0.45, 1.4]}>
        <sphereGeometry args={[1.2, 12, 8]} />
        <meshStandardMaterial color="#e8f4ff" roughness={0.7} />
      </mesh>
      <mesh position={[0, -R * 0.9, 0]} scale={[1.2, 0.4, 1.2]}>
        <sphereGeometry args={[1.1, 12, 8]} />
        <meshStandardMaterial color="#d8e8f8" roughness={0.75} />
      </mesh>
      {/* 雲 */}
      <group ref={cloudRef}>
        <mesh scale={1.045}>
          <sphereGeometry args={[R, 24, 24]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.22}
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      </group>
      {/* 大気グロー */}
      <mesh scale={1.1}>
        <sphereGeometry args={[R, 24, 24]} />
        <meshBasicMaterial color="#6ec8ff" transparent opacity={0.14} depthWrite={false} />
      </mesh>
    </group>
  )
}

function MarsBody() {
  const ref = useRef<Group>(null)

  const craters = useMemo(
    () =>
      [
        { x: 0.6, y: 0.4, z: 0.7, r: 0.55 },
        { x: -0.5, y: 0.2, z: 0.8, r: 0.4 },
        { x: 0.1, y: -0.6, z: 0.75, r: 0.7 },
        { x: -0.7, y: -0.3, z: 0.55, r: 0.35 },
        { x: 0.4, y: 0.65, z: -0.5, r: 0.45 },
      ] as const,
    [],
  )

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.09
    const boost = starlightRideRuntime.warpBoost
    ref.current.position.x = MathUtils.lerp(-18, -12, boost)
    ref.current.position.z = MathUtils.lerp(-28, -18, boost)
  })

  const R = 3.8

  // ティール系氷惑星 — collectible の orange/gold 星と色相が被らない
  return (
    <group ref={ref} position={[-18, -3, -28]}>
      <mesh>
        <sphereGeometry args={[R, 32, 32]} />
        <meshStandardMaterial
          color="#2f7f8c"
          emissive="#0a2e38"
          emissiveIntensity={0.28}
          roughness={0.82}
          metalness={0.08}
        />
      </mesh>
      {/* 暗い高原 */}
      <mesh position={[0.3 * R, 0.2 * R, 0.85 * R]} scale={[1.8, 1.2, 0.5]}>
        <sphereGeometry args={[1.1, 12, 10]} />
        <meshStandardMaterial color="#1a5560" roughness={0.95} />
      </mesh>
      <mesh position={[-0.5 * R, -0.35 * R, 0.75 * R]} scale={[1.5, 1.4, 0.45]}>
        <sphereGeometry args={[1.0, 12, 10]} />
        <meshStandardMaterial color="#246870" roughness={0.95} />
      </mesh>
      {/* クレーター */}
      {craters.map((c, i) => (
        <mesh
          key={i}
          position={[c.x * R * 0.95, c.y * R * 0.95, c.z * R * 0.95]}
          scale={[c.r, c.r * 0.35, c.r]}
        >
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#143848" roughness={1} />
        </mesh>
      ))}
      {/* 北極冠 */}
      <mesh position={[0, R * 0.88, 0]} scale={[1.1, 0.35, 1.1]}>
        <sphereGeometry args={[1.15, 12, 8]} />
        <meshStandardMaterial color="#e8f6fa" roughness={0.65} />
      </mesh>
      {/* 薄い大気 */}
      <mesh scale={1.06}>
        <sphereGeometry args={[R, 20, 20]} />
        <meshBasicMaterial color="#7ecad8" transparent opacity={0.12} depthWrite={false} />
      </mesh>
    </group>
  )
}

function NebulaClouds() {
  const colors = useMemo(
    () => [new Color('#1a3a6a'), new Color('#4a1a5a'), new Color('#0a4a4a'), new Color('#3a1a40')],
    [],
  )
  return (
    <group>
      {colors.map((color, i) => (
        <mesh
          key={i}
          position={[(i - 1.5) * 30, 4 + i * 4, -50 - i * 16]}
          scale={[20 + i * 5, 12 + i * 3, 16 + i * 4]}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color={color} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/** 遠景の明るい点（drei Stars の補完）。 */
function FarStarfield() {
  const points = useMemo(() => {
    const arr: [number, number, number, string][] = []
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2
      const elev = ((i * 17) % 20) - 10
      const r = 70 + (i % 7) * 4
      arr.push([
        Math.cos(a) * r,
        elev * 1.8,
        Math.sin(a) * r - 20,
        i % 3 === 0 ? '#ffe66d' : i % 3 === 1 ? '#8fdfff' : '#ffffff',
      ])
    }
    return arr
  }, [])

  return (
    <group>
      {points.map(([x, y, z, color], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.18 + (i % 4) * 0.06, 6, 6]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}
