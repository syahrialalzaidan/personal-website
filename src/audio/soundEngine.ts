/**
 * Every sound on the site is synthesized with the Web Audio API — no audio files.
 * The context is created lazily on the first user gesture, as browsers require.
 */

export type SoundName = 'pock' | 'tick' | 'swell' | 'glass' | 'cup'

class SoundEngine {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null

  private ensureContext(): AudioContext {
    if (!this.context) {
      this.context = new AudioContext()
      this.master = this.context.createGain()
      this.master.gain.value = 0.55
      this.master.connect(this.context.destination)
      this.noise = this.createNoise(this.context)
    }
    if (this.context.state === 'suspended') void this.context.resume()
    return this.context
  }

  /** Creates or resumes the audio context; call from a user gesture so later sounds can play. */
  unlock() {
    this.ensureContext()
  }

  private createNoise(context: AudioContext): AudioBuffer {
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
    return buffer
  }

  play(name: SoundName, intensity = 1): void {
    const context = this.ensureContext()
    const now = context.currentTime
    switch (name) {
      case 'pock':
        this.tone(
          context,
          now,
          1150 * (0.9 + Math.random() * 0.2),
          0.05,
          0.5 * intensity,
          'triangle',
        )
        this.tone(context, now, 190, 0.07, 0.55 * intensity, 'sine')
        this.burst(context, now, 0.03, 2600, 0.35 * intensity)
        break
      case 'tick':
        this.tone(context, now, 2200, 0.025, 0.12, 'square')
        break
      case 'glass':
        this.tone(context, now, 1800, 0.18, 0.18 * intensity, 'sine')
        this.tone(context, now, 2710, 0.12, 0.1 * intensity, 'sine')
        this.burst(context, now, 0.05, 5200, 0.2 * intensity)
        break
      case 'cup':
        this.tone(context, now, 520, 0.12, 0.3, 'triangle')
        this.tone(context, now + 0.08, 780, 0.25, 0.25, 'triangle')
        break
      case 'swell':
        this.crowd(context, now)
        break
    }
  }

  private tone(
    context: AudioContext,
    start: number,
    frequency: number,
    duration: number,
    level: number,
    type: OscillatorType,
  ): void {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, start)
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.6, start + duration)
    gain.gain.setValueAtTime(level, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain).connect(this.master!)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.02)
  }

  private burst(
    context: AudioContext,
    start: number,
    duration: number,
    frequency: number,
    level: number,
  ) {
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    source.buffer = this.noise
    filter.type = 'bandpass'
    filter.frequency.value = frequency
    gain.gain.setValueAtTime(level, start)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    source.connect(filter).connect(gain).connect(this.master!)
    source.start(start)
    source.stop(start + duration + 0.02)
  }

  /** A filtered-noise crowd "ooh" that rises and settles. */
  private crowd(context: AudioContext, start: number) {
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    source.buffer = this.noise
    source.loop = true
    filter.type = 'bandpass'
    filter.Q.value = 0.8
    filter.frequency.setValueAtTime(420, start)
    filter.frequency.linearRampToValueAtTime(900, start + 0.6)
    filter.frequency.linearRampToValueAtTime(600, start + 1.8)
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.32, start + 0.5)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.9)
    source.connect(filter).connect(gain).connect(this.master!)
    source.start(start)
    source.stop(start + 2)
  }
}

export const soundEngine = new SoundEngine()
