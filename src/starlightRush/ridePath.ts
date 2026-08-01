import { CatmullRomCurve3, MathUtils, Matrix4, Quaternion, Vector3 } from 'three'
import { STARLIGHT_RUSH } from './config'
import { getTabPausedMs } from '../systems/tabPause'
import { useStarlightRushStore } from './store'

const TMP_POS = new Vector3()
const TMP_TAN = new Vector3()
const TMP_RIGHT = new Vector3()
const TMP_UP = new Vector3()
const TMP_Z = new Vector3()
const TMP_AHEAD = new Vector3()
const WORLD_UP = new Vector3(0, 1, 0)
const BASIS = new Matrix4()

/**
 * 出発はオープンな宇宙（駅は後ろに見える）。
 * 到着駅は曲線の先に置き、船は dockEndProgress まで近づいて停止。
 */
const CONTROL_POINTS = [
  new Vector3(0, 3, 36),
  new Vector3(3, 3.5, 24),
  new Vector3(-5, 5, 12),
  new Vector3(7, 6.5, 0),
  new Vector3(-8, 4, -12),
  new Vector3(5, 3, -24),
  new Vector3(-4, 7, -36),
  new Vector3(8, 10, -48),
  new Vector3(-6, 6, -60),
  new Vector3(2, 4, -72),
  new Vector3(4, 2, -84),
  new Vector3(-2, 5, -96),
  new Vector3(0, 8, -108),
  // ゼニス接近: 左右に大きく振る（ストレート回避）
  new Vector3(16, 7, -118),
  new Vector3(-18, 9.5, -128),
  new Vector3(20, 6, -138),
  new Vector3(-17, 8.5, -148),
  new Vector3(14, 7, -158),
  new Vector3(-10, 8, -166),
  new Vector3(4, 7.5, -172),
  new Vector3(0, 7.5, -178),
]

const RIDE_CURVE = new CatmullRomCurve3(CONTROL_POINTS, false, 'catmullrom', 0.45)

export const starlightRideRuntime = {
  progress: 0,
  position: new Vector3(0, 3, 36),
  quaternion: new Quaternion(),
  bank: 0,
  speed: STARLIGHT_RUSH.railSpeed.early as number,
  warpBoost: 0,
}

export function getRidePoint(t: number, out: Vector3) {
  RIDE_CURVE.getPoint(MathUtils.clamp(t, 0, 1), out)
}

export function getRideTangent(t: number, out: Vector3) {
  RIDE_CURVE.getTangent(MathUtils.clamp(t, 0, 1), out).normalize()
}

/** ストーリー区間（UI キャプション用） */
export function getRideStoryBeat(progress: number): 'depart' | 'cruise' | 'approach' {
  const end = STARLIGHT_RUSH.rideEndProgress
  if (progress < end * 0.14) return 'depart'
  if (progress > end * 0.82) return 'approach'
  return 'cruise'
}

function buildOrientation(tangent: Vector3, bank: number, out: Quaternion) {
  TMP_Z.copy(tangent).negate()
  const upRef = Math.abs(tangent.y) > 0.92 ? new Vector3(0, 0, 1) : WORLD_UP
  TMP_RIGHT.crossVectors(upRef, TMP_Z).normalize()
  TMP_UP.crossVectors(TMP_Z, TMP_RIGHT).normalize()
  if (Math.abs(bank) > 1e-4) {
    TMP_RIGHT.applyAxisAngle(tangent, bank)
    TMP_UP.applyAxisAngle(tangent, bank)
  }
  BASIS.makeBasis(TMP_RIGHT, TMP_UP, TMP_Z)
  out.setFromRotationMatrix(BASIS)
}

/** progress から姿勢をサンプリングして runtime に書く。 */
export function sampleStarlightRide(
  progress: number,
  bankLerp = 1,
  maxProgress = STARLIGHT_RUSH.dockEndProgress,
) {
  const t = MathUtils.clamp(progress, 0, maxProgress)
  RIDE_CURVE.getPoint(t, TMP_POS)
  RIDE_CURVE.getTangent(t, TMP_TAN).normalize()

  const lookAhead = Math.min(maxProgress, t + 0.028)
  RIDE_CURVE.getTangent(lookAhead, TMP_AHEAD).normalize()
  const sway = TMP_TAN.clone().cross(TMP_AHEAD).y
  const late =
    t >= STARLIGHT_RUSH.rideEndProgress * STARLIGHT_RUSH.bankLateProgressRatio
  const bankCap = late ? STARLIGHT_RUSH.bankMaxLate : STARLIGHT_RUSH.bankMax
  const swayGain = late ? 12.5 : 8
  const targetBank = MathUtils.clamp(sway * swayGain, -bankCap, bankCap)
  starlightRideRuntime.bank = MathUtils.lerp(starlightRideRuntime.bank, targetBank, bankLerp)

  starlightRideRuntime.progress = t
  starlightRideRuntime.position.copy(TMP_POS)
  buildOrientation(TMP_TAN, starlightRideRuntime.bank, starlightRideRuntime.quaternion)
}

/**
 * 本編経過時間 0..duration → レール progress。
 * smoothstep だけだと終端付近の速度がほぼ 0 になり、ゼニス前で止まったように見える。
 * 線形寄りにして終盤（ワープ帯）も距離を稼ぎ続ける。
 */
export function progressFromElapsed(elapsedSec: number): number {
  const duration = STARLIGHT_RUSH.gameDurationSec
  const u = MathUtils.clamp(elapsedSec / duration, 0, 1)
  const smooth = u * u * (3 - 2 * u)
  // 終盤の減速を抑えつつ、発進は少しだけ滑らかに
  const eased = MathUtils.lerp(u, smooth, 0.28)
  const start = STARLIGHT_RUSH.launchEndProgress
  const end = STARLIGHT_RUSH.rideEndProgress
  return start + eased * (end - start)
}

/** 離陸 intro: 0 → launchEndProgress（ease-out） */
export function progressFromLaunchElapsed(elapsedSec: number): number {
  const duration = Math.max(0.01, STARLIGHT_RUSH.launchIntroSec)
  const u = MathUtils.clamp(elapsedSec / duration, 0, 1)
  const eased = 1 - (1 - u) * (1 - u)
  return eased * STARLIGHT_RUSH.launchEndProgress
}

/** ドック outro: rideEnd → dockEnd（ease-in-out） */
export function progressFromDockElapsed(elapsedSec: number): number {
  const duration = Math.max(0.01, STARLIGHT_RUSH.dockingSec)
  const u = MathUtils.clamp(elapsedSec / duration, 0, 1)
  const eased = u * u * (3 - 2 * u)
  const start = STARLIGHT_RUSH.rideEndProgress
  const end = STARLIGHT_RUSH.dockEndProgress
  return start + eased * (end - start)
}

export function resetStarlightRide() {
  starlightRideRuntime.bank = 0
  starlightRideRuntime.warpBoost = 0
  starlightRideRuntime.speed = STARLIGHT_RUSH.railSpeed.early
  sampleStarlightRide(0, 1)
}

/** フェーズに応じてレール進行。 */
export function advanceStarlightRide(delta: number) {
  const store = useStarlightRushStore.getState()
  const dt = Math.min(delta, 0.05)

  if (store.phase === 'idle' || store.phase === 'result') {
    // 出発駅の前で小さく漂う（駅の中には入らない）
    const t = ((Math.sin(performance.now() * 0.00035) + 1) * 0.5) * 0.04
    sampleStarlightRide(t, 1 - Math.exp(-dt * 2))
    starlightRideRuntime.warpBoost = 0
    return
  }

  if (store.startedAt === null) return
  const elapsed = (performance.now() - store.startedAt - getTabPausedMs()) / 1000
  const prev = starlightRideRuntime.progress

  if (store.phase === 'countdown') {
    const launch = STARLIGHT_RUSH.launchIntroSec
    let next: number
    if (elapsed < launch) {
      next = progressFromLaunchElapsed(elapsed)
    } else {
      next = STARLIGHT_RUSH.launchEndProgress
    }
    starlightRideRuntime.speed = Math.max(0.0001, (next - prev) / Math.max(dt, 1e-4))
    starlightRideRuntime.warpBoost = 0
    sampleStarlightRide(next, 1 - Math.exp(-dt * 3.5))
    return
  }

  if (store.phase === 'docking') {
    const next = progressFromDockElapsed(elapsed)
    starlightRideRuntime.speed = Math.max(0.0001, (next - prev) / Math.max(dt, 1e-4))
    starlightRideRuntime.warpBoost = MathUtils.lerp(starlightRideRuntime.warpBoost, 0, 1 - Math.exp(-dt * 4))
    sampleStarlightRide(next, 1 - Math.exp(-dt * 2.5))
    return
  }

  if (store.phase !== 'playing') return

  const next = progressFromElapsed(elapsed)
  starlightRideRuntime.speed = Math.max(0.0001, (next - prev) / Math.max(dt, 1e-4))

  if (store.remainingSec <= STARLIGHT_RUSH.warpRemainingSec) {
    starlightRideRuntime.warpBoost = MathUtils.clamp(
      1 - store.remainingSec / STARLIGHT_RUSH.warpRemainingSec,
      0,
      1,
    )
  } else {
    starlightRideRuntime.warpBoost = 0
  }

  sampleStarlightRide(next, 1 - Math.exp(-dt * 3.5))
}
