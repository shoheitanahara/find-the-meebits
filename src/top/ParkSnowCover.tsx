/**
 * Plaza 連続メッシュ床向けの積雪（インスタンス）。
 * Mountain 同様 1×1。川面には載せない。川の内縁まで隙間なく接する。
 */
import { useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh, Object3D } from 'three'
import type { ParkZoneLayout } from './parkZones'

const scratch = new Object3D()
const TILE = 1
const SNOW_H = 0.08

function hash2(x: number, z: number) {
  const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453
  return n - Math.floor(n)
}

/** parkPerimeterSpec の classic 川内縁と同じ式（Plaza 床専用） */
function plazaRiverInner(layout: ParkZoneLayout) {
  return {
    riverInnerX: Math.min(layout.boundsX - 4.8, 22.2),
    riverInnerZS: Math.min(Math.abs(layout.minZ) - 0.4, 16.2),
    riverWidth: 2.5,
  }
}

function rangesOverlap(a0: number, a1: number, b0: number, b1: number) {
  return a0 < b1 && a1 > b0
}

export function ParkSnowCover({
  layout,
  clearRadius = 0,
  clearCenterX = 0,
  clearCenterZ,
  y = 0.085,
  tint = '#e8eef4',
}: {
  layout: ParkZoneLayout
  clearRadius?: number
  clearCenterX?: number
  clearCenterZ?: number
  y?: number
  tint?: string
}) {
  const { groundZ, districtHalfX, districtHalfZ } = layout
  const clearZ = clearCenterZ ?? groundZ

  const positions = useMemo(() => {
    const list: Array<{ x: number; z: number }> = []
    const { riverInnerX, riverInnerZS, riverWidth } = plazaRiverInner(layout)
    const riverOuterX = riverInnerX + riverWidth
    const riverOuterZS = riverInnerZS + riverWidth

    /** タイル [x,x+1]×[z,z+1] が川帯と少しでも重なるか */
    const tileHitsRiver = (x: number, z: number) => {
      const x0 = x
      const x1 = x + 1
      const z0 = z
      const z1 = z + 1
      if (rangesOverlap(x0, x1, riverInnerX, riverOuterX)) return true
      if (rangesOverlap(x0, x1, -riverOuterX, -riverInnerX)) return true
      if (rangesOverlap(z0, z1, groundZ - riverOuterZS, groundZ - riverInnerZS)) return true
      return false
    }

    const maybePush = (x: number, z: number, chance: number) => {
      if (tileHitsRiver(x, z)) return
      const cx = x + 0.5
      const cz = z + 0.5
      if (clearRadius > 0 && Math.hypot(cx - clearCenterX, cz - clearZ) < clearRadius) return
      const snowPatch = hash2(Math.floor(x * 10) + 17, Math.floor(z * 10) - 9)
      if (snowPatch > chance) return
      list.push({ x, z })
    }

    const xMin = -Math.floor(districtHalfX)
    const xMax = Math.floor(districtHalfX) - 1
    const zMin = Math.floor(groundZ - districtHalfZ)
    const zMax = Math.floor(groundZ + districtHalfZ) - 1

    for (let x = xMin; x <= xMax; x += 1) {
      for (let z = zMin; z <= zMax; z += 1) {
        const ax = Math.abs(x + 0.5)
        const az = Math.abs(z + 0.5 - groundZ)
        const nearRiver = ax > riverInnerX - 6 || z + 0.5 < groundZ - riverInnerZS + 6
        const midRing = ax > 8 || az > 8
        const chance = nearRiver ? 0.62 : midRing ? 0.4 : 0.18
        maybePush(x, z, chance)
      }
    }

    // 川内縁にぴったり接する列（整数タイルだと 1 マス空きが出るため）
    const flushChance = 0.64
    for (let z = zMin; z <= zMax; z += 1) {
      maybePush(riverInnerX - 1, z, flushChance)
      maybePush(-riverInnerX, z, flushChance)
    }
    // 南川の内縁: タイル原点を川内縁に置き、園路側（+Z）へ 1 マス
    for (let x = xMin; x <= xMax; x += 1) {
      maybePush(x, groundZ - riverInnerZS, flushChance)
    }

    return list
  }, [clearCenterX, clearRadius, clearZ, districtHalfX, districtHalfZ, groundZ, layout])

  const meshRef = useRef<InstancedMesh>(null)

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    positions.forEach((pos, index) => {
      scratch.position.set(pos.x + TILE * 0.5, y + SNOW_H * 0.5, pos.z + TILE * 0.5)
      scratch.scale.set(TILE * 0.98, SNOW_H, TILE * 0.98)
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
