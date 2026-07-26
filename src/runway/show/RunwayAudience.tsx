import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { applyVRMSitPose } from '../../avatar/VRMLocomotion'
import { useVRMModel } from '../../avatar/useVRMModel'
import { MeebitSilhouette } from '../../avatar/MeebitSilhouette'
import { VRM_WORLD_SCALE } from '../../game/gameConfig'
import { RUNWAY } from '../config'
import { useRunwayStore } from '../store'

/** ベンチローカル: 座面中心 (0,0,0)、背もたれは -Z。座面奥行き ±0.35 */
const SEAT_ALONG = [-0.55, 0.55] as const
/** 背もたれ前面 ≈ -0.22 付近まで寄せる */
const SEAT_DEPTH = 0.3
/**
 * VRM 原点は足元。着席ポーズ後の腰高さに合わせ、
 * 座面上面（≈0.48）に腰が載るよう低めに置く。
 */
const SEAT_Y = -0.15

/** 客席ベンチに座る観客 Meebit */
export function RunwayAudience() {
  const audienceIds = useRunwayStore((state) => state.audienceIds)
  const phase = useRunwayStore((state) => state.phase)

  const seats = useMemo(() => {
    const result: Array<{
      meebitNumber: number
      x: number
      z: number
      rotationY: number
    }> = []

    let seatIndex = 0
    for (const bench of RUNWAY.benches) {
      const cos = Math.cos(bench.rotationY)
      const sin = Math.sin(bench.rotationY)

      for (const along of SEAT_ALONG) {
        if (seatIndex >= audienceIds.length) break

        // ベンチローカル (along, depth) → ワールド（Three.js Y 回転）
        const worldX = bench.x + along * cos + SEAT_DEPTH * sin
        const worldZ = bench.z - along * sin + SEAT_DEPTH * cos
        // ランウェイ中央（ポーズ位置）を向く
        const rotationY = Math.atan2(-worldX, RUNWAY.pauseZ - worldZ)

        result.push({
          meebitNumber: audienceIds[seatIndex],
          x: worldX,
          z: worldZ,
          rotationY,
        })
        seatIndex += 1
      }
      if (seatIndex >= audienceIds.length) break
    }
    return result
  }, [audienceIds])

  if (phase !== 'playing') return null

  return (
    <group>
      {seats.map((seat) => (
        <SeatedAudience
          key={`aud-${seat.meebitNumber}-${seat.x.toFixed(2)}`}
          meebitNumber={seat.meebitNumber}
          x={seat.x}
          z={seat.z}
          rotationY={seat.rotationY}
        />
      ))}
    </group>
  )
}

function SeatedAudience({
  meebitNumber,
  x,
  z,
  rotationY,
}: {
  meebitNumber: number
  x: number
  z: number
  rotationY: number
}) {
  const groupRef = useRef<Group>(null)
  const { vrmRef, vrmScene, update } = useVRMModel(meebitNumber, true, 200, true, true)

  useFrame((_, delta) => {
    applyVRMSitPose(vrmRef.current)
    update(Math.min(delta, 0.05))
  })

  return (
    <group ref={groupRef} position={[x, SEAT_Y, z]} rotation={[0, rotationY, 0]}>
      {vrmScene ? (
        <primitive object={vrmScene} scale={VRM_WORLD_SCALE} />
      ) : (
        <group position={[0, 0.05, 0]}>
          <MeebitSilhouette />
        </group>
      )}
    </group>
  )
}
