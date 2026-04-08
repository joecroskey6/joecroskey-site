let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume: number = 0.15,
  detune: number = 0,
) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;

  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

  osc.connect(gain);
  gain.connect(ac.destination);

  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + duration);
}

/** Soft pop — like Wii menu hover */
export function popSound() {
  playTone(880, 0.12, "sine", 0.1);
  playTone(1320, 0.1, "sine", 0.06, 5);
}

/** Bubbly click — two rising tones */
export function clickSound() {
  playTone(660, 0.08, "sine", 0.12);
  setTimeout(() => playTone(990, 0.12, "sine", 0.1), 40);
}

/** Discovery reveal — ascending arpeggio like finding an item */
export function discoverSound() {
  const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, "sine", 0.1 - i * 0.015), i * 80);
  });
}

/** Navigate / page transition — gentle whoosh with descending tone */
export function navigateSound() {
  playTone(784, 0.15, "sine", 0.08);
  setTimeout(() => playTone(1047, 0.18, "sine", 0.07), 50);
}

/** Bubble ambient — single random bubble pop */
export function bubbleSound() {
  const freq = 400 + Math.random() * 600;
  playTone(freq, 0.15, "sine", 0.04);
}

/** Back button — descending two-note */
export function backSound() {
  playTone(784, 0.1, "sine", 0.08);
  setTimeout(() => playTone(523, 0.15, "sine", 0.07), 60);
}
