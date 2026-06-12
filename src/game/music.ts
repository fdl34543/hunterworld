/**
 * Procedural background music engine using the Web Audio API.
 *
 * Generates looping ambient music with a different mood per map theme,
 * without shipping any audio files. A simple chord pad + arpeggio + bass
 * driven by a step sequencer gives a cohesive fantasy/voxel-RPG feel.
 */

type Mood = {
  // Semitone offsets from a root note (MIDI), one chord per bar.
  progression: number[][];
  rootMidi: number; // base root (e.g. 60 = middle C)
  tempo: number; // BPM
  scale: number[]; // semitone offsets used for arpeggio
  padType: OscillatorType;
  leadType: OscillatorType;
  reverb: number; // 0..1, fakes a longer release
};

const MOODS: Record<string, Mood> = {
  // Cozy town theme - major, mid tempo
  town: {
    progression: [[0, 4, 7], [-3, 0, 4], [5, 9, 12], [7, 11, 14]],
    rootMidi: 60,
    tempo: 88,
    scale: [0, 2, 4, 5, 7, 9, 11],
    padType: "triangle",
    leadType: "triangle",
    reverb: 0.55,
  },
  // Mysterious forest - minor
  forest: {
    progression: [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-5, -1, 2]],
    rootMidi: 57,
    tempo: 78,
    scale: [0, 2, 3, 5, 7, 8, 10],
    padType: "sine",
    leadType: "triangle",
    reverb: 0.7,
  },
  // Hot desert - phrygian-ish
  desert: {
    progression: [[0, 3, 7], [1, 5, 8], [-2, 2, 5], [0, 3, 7]],
    rootMidi: 55,
    tempo: 92,
    scale: [0, 1, 4, 5, 7, 8, 11],
    padType: "sawtooth",
    leadType: "triangle",
    reverb: 0.5,
  },
  // Frozen mountain - airy minor
  mountain: {
    progression: [[0, 3, 7, 10], [-4, 0, 3, 7], [-2, 2, 5, 9], [-5, -1, 2, 5]],
    rootMidi: 62,
    tempo: 70,
    scale: [0, 2, 3, 5, 7, 9, 10],
    padType: "sine",
    leadType: "sine",
    reverb: 0.85,
  },
  // Sunlit beach - bright lydian
  beach: {
    progression: [[0, 4, 7], [2, 6, 9], [-3, 0, 4], [5, 9, 12]],
    rootMidi: 60,
    tempo: 96,
    scale: [0, 2, 4, 6, 7, 9, 11],
    padType: "triangle",
    leadType: "sine",
    reverb: 0.45,
  },
  // Dungeons - dark/tense
  dungeon: {
    progression: [[0, 3, 6], [-2, 1, 5], [-5, -2, 2], [-1, 2, 6]],
    rootMidi: 48,
    tempo: 74,
    scale: [0, 1, 3, 5, 6, 8, 10],
    padType: "sawtooth",
    leadType: "triangle",
    reverb: 0.8,
  },
};

function moodForMap(mapId: string): Mood {
  if (mapId.includes("dungeon")) return MOODS.dungeon;
  if (mapId.startsWith("forest")) return MOODS.forest;
  if (mapId.startsWith("desert")) return MOODS.desert;
  if (mapId.startsWith("mountain")) return MOODS.mountain;
  if (mapId.startsWith("beach")) return MOODS.beach;
  return MOODS.town;
}

const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private nextNoteTime = 0;
  private currentMood: Mood = MOODS.town;
  private currentMapId = "town";
  private muted = false;
  private targetVolume = 0.18;

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(
        muted ? 0 : this.targetVolume,
        this.ctx.currentTime + 0.4,
      );
    }
  }

  isMuted() {
    return this.muted;
  }

  setMap(mapId: string) {
    if (mapId === this.currentMapId) return;
    this.currentMapId = mapId;
    const next = moodForMap(mapId);
    if (next === this.currentMood) return;
    this.currentMood = next;
    this.step = 0;
    // Reset scheduling so the new mood enters at the next tick.
    if (this.ctx) this.nextNoteTime = this.ctx.currentTime + 0.05;
  }

  start() {
    if (this.ctx) return;
    try {
      const Ctx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx: AudioContext = new Ctx();
      this.ctx = ctx;
      const master = ctx.createGain();
      this.master = master;
      master.gain.value = this.muted ? 0 : this.targetVolume;
      // Gentle lowpass keeps the synth from feeling harsh.
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 2400;
      lp.Q.value = 0.7;
      master.connect(lp).connect(ctx.destination);
      this.nextNoteTime = ctx.currentTime + 0.1;
      this.timer = window.setInterval(() => this.schedule(), 25);
    } catch {
      this.ctx = null;
    }
  }

  stop() {
    if (this.timer != null) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
      this.master = null;
    }
  }

  private schedule() {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const mood = this.currentMood;
    const stepDur = 60 / mood.tempo / 2; // eighth notes
    while (this.nextNoteTime < ctx.currentTime + 0.15) {
      this.playStep(this.nextNoteTime, ctx, master);
      this.nextNoteTime += stepDur;
      this.step = (this.step + 1) % 64;
    }
  }

  private playStep(t: number, ctx: AudioContext, master: GainNode) {
    const mood = this.currentMood;
    const stepDur = 60 / mood.tempo / 2;
    const barLen = 8; // 8 eighths per bar
    const stepInBar = this.step % barLen;
    const barIdx = Math.floor(this.step / barLen) % mood.progression.length;
    const chord = mood.progression[barIdx];

    // PAD on the down-beat of each bar
    if (stepInBar === 0) {
      const padDur = stepDur * barLen * 1.05;
      for (const off of chord) {
        this.voice(ctx,
          midiToHz(mood.rootMidi + off),
          t,
          padDur,
          mood.padType,
          0.04,
          0.4,
          padDur * 0.6 * (0.6 + mood.reverb * 0.6),
          master,
        );
      }
      // Bass note (an octave below the chord root)
      this.voice(ctx,
        midiToHz(mood.rootMidi + chord[0] - 12),
        t,
        stepDur * 4,
        "sine",
        0.12,
        0.05,
        stepDur * 3,
        master,
      );
    }

    // ARPEGGIO on every step (with a rest pattern for breath)
    const restPattern = [false, true, false, true, false, true, false, true];
    if (restPattern[stepInBar]) {
      const noteIdx = (stepInBar + barIdx) % chord.length;
      const octave = stepInBar > 4 ? 12 : 0;
      const off = chord[noteIdx] + octave;
      this.voice(ctx,
        midiToHz(mood.rootMidi + off + 12),
        t,
        stepDur * 1.4,
        mood.leadType,
        0.07,
        0.01,
        stepDur * 1.1,
        master,
      );
    }

    // Sparse melody flourish every 2 bars on offbeat 3
    if (this.step % 16 === 11) {
      const deg = mood.scale[(barIdx + 2) % mood.scale.length];
      this.voice(ctx,
        midiToHz(mood.rootMidi + deg + 24),
        t,
        stepDur * 2.4,
        mood.leadType,
        0.05,
        0.02,
        stepDur * 2,
        master,
      );
    }
  }

  private voice(
    ctx: AudioContext,
    freq: number,
    t: number,
    dur: number,
    type: OscillatorType,
    peak: number,
    attack: number,
    release: number,
    dest: GainNode,
  ) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(peak, t + attack);
    g.gain.linearRampToValueAtTime(peak * 0.6, t + dur * 0.5);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + release);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + dur + release + 0.05);
  }
}

let singleton: MusicEngine | null = null;
export function getMusicEngine(): MusicEngine {
  if (!singleton) singleton = new MusicEngine();
  return singleton;
}