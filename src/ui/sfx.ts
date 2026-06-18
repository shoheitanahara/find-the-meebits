type SfxKind = 'uiClick' | 'uiConfirm' | 'talk'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (audioContext) return audioContext

  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null

  audioContext = new Ctx()
  return audioContext
}

export async function unlockAudioIfNeeded() {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'running') return

  try {
    await ctx.resume()
  } catch {
    // Ignore: browser may block until a later gesture.
  }
}

function scheduleBeep(ctx: AudioContext, options: { frequency: number; durationMs: number; type: OscillatorType; gain: number }) {
  const now = ctx.currentTime
  const duration = options.durationMs / 1000

  const osc = ctx.createOscillator()
  osc.type = options.type
  osc.frequency.setValueAtTime(options.frequency, now)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(options.gain, now + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(now)
  osc.stop(now + duration + 0.01)
}

export function playSfx(kind: SfxKind) {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state !== 'running') return

  if (kind === 'uiClick') {
    scheduleBeep(ctx, { frequency: 620, durationMs: 28, type: 'triangle', gain: 0.05 })
    return
  }

  if (kind === 'uiConfirm') {
    scheduleBeep(ctx, { frequency: 520, durationMs: 30, type: 'triangle', gain: 0.055 })
    // tiny second tone for “confirm”
    scheduleBeep(ctx, { frequency: 780, durationMs: 26, type: 'triangle', gain: 0.04 })
    return
  }

  // talk
  scheduleBeep(ctx, { frequency: 420, durationMs: 24, type: 'sine', gain: 0.05 })
  scheduleBeep(ctx, { frequency: 680, durationMs: 24, type: 'sine', gain: 0.04 })
}

