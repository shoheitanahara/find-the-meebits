/**
 * Plaza など連続メッシュ床向けの薄い積雪パッチ（インスタンス）。
 * 園路・噴水円は空けて、周辺だけ雪を乗せる。
 */
import { useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh, Object3D } from 'three'
import type { ParkZoneLayout } from './parkZones'

const scratch = new Object3D()
const TILE = 1
const SNOW_H = 0.07

function hash2(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

export function ParkSnowCover({
  layout,
  /** 中央円（噴水広場）を空ける半径。0 で無効 */
  clearRadius = 0,
  /** 園路クリア半幅 */
  pathHalfX,
  pathHalfZ,
  /** 0–1。大きいほど雪が多い */
  density = 0.58,
  y = 0.09,
  tint = '#e8eef4',
}: {
  layout: ParkZoneLayout
  clearRadius?: number
  pathHalfX?: number
  pathHalfZ?: number
  density?: number
  y?: number
  tint?: string
}) {
  const { groundZ, districtHalfX, districtHalfZ, pathSizeX, pathSizeZ } = layout
  const clearPathX = pathHalfX ?? pathSizeX * 0.48
  const clearPathZ = pathHalfZ ?? Math.min(districtHalfZ - 1, pathSizeZ * 0.42)

  const positions = useMemo(() => {
    const list: Array<{ x: number; z: number; scale: number }> = []
    const xMin = Math.floor(-districtHalfX)
    const xMax = Math.floor(districtHalfX) - 1
    const zMin = Math.floor(groundZ - districtHalfZ)
    const zMax = Math.floor(groundZ + districtHalfZ) - 1

    for (let x = xMin; x <= xMax; x += 1) {
      for (let z = zMin; z <= zMax; z += 1) {
        const cx = x + 0.5
        const cz = z + 0.5
        if (clearRadius > 0 && Math.hypot(cx, cz - groundZ) < clearRadius) continue
        if (Math.abs(cx) <= clearPathX && Math.abs(cz - groundZ) <= clearPathZ) continue

        const n = hash2(x + 3, z - 11)
        if (n > density) continue
        // 端ほど大きめの塊、内側は小さめのまだら
        const edge =
          Math.abs(cx) > districtHalfX - 3 || Math.abs(cz - groundZ) > districtHalfZ - 3
        list.push({ x, z, scale: edge ? 0.96 : 0.72 + n * 0.22 })
      }
    }
    return list
  }, [
    clearPathX,
    clearPathZ,
    clearRadius,
    density,
    districtHalfX,
    districtHalfZ,
    groundZ,
  ])

  const meshRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    positions.forEach((pos, index) => {
      scratch.position.set(pos.x + TILE * 0.5, y + SNOW_H * 0.5, pos.z + TILE * 0.5)
      scratch.scale.set(TILE * pos.scale, SNOW_H, TILE * pos.scale)
      scratch.updateMatrix()
      mesh.setMatrixAt(index, scratch.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [positions, y])

  if (positions.length === 0) return null

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, positions.length]} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={tint} roughness={0.9} metalness={0.02} />
    </instancedMesh>
  )
}
