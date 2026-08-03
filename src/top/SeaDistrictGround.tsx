/**
 * Sea エリア床 — 夜のビーチ。曲線の波打ち際・砂の自然模様・遠くまで続く海。
 * 東の桟橋付近だけ波打ちを直線にして橋とつなぐ。
 */
import { useMemo } from 'react'
import {
  CanvasTexture,
  type BufferGeometry,
  RepeatWrapping,
  Shape,
  ShapeGeometry,
} from 'three'
import { PalmTree } from '../world/PalmTree'
import {
  buildShoreRingRect,
  createRingStripGeometry,
  expandShoreRing,
  type RingPoint,
} from '../world/wavyShoreGeometry'
import type { ParkZoneLayout } from './parkZones'
import { SEA_PALM_PLACEMENTS } from './seaPalms'

const SAND_DRY = '#d4b888'
const SAND_WET = '#9a8060'
const SAND_WET_DEEP = '#7a6448'
const FOAM = '#d8e8f0'
const WATER_SHALLOW = '#1a6a88'
const WATER_MID = '#0e4a68'
const WATER_DEEP = '#083848'
const WATER_HORIZON = '#061828'

/** 桟橋デッキ半幅に合わせた取り付き帯（Z） */
const BRIDGE_LANDING_HALF_Z = 2.75

function beachExtents(layout: ParkZoneLayout) {
  const halfX = Math.min(layout.boundsX - 5.0, 21.4)
  const halfZN = Math.min(layout.maxZ - 2.4, 11.9)
  const halfZS = Math.min(Math.abs(layout.minZ) - 0.6, 15.6)
  const halfZ = (halfZN + halfZS) * 0.5
  const centerZ = layout.groundZ + (halfZN - halfZS) * 0.5
  return { halfX, halfZ, halfZN, halfZS, centerZ }
}

function filledShapeFromRing(ring: RingPoint[]): BufferGeometry {
  const shape = new Shape()
  ring.forEach((p, i) => {
    if (i === 0) shape.moveTo(p.x, p.y)
    else shape.lineTo(p.x, p.y)
  })
  shape.closePath()
  const geo = new ShapeGeometry(shape, 8)
  geo.rotateX(-Math.PI / 2)
  geo.computeVertexNormals()
  return geo
}

/**
 * 東の桟橋前だけ波を潰して直線の取り付きにする。
 * landX まで砂／浅瀬を伸ばし、泡は帯を薄くして橋の下を走らないようにする。
 */
function pinEastBridgeLanding(
  ring: RingPoint[],
  landX: number,
  halfZ: number,
  mode: 'extend' | 'cap' = 'extend',
): RingPoint[] {
  const flare = halfZ + 2.4
  return ring.map((p) => {
    if (p.x < landX - 5) return p
    const az = Math.abs(p.y)
    if (az > flare) return p
    const edge = Math.min(1, Math.max(0, (flare - az) / 1.6))
    const targetX =
      mode === 'cap' ? landX : Math.max(p.x, landX)
    return {
      x: p.x * (1 - edge) + targetX * edge,
      y: p.y,
    }
  })
}

/** 砂粒・まだらのキャンバステクスチャ（夜でも読めるコントラスト） */
function createSandGrainTexture() {
  if (typeof document === 'undefined') return null
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.fillStyle = SAND_DRY
  ctx.fillRect(0, 0, size, size)

  for (let i = 0; i < 4200; i += 1) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 0.4 + Math.random() * 1.8
    const shade = 150 + Math.floor(Math.random() * 55)
    const a = 0.1 + Math.random() * 0.24
    ctx.fillStyle = `rgba(${shade}, ${shade - 20}, ${shade - 50}, ${a})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  for (let i = 0; i < 28; i += 1) {
    const x = Math.random() * size
    const y = Math.random() * size
    const rx = 12 + Math.random() * 36
    const ry = 10 + Math.random() * 28
    ctx.fillStyle =
      i % 2 === 0 ? 'rgba(180, 150, 100, 0.2)' : 'rgba(210, 180, 130, 0.16)'
    ctx.beginPath()
    ctx.ellipse(x, y, rx, ry, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new CanvasTexture(canvas)
  tex.wrapS = RepeatWrapping
  tex.wrapT = RepeatWrapping
  tex.repeat.set(7, 6)
  tex.needsUpdate = true
  return tex
}

export function SeaDistrictGround({ layout }: { layout: ParkZoneLayout }) {
  const { groundZ } = layout
  const beach = beachExtents(layout)
  // 桟橋ゲートは z=1。床グループは centerZ 基準なのでローカル Z へ変換
  const bridgeLocalZ = 1 - beach.centerZ

  const geos = useMemo(() => {
    const samples = 144
    const landDry = beach.halfX + 0.55
    const landWet = beach.halfX + 1.55
    const landShallow = beach.halfX + 3.6
    const landFoamCap = beach.halfX + 1.65

    let dry = buildShoreRingRect({
      halfX: beach.halfX - 0.35,
      halfZ: beach.halfZ - 0.25,
      cornerRadius: 5.8,
      waveAmp: 1.25,
      wavesAround: 5,
      samples,
      phase: 0.32,
    })
    let wet = buildShoreRingRect({
      halfX: beach.halfX + 1.15,
      halfZ: beach.halfZ + 1.05,
      cornerRadius: 6.4,
      waveAmp: 1.45,
      wavesAround: 5,
      samples,
      phase: 0.55,
    })
    let shallow = buildShoreRingRect({
      halfX: beach.halfX + 3.4,
      halfZ: beach.halfZ + 3.1,
      cornerRadius: 7.2,
      waveAmp: 1.7,
      wavesAround: 5,
      samples,
      phase: 0.78,
    })

    dry = pinEastBridgeLanding(dry, landDry, BRIDGE_LANDING_HALF_Z, 'extend')
    wet = pinEastBridgeLanding(wet, landWet, BRIDGE_LANDING_HALF_Z, 'extend')
    shallow = pinEastBridgeLanding(shallow, landShallow, BRIDGE_LANDING_HALF_Z, 'extend')

    // 泡は桟橋取り付き帯でほぼ潰す（橋の下を横切らない）
    const foamInner = pinEastBridgeLanding(wet, landFoamCap, BRIDGE_LANDING_HALF_Z, 'cap')
    const foamOuter = pinEastBridgeLanding(
      expandShoreRing(wet, 0.85),
      landFoamCap + 0.12,
      BRIDGE_LANDING_HALF_Z,
      'cap',
    )
    const foamOuter2 = pinEastBridgeLanding(
      expandShoreRing(wet, 1.7),
      landFoamCap + 0.35,
      BRIDGE_LANDING_HALF_Z,
      'cap',
    )

    return {
      dry: filledShapeFromRing(dry),
      wet: filledShapeFromRing(wet),
      shallow: filledShapeFromRing(shallow),
      foam: createRingStripGeometry(foamInner, foamOuter),
      foamSoft: createRingStripGeometry(foamOuter, foamOuter2),
      landDry,
      landWet,
    }
  }, [beach.halfX, beach.halfZ])

  const sandMap = useMemo(() => createSandGrainTexture(), [])

  // 桟橋への砂の舌（橋西端まで伸ばす）
  const apronLen = 4.2
  const apronMidX = geos.landDry + apronLen * 0.35

  return (
    <group>
      {/* 地平まで続く夜の海 */}
      <mesh position={[0, -0.42, groundZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[520, 520]} />
        <meshStandardMaterial
          color={WATER_HORIZON}
          emissive={WATER_DEEP}
          emissiveIntensity={0.18}
          metalness={0.55}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[0, -0.36, groundZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial
          color={WATER_DEEP}
          emissive={WATER_MID}
          emissiveIntensity={0.2}
          metalness={0.5}
          roughness={0.24}
          transparent
          opacity={0.96}
        />
      </mesh>
      <mesh position={[0, -0.3, groundZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[96, 96]} />
        <meshStandardMaterial
          color={WATER_MID}
          emissive={WATER_SHALLOW}
          emissiveIntensity={0.14}
          metalness={0.45}
          roughness={0.2}
          transparent
          opacity={0.92}
        />
      </mesh>

      <group position={[0, 0, beach.centerZ]}>
        <mesh geometry={geos.shallow} receiveShadow position={[0, -0.18, 0]}>
          <meshStandardMaterial
            color={WATER_SHALLOW}
            emissive="#2a7a98"
            emissiveIntensity={0.12}
            metalness={0.35}
            roughness={0.2}
            transparent
            opacity={0.72}
          />
        </mesh>

        <mesh geometry={geos.wet} receiveShadow position={[0, 0.01, 0]}>
          <meshStandardMaterial color={SAND_WET} roughness={0.9} metalness={0.04} />
        </mesh>
        <mesh geometry={geos.wet} receiveShadow position={[0, 0.014, 0]} scale={[0.94, 1, 0.94]}>
          <meshStandardMaterial
            color={SAND_WET_DEEP}
            roughness={0.92}
            metalness={0.05}
            transparent
            opacity={0.55}
          />
        </mesh>

        <mesh geometry={geos.dry} receiveShadow position={[0, 0.028, 0]}>
          <meshStandardMaterial
            color={SAND_DRY}
            map={sandMap ?? undefined}
            roughness={0.97}
            metalness={0.02}
          />
        </mesh>

        {/* 桟橋取り付きの砂の舌（曲線と橋を接続） */}
        <mesh
          position={[apronMidX, 0.032, bridgeLocalZ]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[apronLen, BRIDGE_LANDING_HALF_Z * 2 + 0.6]} />
          <meshStandardMaterial
            color={SAND_DRY}
            map={sandMap ?? undefined}
            roughness={0.97}
            metalness={0.02}
          />
        </mesh>
        <mesh
          position={[apronMidX + 0.35, 0.02, bridgeLocalZ]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[apronLen * 0.85, BRIDGE_LANDING_HALF_Z * 2 + 1.1]} />
          <meshStandardMaterial color={SAND_WET} roughness={0.9} metalness={0.04} />
        </mesh>

        <mesh geometry={geos.foam} position={[0, 0.038, 0]} receiveShadow>
          <meshStandardMaterial
            color={FOAM}
            emissive={FOAM}
            emissiveIntensity={0.12}
            transparent
            opacity={0.7}
            roughness={0.35}
          />
        </mesh>
        <mesh geometry={geos.foamSoft} position={[0, 0.02, 0]}>
          <meshStandardMaterial
            color="#a8c8d8"
            emissive={WATER_SHALLOW}
            emissiveIntensity={0.08}
            transparent
            opacity={0.28}
            roughness={0.22}
            metalness={0.3}
          />
        </mesh>
      </group>

      {SEA_PALM_PLACEMENTS.map((palm, index) => (
        <PalmTree
          key={`sea-palm-${index}`}
          position={palm.position}
          scale={palm.scale}
          rotationY={palm.rotationY}
          lean={palm.lean}
        />
      ))}
    </group>
  )
}
