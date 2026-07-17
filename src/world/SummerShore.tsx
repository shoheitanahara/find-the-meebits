import { useMemo } from 'react'
import * as THREE from 'three'
import { buildShoreRing } from './wavyShoreGeometry'

/**
 * 夏仕様の海〜砂浜。
 *
 * 穴・ストリップ・リングは一切使わない。
 * 単純に「大きい平面の上に小さい平面を重ねる」だけ。
 * プラザ (Y=0.01) が最上面で砂を隠すので、砂に穴を開ける必要がない。
 */
export function SummerShore() {
  const drySandGeo = useMemo(() => {
    const ring = buildShoreRing({
      half: 57,
      cornerRadius: 14,
      waveAmp: 1.0,
      wavesAround: 4,
      samples: 128,
      phase: 0.3,
    })
    return filledShapeFromRing(ring)
  }, [])

  const wetSandGeo = useMemo(() => {
    const ring = buildShoreRing({
      half: 64,
      cornerRadius: 16,
      waveAmp: 1.3,
      wavesAround: 5,
      samples: 128,
      phase: 0.45,
    })
    return filledShapeFromRing(ring)
  }, [])

  const shallowGeo = useMemo(() => {
    const ring = buildShoreRing({
      half: 72,
      cornerRadius: 18,
      waveAmp: 1.6,
      wavesAround: 5,
      samples: 128,
      phase: 0.7,
    })
    return filledShapeFromRing(ring)
  }, [])

  return (
    <group>
      {/* 最下層: 深い海 */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.14, 0]}>
        <planeGeometry args={[220, 220]} />
        <meshStandardMaterial color="#2a9fd6" roughness={0.34} metalness={0.16} />
      </mesh>

      {/* 浅瀬 (深い海の上に重ねる) */}
      <mesh geometry={shallowGeo} receiveShadow position={[0, -0.10, 0]}>
        <meshStandardMaterial color="#5cc8e8" roughness={0.30} metalness={0.12} />
      </mesh>

      {/* 湿った砂 (浅瀬の上に重ねる) */}
      <mesh geometry={wetSandGeo} receiveShadow position={[0, -0.06, 0]}>
        <meshStandardMaterial color="#cbb07a" roughness={0.92} />
      </mesh>

      {/* 上層: 乾いた砂 (湿った砂の上に重ねる) */}
      <mesh geometry={drySandGeo} receiveShadow position={[0, -0.03, 0]}>
        <meshStandardMaterial color="#e8d4a4" roughness={0.95} />
      </mesh>

      {/* プラザ (Y=0.01) がこの上から砂中央を覆い隠す */}
    </group>
  )
}

/** 波打ちリングの内側を塗りつぶした ShapeGeometry（穴なし） */
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
