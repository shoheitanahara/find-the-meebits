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

type VocalSyllable = {
  offsetMs: number
  durationMs: number
  pitchHz: number
  formantHz: number
}

function scheduleVocalSyllable(
  ctx: AudioContext,
  startTime: number,
  syllable: VocalSyllable,
  masterGain: GainNode,
) {
  const duration = syllable.durationMs / 1000
  const endTime = startTime + duration

  const envelope = ctx.createGain()
  envelope.gain.setValueAtTime(0, startTime)
  envelope.gain.linearRampToValueAtTime(1, startTime + 0.014)
  envelope.gain.exponentialRampToValueAtTime(0.0001, endTime)
  envelope.connect(masterGain)

  const voice = ctx.createOscillator()
  voice.type = 'triangle'
  voice.frequency.setValueAtTime(syllable.pitchHz, startTime)
  voice.frequency.exponentialRampToValueAtTime(syllable.pitchHz * 1.06, startTime + duration * 0.55)

  const voiceGain = ctx.createGain()
  voiceGain.gain.value = 0.42

  const voiceFilter = ctx.createBiquadFilter()
  voiceFilter.type = 'lowpass'
  voiceFilter.frequency.setValueAtTime(780, startTime)
  voiceFilter.Q.value = 0.7

  voice.connect(voiceGain)
  voiceGain.connect(voiceFilter)
  voiceFilter.connect(envelope)

  const formant = ctx.createOscillator()
  formant.type = 'sine'
  formant.frequency.setValueAtTime(syllable.formantHz, startTime)
  formant.frequency.exponentialRampToValueAtTime(syllable.formantHz * 0.94, endTime)

  const formantGain = ctx.createGain()
  formantGain.gain.value = 0.16
  formant.connect(formantGain)
  formantGain.connect(envelope)

  const noiseLength = Math.max(1, Math.floor(ctx.sampleRate * Math.min(duration, 0.04)))
  const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate)
  const noiseData = noiseBuffer.getChannelData(0)
  for (let i = 0; i < noiseLength; i += 1) {
    noiseData[i] = Math.random() * 2 - 1
  }

  const noise = ctx.createBufferSource()
  noise.buffer = noiseBuffer

  const noiseFilter = ctx.createBiquadFilter()
  noiseFilter.type = 'bandpass'
  noiseFilter.frequency.value = 2400
  noiseFilter.Q.value = 1.1

  const noiseGain = ctx.createGain()
  noiseGain.gain.setValueAtTime(0.12, startTime)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03)

  noise.connect(noiseFilter)
  noiseFilter.connect(noiseGain)
  noiseGain.connect(envelope)

  voice.start(startTime)
  formant.start(startTime)
  noise.start(startTime)
  voice.stop(endTime + 0.02)
  formant.stop(endTime + 0.02)
  noise.stop(endTime + 0.02)
}

/** 本物の会話ほどではないが、短い「むにゃっ」系の声に近い合成音 */
function playTalkMurmur(ctx: AudioContext) {
  const now = ctx.currentTime
  const pitchJitter = 0.92 + Math.random() * 0.14

  const master = ctx.createGain()
  master.gain.value = 0.11
  master.connect(ctx.destination)

  const syllables: VocalSyllable[] = [
    { offsetMs: 0, durationMs: 78, pitchHz: 165 * pitchJitter, formantHz: 920 },
    { offsetMs: 88, durationMs: 72, pitchHz: 188 * pitchJitter, formantHz: 1080 },
    { offsetMs: 168, durationMs: 84, pitchHz: 152 * pitchJitter, formantHz: 860 },
  ]

  for (const syllable of syllables) {
    scheduleVocalSyllable(ctx, now + syllable.offsetMs / 1000, syllable, master)
  }
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
    scheduleBeep(ctx, { frequency: 780, durationMs: 26, type: 'triangle', gain: 0.04 })
    return
  }

  playTalkMurmur(ctx)
}
