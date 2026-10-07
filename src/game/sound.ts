let ctx: AudioContext | null = null

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    try {
      ctx = new AudioContext()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, duration: number, type: OscillatorType, volume: number, slideTo?: number) {
  const ac = audio()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  const t = ac.currentTime
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration)
  gain.gain.setValueAtTime(volume, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.connect(gain).connect(ac.destination)
  osc.start(t)
  osc.stop(t + duration)
}

const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]

export const sounds = {
  launch: () => tone(320, 0.25, 'sine', 0.15, 720),
  orbit: (n: number) => tone(PENTATONIC[n % PENTATONIC.length], 0.5, 'triangle', 0.12),
  sizzle: () => tone(220, 0.4, 'sawtooth', 0.06, 60),
  merge: () => tone(180, 0.3, 'square', 0.06, 420),
}
