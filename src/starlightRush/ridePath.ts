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
 * 到着駅は曲線の先に置き、船は rideEndProgress で手前停止。
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
  // 到着アプローチ（船はここより手前で止まる）
  new Vector3(0, 9, -118),
  new Vector3(0, 8, -128),
]

const RIDE_CURVE = new CatmullRomCurve3(CONTROL_POINTS, false, 'catmullrom', 0.45)

export const starlightRideRuntime = {
  progress: 0,
  position: new Vector3(0, 3, 36),
  quaternion: new Quaternion(),
  bank: 0,
  speed: STARLIGHT_RUSH.railSpeed.early,
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
export function sampleStarlightRide(progress: number, bankLerp = 1) {
  const end = STARLIGHT_RUSH.rideEndProgress
  const t = MathUtils.clamp(progress, 0, end)
  RIDE_CURVE.getPoint(t, TMP_POS)
  RIDE_CURVE.getTangent(t, TMP_TAN).normalize()

  const lookAhead = Math.min(end, t + 0.03)
  RIDE_CURVE.getTangent(lookAhead, TMP_AHEAD).normalize()
  const sway = TMP_TAN.clone().cross(TMP_AHEAD).y
  const targetBank = MathUtils.clamp(sway * 8, -STARLIGHT_RUSH.bankMax, STARLIGHT_RUSH.bankMax)
  starlightRideRuntime.bank = MathUtils.lerp(starlightRideRuntime.bank, targetBank, bankLerp)

  starlightRideRuntime.progress = t
  starlightRideRuntime.position.copy(TMP_POS)
  buildOrientation(TMP_TAN, starlightRideRuntime.bank, starlightRideRuntime.quaternion)
}

/**
 * ゲーム時間 0..1 → レール progress。
 * タイマーと同期し、終了直前まで動き続ける（駅で固まらない）。
 */
export function progressFromElapsed(elapsedSec: number): number {
  const duration = STARLIGHT_RUSH.gameDurationSec
  const u = MathUtils.clamp(elapsedSec / duration, 0, 1)
  // smoothstep で発進はゆっくり、終盤は到着感
  const eased = u * u * (3 - 2 * u)
  return eased * STARLIGHT_RUSH.rideEndProgress
}

export function resetStarlightRide() {
  starlightRideRuntime.bank = 0
  starlightRideRuntime.warpBoost = 0
  starlightRideRuntime.speed = STARLIGHT_RUSH.railSpeed.early
  sampleStarlightRide(0, 1)
}

/** playing 中にレール進行。countdown/idle は姿勢だけ更新。 */
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

  if (store.phase === 'countdown') {
    sampleStarlightRide(0, 1 - Math.exp(-dt * 4))
    starlightRideRuntime.warpBoost = 0
    return
  }

  // playing: 経過時間に同期
  if (store.startedAt === null) return

  const elapsed = (performance.now() - store.startedAt - getTabPausedMs()) / 1000
  const next = progressFromElapsed(elapsed)
  const prev = starlightRideRuntime.progress
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
