import { useMemo } from 'react'
import * as THREE from 'three'
import { buildShoreRing } from '../world/wavyShoreGeometry'
import type { ParkSeasonLook } from './parkSeason'
import { PARK_HUB } from './parkLayout'

/**
 * Park 向け夏の海〜砂浜。
 * PARK_HUB の島半径と中心 z に合わせ、広場が砂からはみ出さないようにする。
 */
export function ParkSummerShore({ look }: { look: ParkSeasonLook }) {
  const {
    groundZ,
    shoreDryHalf,
    shoreWetHalf,
    shoreShallowHalf,
    shoreDryCorner,
    shoreWetCorner,
    shoreShallowCorner,
    oceanPlane,
  } = PARK_HUB

  const drySandGeo = useMemo(() => {
    const ring = buildShoreRing({
      half: shoreDryHalf,
      cornerRadius: shoreDryCorner,
      waveAmp: 0.9,
      wavesAround: 5,
      samples: 96,
      phase: 0.25,
    })
    return filledShapeFromRing(ring)
  }, [shoreDryHalf, shoreDryCorner])

  const wetSandGeo = useMemo(() => {
    const ring = buildShoreRing({
      half: shoreWetHalf,
      cornerRadius: shoreWetCorner,
      waveAmp: 1.1,
      wavesAround: 5,
      samples: 96,
      phase: 0.4,
    })
    return filledShapeFromRing(ring)
  }, [shoreWetHalf, shoreWetCorner])

  const shallowGeo = useMemo(() => {
    const ring = buildShoreRing({
      half: shoreShallowHalf,
      cornerRadius: shoreShallowCorner,
      waveAmp: 1.35,
      wavesAround: 6,
      samples: 96,
      phase: 0.65,
    })
    return filledShapeFromRing(ring)
  }, [shoreShallowHalf, shoreShallowCorner])

  return (
    <group position={[0, 0, groundZ]}>
      {/* 最下層: 深い海 */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.42, 0]}>
        <planeGeometry args={[oceanPlane, oceanPlane]} />
        <meshStandardMaterial
          color={look.oceanColor}
          emissive={look.oceanEmissive}
          emissiveIntensity={look.oceanEmissiveIntensity}
          roughness={0.34}
          metalness={0.16}
        />
      </mesh>

      {/* 浅瀬 */}
      <mesh geometry={shallowGeo} receiveShadow position={[0, -0.28, 0]}>
        <meshStandardMaterial color="#5cc8e8" roughness={0.3} metalness={0.12} />
      </mesh>

      {/* 湿った砂 */}
      <mesh geometry={wetSandGeo} receiveShadow position={[0, -0.18, 0]}>
        <meshStandardMaterial color="#cbb07a" roughness={0.92} />
      </mesh>

      {/* 乾いた砂（島の土台） */}
      <mesh geometry={drySandGeo} receiveShadow position={[0, -0.08, 0]}>
        <meshStandardMaterial color={look.islandColor} roughness={0.95} />
      </mesh>
    </group>
  )
}

function filledShapeFromRing(ring: { x: number; y: number }[]): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  ring.forEach((p, i) => {
    if (i === 0) shape.moveTo(p.x, p.y)
    else shape.lineTo(p.x, p.y)
  })
  shape.closePath()

  const geo = new THREE.ShapeGeometry(shape, 6)
  geo.rotateX(-Math.PI / 2)
  geo.computeVertexNormals()
  return geo
}
