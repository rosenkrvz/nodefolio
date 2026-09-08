/**
 * Sound synthesis presets for tactile UI micro-interactions.
 * Programmatically modeled after premium lubricated mechanical keyboard switches
 * with thick PBT keycaps: deep, dampened "thock", soft transients, and zero harshness.
 * All sounds are synthesized programmatically using the Web Audio API.
 * Zero external audio files, zero network requests, zero bundle bloat.
 */

export type SoundType =
  | 'click'           // Primary CTA deep mechanical "THOCK"
  | 'secondaryClick'  // Secondary lighter mechanical "tock"
  | 'nav'             // Quiet, restrained navigation mechanical tap
  | 'nodeSelect'      // Node selection mechanical bottom-out
  | 'open'            // Modal / node expansion: thock with subtle micro-resonance
  | 'close'           // Dismiss / back: damped mechanical key release
  | 'toggle'          // Toggles and small switches: ultra-subtle mechanical tick
  | 'connect'         // Connection latch: firm tactile switch lock
  | 'disconnect'      // Connection unlatch: mechanical release
  | 'select'          // General select: clean physical switch tap
  | 'hover'           // Micro-tap: barely audible subtle contact
  | 'zoom'            // Zoom detent notch tick
  | 'success'         // Two-step mechanical confirmation thock
  | 'error';          // Damped dull bottom-out thud

// Noise buffer cache to avoid GC allocations during rapid interactions
let cachedNoiseBuffer: AudioBuffer | null = null;

function getOrCreateNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (!cachedNoiseBuffer || cachedNoiseBuffer.sampleRate !== ctx.sampleRate) {
    const bufferSize = Math.floor(ctx.sampleRate * 0.05); // 50ms of pink/white noise
    cachedNoiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = cachedNoiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filtering for warm, non-harsh impact character
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
    }
  }
  return cachedNoiseBuffer;
}

/**
 * Micro-randomization helper to provide subtle variations in pitch, transient,
 * and filter cutoff so repeated clicking sounds authentically physical.
 */
function getJitter(amount = 0.04): number {
  return 1 + (Math.random() - 0.5) * 2 * amount;
}

/**
 * Synthesizes a physical mechanical thock using Web Audio API nodes.
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
  const jitter = getJitter(0.04);
  const volJitter = getJitter(0.03);

  switch (type) {
    case 'click': {
      // PRIMARY CTA: Deep, weighty, lubricated mechanical "THOCK"
      // Simulated: 1) Initial soft plastic stem impact transient
      //            2) Low-mid PBT keycap body cavity resonance (~175Hz -> ~115Hz)
      //            3) Sub-body solid weight (~95Hz)

      // Layer 1: Soft transient impact burst (2.5ms)
      const noise = ctx.createBufferSource();
      noise.buffer = getOrCreateNoiseBuffer(ctx);
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(620 * jitter, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.24 * volJitter, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.0035);
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(destination);
      noise.start(now);
      noise.stop(now + 0.005);

      // Layer 2: Main resonant thock body (sine/triangle blend)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const bodyFilter = ctx.createBiquadFilter();

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(750 * jitter, now);
      bodyFilter.Q.setValueAtTime(2.2, now);

      osc.type = 'triangle';
      const baseFreq = 180 * jitter;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.62, now + 0.042);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.42 * volJitter, now + 0.002);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.048);

      osc.connect(bodyFilter);
      bodyFilter.connect(oscGain);
      oscGain.connect(destination);

      // Layer 3: Solid sub-body thump
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(95 * jitter, now);
      sub.frequency.exponentialRampToValueAtTime(60, now + 0.035);
      subGain.gain.setValueAtTime(0.28 * volJitter, now);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);
      sub.connect(subGain);
      subGain.connect(destination);

      osc.start(now);
      sub.start(now);
      osc.stop(now + 0.05);
      sub.stop(now + 0.04);
      break;
    }

    case 'secondaryClick': {
      // SECONDARY BUTTON: Lighter, softer mechanical "tock"
      // Crisp, tactile, damped PBT stroke (~270Hz -> ~170Hz)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(880 * jitter, now);
      filter.Q.setValueAtTime(1.8, now);

      osc.type = 'triangle';
      const baseFreq = 265 * jitter;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.64, now + 0.032);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.30 * volJitter, now + 0.0015);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.038);
      break;
    }

    case 'nav': {
      // NAVIGATION: Short, quiet, restrained mechanical tick/thock
      // Subtle enough for continuous browsing without audio fatigue
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(680 * jitter, now);
      filter.Q.setValueAtTime(1.4, now);

      osc.type = 'sine';
      const baseFreq = 225 * jitter;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.65, now + 0.024);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.22 * volJitter, now + 0.001);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.026);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.028);
      break;
    }

    case 'nodeSelect':
    case 'select': {
      // NODE SELECTION / PIN: Tactile switch bottom-out (~210Hz)
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(720 * jitter, now);
      filter.Q.setValueAtTime(1.6, now);

      osc.type = 'triangle';
      const baseFreq = 210 * jitter;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.60, now + 0.028);

      oscGain.gain.setValueAtTime(0.001, now);
      oscGain.gain.linearRampToValueAtTime(0.28 * volJitter, now + 0.0015);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.030);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.032);
      break;
    }

    case 'open': {
      // EXPAND / OPEN: Deep mechanical thock followed by tiny damped acoustic resonance
      // Gives the tactile sensation of a weighted drawer or panel opening
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      const filter1 = ctx.createBiquadFilter();

      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(700 * jitter, now);

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(190 * jitter, now);
      osc1.frequency.exponentialRampToValueAtTime(125, now + 0.035);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.34 * volJitter, now + 0.002);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.040);

      osc1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(destination);
      osc1.start(now);
      osc1.stop(now + 0.042);

      // Micro internal acoustic bloom (~50ms)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(235 * jitter, now + 0.008);
      osc2.frequency.exponentialRampToValueAtTime(150, now + 0.055);

      gain2.gain.setValueAtTime(0.001, now + 0.008);
      gain2.gain.linearRampToValueAtTime(0.16 * volJitter, now + 0.016);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);

      osc2.connect(gain2);
      gain2.connect(destination);
      osc2.start(now + 0.008);
      osc2.stop(now + 0.068);
      break;
    }

    case 'close': {
      // CLOSE / BACK: Damped reverse mechanical release tap
      // Evokes a smooth spring return upstroke
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650 * jitter, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(175 * jitter, now);
      osc.frequency.linearRampToValueAtTime(240 * jitter, now + 0.018);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.035);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24 * volJitter, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.040);
      break;
    }

    case 'toggle': {
      // TOGGLE: Extremely subtle mechanical switch tick (approx 18ms)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(780 * jitter, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(310 * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.018);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18 * volJitter, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.020);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.022);
      break;
    }

    case 'connect': {
      // CONNECT: Firm mechanical switch latch with damped confirmation
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 * jitter, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240 * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.045);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.32 * volJitter, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.050);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.052);
      break;
    }

    case 'disconnect': {
      // DISCONNECT: Mechanical switch unlatch snap
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200 * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.038);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.22 * volJitter, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.040);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.042);
      break;
    }

    case 'hover': {
      // HOVER: Ultra-short, heavily dampened micro-tap (barely audible)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(380 * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.012);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07 * volJitter, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.014);

      osc.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.015);
      break;
    }

    case 'zoom': {
      // ZOOM: Tactile detent notch tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(650 * jitter, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(290 * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.020);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.16 * volJitter, now + 0.001);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.024);
      break;
    }

    case 'success': {
      // SUCCESS: Warm two-step mechanical thock confirmation (rapid double-tap)
      const t1 = now;
      const t2 = now + 0.038;

      // First tap
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(180 * jitter, t1);
      osc1.frequency.exponentialRampToValueAtTime(120, t1 + 0.030);
      gain1.gain.setValueAtTime(0.001, t1);
      gain1.gain.linearRampToValueAtTime(0.26 * volJitter, t1 + 0.002);
      gain1.gain.exponentialRampToValueAtTime(0.0001, t1 + 0.032);
      osc1.connect(gain1);
      gain1.connect(destination);
      osc1.start(t1);
      osc1.stop(t1 + 0.034);

      // Second slightly higher tap
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(250 * jitter, t2);
      osc2.frequency.exponentialRampToValueAtTime(170, t2 + 0.035);
      gain2.gain.setValueAtTime(0.001, t2);
      gain2.gain.linearRampToValueAtTime(0.28 * volJitter, t2 + 0.002);
      gain2.gain.exponentialRampToValueAtTime(0.0001, t2 + 0.038);
      osc2.connect(gain2);
      gain2.connect(destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.040);
      break;
    }

    case 'error': {
      // ERROR: Heavily damped, low-pitch bottom-out thud
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120 * jitter, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.055);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.26 * volJitter, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.060);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(destination);

      osc.start(now);
      osc.stop(now + 0.062);
      break;
    }
  }
}
