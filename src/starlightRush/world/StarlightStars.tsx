import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, Mesh, MeshStandardMaterial } from 'three'
import { getDifficultyPhase, pickStarKindIndex, STARLIGHT_RUSH, type StarlightDifficultyPhase } from '../config'
import { getTabPausedMs } from '../../systems/tabPause'
import { useStarlightRushStore } from '../store'
import { useSharedStarGeometry } from './starGeometry'

export type StarRuntime = {
  id: number
  alive: boolean
  kindIndex: number
  x: number
  y: number
  z: number
  speed: number
  scale: number
  slot: number
  spin: number
}

export const starlightStarsRuntime: {
  stars: StarRuntime[]
  groups: Map<number, Group>
} = {
  stars: [],
  groups: new Map(),
}

let nextStarId = 1
let spawnAccumulator = 0

function activateStar(star: StarRuntime, phase: StarlightDifficultyPhase, slot: number) {
  const cfg = STARLIGHT_RUSH.phase[phase]
  const kindIndex = pickStarKindIndex(phase)
  const kind = STARLIGHT_RUSH.starKinds[kindIndex]
  const rareBoost = kind.id === 'gold' ? 1.2 : kind.score >= 300 ? 1.1 : 1
  star.id = nextStarId++
  star.alive = true
  star.kindIndex = kindIndex
  star.slot = slot
  // カメラが船の右後方なので、右側(+X)を多め・左側(-X)を控えめに
  const { spawnBias } = STARLIGHT_RUSH
  star.x =
    (spawnBias.xMin + Math.random() * (spawnBias.xMax - spawnBias.xMin)) * cfg.spreadX
  star.y = 0.35 + Math.random() * cfg.spreadY
  star.z = STARLIGHT_RUSH.starSpawnZ
  star.speed = cfg.approachSpeed * rareBoost * (0.9 + Math.random() * 0.2)
  star.scale = cfg.size * (kind.id === 'gold' ? 0.82 : kind.score >= 300 ? 0.9 : 1)
  star.spin = (Math.random() * 2 - 1) * 2.4
}

export function markStarHit(starId: number): StarRuntime | null {
  const star = starlightStarsRuntime.stars.find((s) => s.id === starId && s.alive)
  if (!star) return null
  star.alive = false
  return star
}

function tintStarGroup(group: Group, color: string) {
  for (const child of group.children) {
    if (!(child instanceof Mesh)) continue
    const mat = child.material
    if (Array.isArray(mat)) continue
    if (mat instanceof MeshStandardMaterial) {
      mat.color.set(color)
      mat.emissive.set(color)
    }
  }
}

/** 奥から手前へ流れるカラフルな星（押し出し星形 + グロー）。 */
export function StarlightStars() {
  const sessionKey = useStarlightRushStore((state) => state.sessionKey)
  const groupRefs = useRef<(Group | null)[]>([])
  const starsRef = useRef<StarRuntime[]>([])
  const starGeo = useSharedStarGeometry()

  useEffect(() => {
    starsRef.current = Array.from({ length: STARLIGHT_RUSH.maxActiveStars }, (_, slot) => ({
      id: 0,
      alive: false,
      kindIndex: 0,
      x: 0,
      y: 0,
      z: 0,
      speed: 8,
      scale: 1,
      slot,
      spin: 1,
    }))
    starlightStarsRuntime.stars = starsRef.current
    starlightStarsRuntime.groups.clear()
    spawnAccumulator = 0
    nextStarId = 1
  }, [sessionKey])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    const store = useStarlightRushStore.getState()
    const stars = starsRef.current
    starlightStarsRuntime.groups.clear()

    if (store.phase !== 'playing' || store.startedAt === null) {
      for (const star of stars) {
        star.alive = false
        const g = groupRefs.current[star.slot]
        if (g) g.visible = false
      }
      return
    }

    const elapsed = (performance.now() - store.startedAt - getTabPausedMs()) / 1000
    const phase = getDifficultyPhase(elapsed)
    const cfg = STARLIGHT_RUSH.phase[phase]
    let activeCount = 0
    for (const star of stars) if (star.alive) activeCount += 1

    spawnAccumulator += dt
    while (spawnAccumulator >= cfg.spawnInterval && activeCount < cfg.maxActive) {
      spawnAccumulator -= cfg.spawnInterval
      const slot = stars.find((s) => !s.alive)
      if (!slot) break
      activateStar(slot, phase, slot.slot)
      activeCount += 1
    }

    for (const star of stars) {
      const group = groupRefs.current[star.slot]
      if (!group) continue

      if (!star.alive) {
        group.visible = false
        continue
      }

      star.z += star.speed * dt
      if (star.z >= STARLIGHT_RUSH.starPassZ) {
        star.alive = false
        group.visible = false
        continue
      }

      const approach = MathUtils.clamp(
        (star.z - STARLIGHT_RUSH.starSpawnZ) /
          (STARLIGHT_RUSH.starPassZ - STARLIGHT_RUSH.starSpawnZ),
        0,
        1,
      )
      const visualScale = star.scale * (0.45 + approach * 0.95)

      group.visible = true
      group.position.set(star.x, star.y, star.z)
      group.scale.setScalar(visualScale)
      group.rotation.z += dt * star.spin
      group.rotation.y += dt * star.spin * 0.35
      group.userData.starId = star.id
      group.userData.alive = true
      group.userData.kindIndex = star.kindIndex

      tintStarGroup(group, STARLIGHT_RUSH.starKinds[star.kindIndex].color)
      starlightStarsRuntime.groups.set(star.id, group)
    }
  })

  return (
    <group>
      {Array.from({ length: STARLIGHT_RUSH.maxActiveStars }, (_, slot) => (
        <group
          key={slot}
          ref={(node) => {
            groupRefs.current[slot] = node
          }}
          visible={false}
          userData={{ starId: -1, alive: false, kindIndex: 0 }}
        >
          {/* 本体: 5尖の押し出し星 */}
          <mesh geometry={starGeo} castShadow={false}>
            <meshStandardMaterial
              color="#5ce0ff"
              emissive="#5ce0ff"
              emissiveIntensity={1.05}
              metalness={0.2}
              roughness={0.22}
              toneMapped={false}
            />
          </mesh>
          {/* 内側コア */}
          <mesh scale={0.42}>
            <sphereGeometry args={[STARLIGHT_RUSH.starHitRadius * 0.55, 10, 10]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.9}
              toneMapped={false}
            />
          </mesh>
          {/* ソフトグロー */}
          <mesh scale={1.55}>
            <sphereGeometry args={[STARLIGHT_RUSH.starHitRadius, 10, 10]} />
            <meshStandardMaterial
              color="#5ce0ff"
              emissive="#5ce0ff"
              emissiveIntensity={0.55}
              transparent
              opacity={0.28}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}
