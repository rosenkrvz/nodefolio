/**
 * Sound synthesis presets for tactile UI micro-interactions.
 * All sounds are synthesized programmatically using the Web Audio API.
 * No external audio files, zero network latency, zero bundle bloat.
 */

export type SoundType =
  | 'click'
  | 'secondaryClick'
  | 'hover'
  | 'open'
  | 'close'
  | 'connect'
  | 'disconnect'
  | 'select'
  | 'zoom'
  | 'success'
  | 'error';

/**
 * Synthesizes a sound using Web Audio API nodes.
 * @param ctx The shared AudioContext
 * @param destination The master gain node or destination
 * @param type The sound preset to synthesize
 */
export function synthesizeSound(
  ctx: AudioContext,
  destination: AudioNode,
  type: SoundType
): void {
  const now = ctx.currentTime;

  switch (type) {
    case 'click': {
      // Primary Click: Short tactile mechanical switch impulse (approx 45ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(860, now);
      filter.Q.setValueAtTime(3.0, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.046);
      break;
    }

    case 'secondaryClick': {
      // Secondary Click: Softer mechanical tick for toggles and tabs (approx 35ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1250, now);
      filter.Q.setValueAtTime(2.5, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.035);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.036);
      break;
    }

    case 'hover': {
      // Hover: Ultra-short high-frequency mechanical tick, very quiet (approx 16ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.016);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.016);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.017);
      break;
    }

    case 'open': {
      // Open / Expand: Layered tactile expansion with subtle frequency lift (approx 85ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.07);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.28, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.086);
      break;
    }

    case 'close': {
      // Close: Soft inverse version of the open sound, descending (approx 75ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.065);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.076);
      break;
    }

    case 'connect': {
      // Node Connect: Tactile mechanical lock + subtle tonal confirmation (approx 120ms)
      // Layer 1: Crisp click impulse
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1150, now);
      osc1.frequency.exponentialRampToValueAtTime(450, now + 0.035);
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.3, now + 0.002);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      osc1.connect(gain1);
      gain1.connect(destination);
      osc1.start(now);
      osc1.stop(now + 0.036);

      // Layer 2: Warm resonant harmonic confirmation
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(784, now + 0.015); // G5
      gain2.gain.setValueAtTime(0.001, now + 0.015);
      gain2.gain.linearRampToValueAtTime(0.2, now + 0.025);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      osc2.connect(gain2);
      gain2.connect(destination);
      osc2.start(now + 0.015);
      osc2.stop(now + 0.121);
      break;
    }

    case 'disconnect': {
      // Node Disconnect: Subtle mechanical release snap (approx 85ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.075);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now);
      osc.stop(now + 0.081);
      break;
    }

    case 'select': {
      // Node Select: Ultra-subtle confirmation tick (approx 25ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(940, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.022);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.024);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now);
      osc.stop(now + 0.025);
      break;
    }

    case 'zoom': {
      // Zoom Threshold: Discreet high-end detent notch tick (approx 28ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1550, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.025);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now);
      osc.stop(now + 0.028);
      break;
    }

    case 'success': {
      // Success: Subtle two-tone computational confirmation (approx 150ms)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.2, now + 0.006);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
      osc1.connect(gain1);
      gain1.connect(destination);
      osc1.start(now);
      osc1.stop(now + 0.071);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.06); // A5
      gain2.gain.setValueAtTime(0.001, now + 0.06);
      gain2.gain.linearRampToValueAtTime(0.22, now + 0.068);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
      osc2.connect(gain2);
      gain2.connect(destination);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.151);
      break;
    }

    case 'error': {
      // Error: Restrained low tonal click / muted confirmation (approx 75ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(210, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.065);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
      osc.connect(gain);
      gain.connect(destination);
      osc.start(now);
      osc.stop(now + 0.076);
      break;
    }
  }
}
