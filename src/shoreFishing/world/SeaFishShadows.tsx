import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, MathUtils, type MeshBasicMaterial } from 'three'
import {
  getFishKind,
  islandNormRadius,
  pickFishKindId,
  randomShadowSpot,
  shadowLifetimeSecFor,
  SHORE_FISHING,
  type FishKindId,
  type FishShadowSize,
} from '../config'
import { useShoreFishingStore, type CastPhase } from '../store'

type ShadowRuntime = {
  homeX: number
  homeZ: number
  yaw: number
  wobbleAmp: number
  speedX: number
  speedZ: number
  phase: number
  fishId: FishKindId
  size: FishShadowSize
  alive: boolean
  bornAt: number
  expireAt: number
  respawnAt: number
  fade: number
}

type HunterState = {
  index: number | null
  fromX: number
  fromZ: number
  approachStart: number
  approachEnd: number
  lastNibble: number
  tap: number
  fleeX: number
  fleeZ: number
  fleeUntil: number
  x: number
  z: number
  yaw: number
  holdOx: number
  holdOz: number
  claimed: boolean
}

const SIZE_SCALE: Record<FishShadowSize, number> = {
  tiny: 0.48,
  small: 0.7,
  medium: 1,
  large: 1.35,
  huge: 1.85,
}

const SHADOW_Y = 0.055

const HUNT_PHASES: ReadonlySet<CastPhase> = new Set([
  'approach',
  'nibble',
  'bite',
  'miss',
])

function randRange(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function spawnShadow(
  now: number,
  opts?: {
    slotIndex?: number
    stagger?: number
    avoidFishId?: FishKindId
    avoidX?: number
    avoidZ?: number
  },
): ShadowRuntime {
  let fishId = pickFishKindId()
  let spot =
    opts?.slotIndex !== undefined
      ? randomShadowSpot(Math.random, {
          slotIndex: opts.slotIndex,
          slotCount: SHORE_FISHING.shadowCount,
        })
      : randomShadowSpot()

  // 釣った直後など、同じ魚・同じ場所を避ける
  for (let attempt = 0; attempt < 10; attempt++) {
    const sameFish = opts?.avoidFishId != null && fishId === opts.avoidFishId
    const near =
      opts?.avoidX != null &&
      opts?.avoidZ != null &&
      Math.hypot(spot.x - opts.avoidX, spot.z - opts.avoidZ) < 4.5
    if (!sameFish && !near) break
    fishId = pickFishKindId()
    spot = randomShadowSpot()
  }

  const fish = getFishKind(fishId)
  const life = shadowLifetimeSecFor(fishId)
  const bornAt = now + (opts?.stagger ?? 0)
  return {
    homeX: spot.x,
    homeZ: spot.z,
    yaw: spot.yaw,
    wobbleAmp: 0.14 + Math.random() * 0.1,
    speedX: 0.28 + Math.random() * 0.3,
    speedZ: 0.22 + Math.random() * 0.28,
    phase: Math.random() * Math.PI * 2,
    fishId,
    size: fish.shadow,
    alive: true,
    bornAt,
    expireAt: bornAt + life * 1000,
    respawnAt: 0,
    fade: 0,
  }
}

/** 釣果／逃し後：その影を消し、別種・別地点で出し直す */
function retireHunterShadow(
  shadows: ShadowRuntime[],
  index: number,
  now: number,
): void {
  const old = shadows[index]
  if (!old) return
  shadows[index] = spawnShadow(now, {
    avoidFishId: old.fishId,
    avoidX: old.homeX,
    avoidZ: old.homeZ,
    stagger: 400,
  })
  shadows[index]!.fade = 0
}

/** ゲーム開始用：全方位にばらけつつ種類も引き直す */
function createShadowPopulation(now: number): ShadowRuntime[] {
  return Array.from({ length: SHORE_FISHING.shadowCount }, (_, i) =>
    spawnShadow(now, {
      slotIndex: i,
      stagger: (i / SHORE_FISHING.shadowCount) * 1800,
    }),
  )
}

function ambientXZ(s: ShadowRuntime, t: number): { x: number; z: number; yaw: number } {
  const x = s.homeX + Math.sin(t * s.speedX + s.phase) * s.wobbleAmp
  const z = s.homeZ + Math.cos(t * s.speedZ + s.phase * 0.8) * s.wobbleAmp * 0.85
  const yaw =
    s.yaw + Math.sin(t * 0.45 + s.phase) * 0.2 + Math.cos(t * s.speedZ + s.phase) * 0.1
  return { x, z, yaw }
}

function setGroupFade(g: Group, fade: number, size: FishShadowSize) {
  const sc = SIZE_SCALE[size] * (0.7 + fade * 0.3)
  g.scale.setScalar(sc)
  g.traverse((obj) => {
    const mesh = obj as { material?: MeshBasicMaterial | MeshBasicMaterial[] }
    const mats = mesh.material
      ? Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]
      : []
    for (const m of mats) {
      if (!m || !('opacity' in m)) continue
      const base = (m.userData.baseOpacity as number | undefined) ?? m.opacity
      m.userData.baseOpacity = base
      m.transparent = true
      m.opacity = base * fade
      m.depthWrite = false
    }
  })
}

/** 丸影と縦長の中間くらいの魚影シルエット */
function FishShadowSilhouette() {
  return (
    <group>
      {/* 胴体：やや縦長の楕円 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0.04]}
        scale={[0.48, 0.95, 1]}
        renderOrder={4}
      >
        <circleGeometry args={[0.52, 20]} />
        <meshBasicMaterial color="#021018" transparent opacity={0.72} depthWrite={false} />
      </mesh>
      {/* 尾を少しだけ足す */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, -0.52]}
        scale={[0.34, 0.3, 1]}
        renderOrder={4}
      >
        <circleGeometry args={[0.36, 12]} />
        <meshBasicMaterial color="#021018" transparent opacity={0.55} depthWrite={false} />
      </mesh>
    </group>
  )
}

/** 孤島まわりの海に浮かぶ魚影。近い影が餌に反応し、寿命で入れ替わる。 */
export function SeaFishShadows() {
  const refs = useRef<(Group | null)[]>([])
  const shadowsRef = useRef<ShadowRuntime[] | null>(null)
  const hunterRef = useRef<HunterState>({
    index: null,
    fromX: 0,
    fromZ: 0,
    approachStart: 0,
    approachEnd: 0,
    lastNibble: 0,
    tap: 0,
    fleeX: 0,
    fleeZ: 0,
    fleeUntil: 0,
    x: 0,
    z: 0,
    yaw: 0,
    holdOx: 0.42,
    holdOz: 0.18,
    claimed: false,
  })
  const prevPhaseRef = useRef<CastPhase>('ready')
  const sessionKey = useShoreFishingStore((s) => s.sessionKey)

  // マウント時＆ゲーム開始（sessionKey）ごとに位置・種類を引き直す
  useEffect(() => {
    shadowsRef.current = createShadowPopulation(performance.now())
    hunterRef.current.index = null
    hunterRef.current.claimed = false
    prevPhaseRef.current = 'ready'
  }, [sessionKey])

  if (!shadowsRef.current) {
    shadowsRef.current = createShadowPopulation(performance.now())
  }

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const now = performance.now()
    const fadeSec = SHORE_FISHING.shadowFadeSec
    const shadows = shadowsRef.current!
    const store = useShoreFishingStore.getState()
    const { castPhase, bobberLand, pendingFishId, nibbleIndex } = store
    const hunter = hunterRef.current
    const prevPhase = prevPhaseRef.current
    const reactR = SHORE_FISHING.shadowReactRadius

    const wantHunt = Boolean(bobberLand) && HUNT_PHASES.has(castPhase)

    for (let i = 0; i < shadows.length; i++) {
      const s = shadows[i]!
      const isBusy = hunter.index === i && wantHunt

      if (s.alive) {
        if (!isBusy && now >= s.expireAt) {
          s.alive = false
          s.respawnAt =
            now +
            randRange(
              SHORE_FISHING.shadowRespawnGapSec.min,
              SHORE_FISHING.shadowRespawnGapSec.max,
            ) *
              1000
        } else if (isBusy && now >= s.expireAt - 200) {
          s.expireAt = now + 2500
        }
      } else if (now >= s.respawnAt) {
        // 位置・魚種ともランダムに再抽選（固定スロットに戻さない）
        shadows[i] = spawnShadow(now)
      }

      const cur = shadows[i]!
      if (cur.alive) {
        const inT = MathUtils.clamp((now - cur.bornAt) / (fadeSec * 1000), 0, 1)
        const outT =
          now > cur.expireAt - fadeSec * 1000 && !isBusy
            ? MathUtils.clamp((cur.expireAt - now) / (fadeSec * 1000), 0, 1)
            : 1
        cur.fade = Math.min(inT, outT)
      } else {
        cur.fade = Math.max(0, cur.fade - delta / fadeSec)
      }
    }

    // 着水待機中：近くに影が現れたら反応（影なしでは終わらない）
    if (
      castPhase === 'approach' &&
      bobberLand &&
      !pendingFishId &&
      hunter.index === null
    ) {
      let best = -1
      let bestDist = Number.POSITIVE_INFINITY
      shadows.forEach((s, i) => {
        if (!s.alive || s.fade < 0.35) return
        const amb = ambientXZ(s, t)
        const dist = Math.hypot(amb.x - bobberLand.x, amb.z - bobberLand.z)
        if (dist <= reactR && dist < bestDist) {
          bestDist = dist
          best = i
        }
      })

      if (best >= 0) {
        const s = shadows[best]!
        const amb = ambientXZ(s, t)
        hunter.index = best
        hunter.fromX = amb.x
        hunter.fromZ = amb.z
        hunter.x = amb.x
        hunter.z = amb.z
        hunter.yaw = amb.yaw
        hunter.approachStart = now
        hunter.lastNibble = 0
        hunter.tap = 0
        hunter.claimed = true
        // 浮きより沖（外側）で待機し、島側（内側）へ向かってつつく
        const br = Math.hypot(bobberLand.x, bobberLand.z) || 1
        hunter.holdOx = (bobberLand.x / br) * 0.62
        hunter.holdOz = (bobberLand.z / br) * 0.62
        store.claimShadowBite(s.fishId)
        // claim 後の nextEventAt を寄せ時間に使う
        const claimed = useShoreFishingStore.getState()
        hunter.approachEnd = claimed.nextEventAt ?? now + 1500
        s.expireAt = Math.max(s.expireAt, now + 12000)
      }
    }

    if (castPhase === 'miss' && prevPhase !== 'miss' && hunter.index !== null && bobberLand) {
      const dx = hunter.x - bobberLand.x
      const dz = hunter.z - bobberLand.z
      const len = Math.hypot(dx, dz) || 1
      hunter.fleeX = dx / len
      hunter.fleeZ = dz / len
      hunter.fleeUntil = now + 700
      hunter.tap = 0
    }

    // 釣れたら担当影を消費して別場所・別種でスポーン（同じ影が残らない）
    if (castPhase === 'reeling' && prevPhase !== 'reeling' && hunter.index !== null) {
      retireHunterShadow(shadows, hunter.index, now)
      hunter.index = null
      hunter.claimed = false
    }

    // 逃したあとも逃走演出のあと入れ替え
    if (
      castPhase === 'miss' &&
      hunter.index !== null &&
      hunter.fleeUntil > 0 &&
      now >= hunter.fleeUntil
    ) {
      retireHunterShadow(shadows, hunter.index, now)
      hunter.index = null
      hunter.claimed = false
    }

    if (
      castPhase === 'caught' ||
      castPhase === 'ready' ||
      castPhase === 'casting' ||
      castPhase === 'cooldown'
    ) {
      hunter.index = null
      hunter.claimed = false
    }

    if (castPhase === 'nibble' && nibbleIndex !== hunter.lastNibble && hunter.index !== null) {
      hunter.lastNibble = nibbleIndex
      hunter.tap = 1
    }
    if (castPhase === 'bite' && prevPhase !== 'bite') {
      hunter.tap = 0
    }
    hunter.tap = Math.max(0, hunter.tap - delta * 3.2)

    prevPhaseRef.current = castPhase

    shadows.forEach((s, i) => {
      const g = refs.current[i]
      if (!g) return

      setGroupFade(g, s.fade, s.size)
      if (s.fade <= 0.02 && !(wantHunt && hunter.index === i)) {
        g.visible = false
        return
      }

      const isHunter = wantHunt && hunter.index === i && bobberLand && pendingFishId
      if (!isHunter || !bobberLand) {
        const amb = ambientXZ(s, t)
        g.position.set(amb.x, SHADOW_Y, amb.z)
        g.rotation.y = amb.yaw
        g.visible = s.fade > 0.02
        return
      }

      const bx = bobberLand.x
      const bz = bobberLand.z

      if (castPhase === 'approach') {
        const span = Math.max(200, hunter.approachEnd - hunter.approachStart)
        const u = MathUtils.clamp((now - hunter.approachStart) / span, 0, 1)
        const ease = u * u * (3 - 2 * u)
        hunter.x = MathUtils.lerp(hunter.fromX, bx + hunter.holdOx, ease)
        hunter.z = MathUtils.lerp(hunter.fromZ, bz + hunter.holdOz, ease)
        // 内側（浮き／島）を向く
        hunter.yaw = Math.atan2(bx - hunter.x, bz - hunter.z)
      } else if (castPhase === 'nibble') {
        // 外側でゆらゆら → タップで内側（浮き）へちょんっと寄る
        const side = Math.sin(t * 2.1 + i) * 0.05
        const perpX = -hunter.holdOz
        const perpZ = hunter.holdOx
        const plen = Math.hypot(perpX, perpZ) || 1
        const baseX = bx + hunter.holdOx + (perpX / plen) * side
        const baseZ = bz + hunter.holdOz + (perpZ / plen) * side
        const tapPull = hunter.tap * hunter.tap
        hunter.x = MathUtils.lerp(baseX, bx, tapPull * 0.82)
        hunter.z = MathUtils.lerp(baseZ, bz, tapPull * 0.82)
        hunter.yaw = Math.atan2(bx - hunter.x, bz - hunter.z)
      } else if (castPhase === 'bite') {
        // 沖側に寄りつつ暴れる
        const thrash = 0.08 + Math.sin(t * 16) * 0.05
        hunter.x = bx + hunter.holdOx * 0.35 + Math.cos(t * 11) * thrash
        hunter.z = bz + hunter.holdOz * 0.35 + Math.sin(t * 13) * thrash
        hunter.yaw = Math.atan2(bx - hunter.x, bz - hunter.z)
      } else if (castPhase === 'miss') {
        const fleeT = MathUtils.clamp(1 - (hunter.fleeUntil - now) / 700, 0, 1)
        const dist = 1.2 + fleeT * 3.5
        hunter.x = bx + hunter.fleeX * dist
        hunter.z = bz + hunter.fleeZ * dist
        hunter.yaw = Math.atan2(hunter.fleeX, hunter.fleeZ)
      }

      let hx = hunter.x
      let hz = hunter.z
      const norm = islandNormRadius(hx, hz)
      if (norm < 1.05) {
        const push = 1.08 / Math.max(norm, 0.01)
        hx *= push
        hz *= push
        hunter.x = hx
        hunter.z = hz
      }

      const dipY = castPhase === 'nibble' && hunter.tap > 0.2 ? 0.03 : SHADOW_Y
      const biteY = castPhase === 'bite' ? 0.025 : dipY
      g.position.set(hx, biteY, hz)
      g.rotation.y = hunter.yaw
      g.visible = castPhase !== 'reeling' && castPhase !== 'caught'
      setGroupFade(g, Math.max(s.fade, 0.9), s.size)
    })
  })

  return (
    <group>
      {Array.from({ length: SHORE_FISHING.shadowCount }, (_, i) => (
        <group
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          renderOrder={4}
        >
          <FishShadowSilhouette />
        </group>
      ))}
    </group>
  )
}
