import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { getTabPausedMs } from '../../systems/tabPause'
import { STARLIGHT_RUSH } from '../config'
import { getDailyStarlightFlyby, type StarlightFlybyPilot } from '../dailyStarlightFlyby'
import { useStarlightRushStore } from '../store'
import { StarlightFlybyPilotView } from './StarlightFlybyPilot'

/**
 * 日替わり僚機のすれ違い。
 * idle 中から VRM を先読みし、出現時のヒッチを抑える。
 * 表示・移動は playing 中のみ。
 */
export function StarlightFlybyNpcs() {
  const sessionKey = useStarlightRushStore((state) => state.sessionKey)
  const lineup = useMemo(() => getDailyStarlightFlyby(), [sessionKey])

  return (
    <group>
      {lineup.pilots.map((pilot) => (
        <StarlightFlybySlot key={`${lineup.dateKey}-${pilot.meebitNumber}`} pilot={pilot} />
      ))}
    </group>
  )
}

function StarlightFlybySlot({ pilot }: { pilot: StarlightFlybyPilot }) {
  const groupRef = useRef<Group>(null)
  const visibleRef = useRef(false)

  useFrame(() => {
    const group = groupRef.current
    if (!group) return

    const { phase, startedAt } = useStarlightRushStore.getState()
    if (phase !== 'playing' || startedAt === null) {
      if (visibleRef.current) {
        visibleRef.current = false
        group.visible = false
      }
      return
    }

    const elapsed = (performance.now() - startedAt - getTabPausedMs()) / 1000
    const { spawnZ, passZ } = STARLIGHT_RUSH.flyby
    if (elapsed < pilot.spawnAtSec) {
      if (visibleRef.current) {
        visibleRef.current = false
        group.visible = false
      }
      return
    }

    const z = spawnZ + pilot.speed * (elapsed - pilot.spawnAtSec)
    if (z >= passZ) {
      if (visibleRef.current) {
        visibleRef.current = false
        group.visible = false
      }
      return
    }

    if (!visibleRef.current) {
      visibleRef.current = true
      group.visible = true
    }
    group.position.set(pilot.laneX, pilot.y, z)
  })

  return (
    <group ref={groupRef} visible={false} userData={{ flyby: true }}>
      <StarlightFlybyPilotView pilot={pilot} />
    </group>
  )
}
