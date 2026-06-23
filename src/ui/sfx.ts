type SfxKind =
  | 'uiClick'
  | 'uiConfirm'
  | 'talk'
  | 'clear'
  | 'footstep'
  | 'timeUp'
  | 'targetFound'
  | 'unlock'
  | 'timerStart'

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (audioContext) return audioContext

  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null

  audioContext = new Ctx()
  return audioContext
}

export function getSharedAudioContext(): AudioContext | null {
  return getAudioContext()
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

function scheduleBeep(
  ctx: AudioContext,
  options: { frequency: number; durationMs: number; type: OscillatorType; gain: number; startTime?: number },
) {
  const startTime = options.startTime ?? ctx.currentTime
  const duration = options.durationMs / 1000

  const osc = ctx.createOscillator()
  osc.type = options.type
  osc.frequency.setValueAtTime(options.frequency, startTime)

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(options.gain, startTime + 0.006)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)

  osc.start(startTime)
  osc.stop(startTime + duration + 0.01)
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

function playFootstepTap(ctx: AudioContext) {
  const now = ctx.currentTime
  const duration = 0.055
  const pitch = 0.88 + Math.random() * 0.22
  const volume = 3

  const buffer = getFootstepNoiseBuffer(ctx)

  const noise = ctx.createBufferSource()
  noise.buffer = buffer

  const filter = ctx.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = (220 + Math.random() * 120) * pitch
  filter.Q.value = 0.8

  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(0.14 * volume, now + 0.004)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  const thump = ctx.createOscillator()
  thump.type = 'sine'
  thump.frequency.setValueAtTime(95 * pitch, now)
  thump.frequency.exponentialRampToValueAtTime(55 * pitch, now + duration)

  const thumpGain = ctx.createGain()
  thumpGain.gain.setValueAtTime(0, now)
  thumpGain.gain.linearRampToValueAtTime(0.1 * volume, now + 0.003)
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  noise.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  thump.connect(thumpGain)
  thumpGain.connect(ctx.destination)

  noise.start(now)
  thump.start(now)
  noise.stop(now + duration + 0.01)
  thump.stop(now + duration + 0.01)
}

let footstepNoiseBuffer: AudioBuffer | null = null

function getFootstepNoiseBuffer(ctx: AudioContext) {
  const duration = 0.055

  if (footstepNoiseBuffer && footstepNoiseBuffer.sampleRate === ctx.sampleRate) {
    return footstepNoiseBuffer
  }

  const noiseLength = Math.max(1, Math.floor(ctx.sampleRate * duration))
  const buffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < noiseLength; i += 1) {
    data[i] = Math.random() * 2 - 1
  }

  footstepNoiseBuffer = buffer
  return buffer
}

function playClearFanfare(ctx: AudioContext) {
  const now = ctx.currentTime
  const notes = [
    { frequency: 523.25, offsetMs: 0, durationMs: 140, gain: 0.07 },
    { frequency: 659.25, offsetMs: 110, durationMs: 140, gain: 0.075 },
    { frequency: 783.99, offsetMs: 220, durationMs: 160, gain: 0.08 },
    { frequency: 1046.5, offsetMs: 340, durationMs: 280, gain: 0.085 },
  ]

  for (const note of notes) {
    scheduleBeep(ctx, {
      frequency: note.frequency,
      durationMs: note.durationMs,
      type: 'triangle',
      gain: note.gain,
      startTime: now + note.offsetMs / 1000,
    })
  }
}

function playTimeUpFail(ctx: AudioContext) {
  const now = ctx.currentTime
  const notes = [
    { frequency: 392.0, offsetMs: 0, durationMs: 200, gain: 0.08 },
    { frequency: 311.13, offsetMs: 160, durationMs: 220, gain: 0.085 },
    { frequency: 261.63, offsetMs: 340, durationMs: 280, gain: 0.09 },
    { frequency: 196.0, offsetMs: 520, durationMs: 420, gain: 0.08 },
  ]

  for (const note of notes) {
    scheduleBeep(ctx, {
      frequency: note.frequency,
      durationMs: note.durationMs,
      type: 'triangle',
      gain: note.gain,
      startTime: now + note.offsetMs / 1000,
    })
  }

  const buzz = ctx.createOscillator()
  buzz.type = 'sawtooth'
  buzz.frequency.setValueAtTime(130, now + 0.45)
  buzz.frequency.exponentialRampToValueAtTime(72, now + 1.15)

  const buzzFilter = ctx.createBiquadFilter()
  buzzFilter.type = 'lowpass'
  buzzFilter.frequency.value = 280

  const buzzGain = ctx.createGain()
  buzzGain.gain.setValueAtTime(0, now + 0.45)
  buzzGain.gain.linearRampToValueAtTime(0.045, now + 0.5)
  buzzGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2)

  buzz.connect(buzzFilter)
  buzzFilter.connect(buzzGain)
  buzzGain.connect(ctx.destination)
  buzz.start(now + 0.45)
  buzz.stop(now + 1.25)
}

function playTimerStart(ctx: AudioContext) {
  const now = ctx.currentTime
  scheduleBeep(ctx, {
    frequency: 523.25,
    durationMs: 55,
    type: 'triangle',
    gain: 0.065,
    startTime: now,
  })
  scheduleBeep(ctx, {
    frequency: 523.25,
    durationMs: 55,
    type: 'triangle',
    gain: 0.065,
    startTime: now + 0.1,
  })
  scheduleBeep(ctx, {
    frequency: 880,
    durationMs: 220,
    type: 'triangle',
    gain: 0.1,
    startTime: now + 0.2,
  })
}

function playTargetFound(ctx: AudioContext) {
  const now = ctx.currentTime
  scheduleBeep(ctx, {
    frequency: 523.25,
    durationMs: 100,
    type: 'sine',
    gain: 0.07,
    startTime: now,
  })
  scheduleBeep(ctx, {
    frequency: 659.25,
    durationMs: 130,
    type: 'sine',
    gain: 0.075,
    startTime: now + 0.07,
  })
  scheduleBeep(ctx, {
    frequency: 783.99,
    durationMs: 160,
    type: 'triangle',
    gain: 0.065,
    startTime: now + 0.14,
  })
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

  if (kind === 'clear') {
    playClearFanfare(ctx)
    return
  }

  if (kind === 'footstep') {
    playFootstepTap(ctx)
    return
  }

  if (kind === 'timeUp') {
    playTimeUpFail(ctx)
    return
  }

  if (kind === 'targetFound') {
    playTargetFound(ctx)
    return
  }

  if (kind === 'timerStart') {
    playTimerStart(ctx)
    return
  }

  if (kind === 'unlock') {
    playUnlockFanfare(ctx)
    return
  }

  playTalkMurmur(ctx)
}

function playUnlockFanfare(ctx: AudioContext) {
  const now = ctx.currentTime
  const notes = [
    { frequency: 392.0, offsetMs: 0, durationMs: 120, gain: 0.06 },
    { frequency: 523.25, offsetMs: 90, durationMs: 130, gain: 0.065 },
    { frequency: 659.25, offsetMs: 180, durationMs: 150, gain: 0.07 },
    { frequency: 783.99, offsetMs: 280, durationMs: 180, gain: 0.075 },
    { frequency: 987.77, offsetMs: 400, durationMs: 320, gain: 0.08 },
  ]

  for (const note of notes) {
    scheduleBeep(ctx, {
      frequency: note.frequency,
      durationMs: note.durationMs,
      type: 'triangle',
      gain: note.gain,
      startTime: now + note.offsetMs / 1000,
    })
  }
}
