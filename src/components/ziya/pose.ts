import { clamp, hop, lerp, outBack, smooth, D } from "./util";

export type Expr = "happy" | "neutral" | "surprised" | "worried" | "sleepy";

// One arm. f = flip (0 hanging, 1 flipped up about the shoulder), out = degrees away from the body, sw = walking swing (rad)
export interface ArmP { f: number; out: number; sw: number }

// Everything the rig needs to draw one frame. Millimetres and radians unless noted.
export interface Pose {
  pop: number;              // overall scale (pop-in)
  y: number; sx: number; sy: number; zs: number;   // hop (mm), squash, flatten
  yaw: number; pitch: number; roll: number;        // body
  phase: number; walk: number;                     // walk cycle (in cycles) and how much of it (0..1)
  lx: number; ly: number;                          // where the eyes and head look, -1..1
  hRoll: number; hPitch: number;                   // extra head tilt
  face: number;                                    // 0..1, how much the head turns back to face the viewer while the body walks sideways
  expr: Expr; blink: number; mouthS: number;
  aL: ArmP; aR: ArmP;
  dial: number; logo: number; spin: number;        // dial ring segments lit (0..12), logo scale, logo spin
  slide: number;                                   // 0..1, how far Ziya is lowered out of sight (page moves him)
}

export const basePose = (): Pose => ({
  pop: 1, y: 0, sx: 1, sy: 1, zs: 1, yaw: 0, pitch: 0, roll: 0, phase: 0, walk: 0, lx: 0, ly: 0, hRoll: 0, hPitch: 0, face: 0,
  expr: "happy", blink: 0, mouthS: 1,
  aL: { f: 0, out: 0, sw: 0 }, aR: { f: 0, out: 0, sw: 0 }, dial: 12, logo: 1, spin: 0, slide: 0,
});

export type Override = Partial<Omit<Pose, "aL" | "aR">> & { aL?: Partial<ArmP>; aR?: Partial<ArmP> };
export function merge(p: Pose, o: Override | null | undefined): Pose {
  if (!o) return p;
  const { aL, aR, ...rest } = o;
  Object.assign(p, rest);
  if (aL) p.aL = { ...p.aL, ...aL };
  if (aR) p.aR = { ...p.aR, ...aR };
  return p;
}

// ---------------- clips ----------------
// A clip is a function of seconds since it started. It returns only what it changes.
export interface Clip { dur: number; fn: (u: number) => Override; loop?: boolean }
const sway = (t: number, k: number) => Math.sin(t * 1.6 + k) * 1.2;

// raised, waving arm: out is degrees away from the head when flipped up
const waveArm = (u: number, a: number, b: number, hz: number, amp: number) => {
  const flip = smooth(a, a + 0.4, u) - smooth(b, b + 0.4, u);
  const env = smooth(a + 0.4, a + 0.6, u) * (1 - smooth(b - 0.05, b + 0.15, u));
  return { f: flip, out: lerp(sway(u, 0), 22 - Math.sin(2 * Math.PI * hz * (u - a - 0.4)) * amp * env, flip), sw: 0 };
};

export const CLIPS: Record<string, Clip> = {
  // the approved welcome: pop in, hop, flipped wave, dial fills with the logo
  welcome: { dur: 2.8, fn: (u) => ({
    pop: u < 0.1 ? 0 : outBack((u - 0.1) / 0.45),
    y: hop(u, 0.7, 0.4, 7), sy: 1 - 0.07 * hop(u, 1.1, 0.25, 1), sx: 1 + 0.05 * hop(u, 1.1, 0.25, 1),
    aL: waveArm(u, 0.55, 2.3, 2.3, 9), dial: 12 * clamp((u - 0.1) / 2.6), logo: smooth(0.25, 0.6, u), expr: "happy",
  }) },
  // lite welcome for the 2D version: same moves, no dial fill (the sprites show it complete)
  welcomeLite: { dur: 2.8, fn: (u) => ({
    pop: u < 0.1 ? 0 : outBack((u - 0.1) / 0.45),
    y: hop(u, 0.7, 0.4, 7), aL: waveArm(u, 0.55, 2.3, 2.3, 9),
  }) },
  welcomeBack: { dur: 1.9, fn: (u) => ({
    pop: u < 0.05 ? 0 : outBack((u - 0.05) / 0.4), y: hop(u, 0.45, 0.3, 5), aL: waveArm(u, 0.35, 1.45, 2.3, 9),
  }) },
  goodbye: { dur: 2.6, fn: (u) => ({
    y: hop(u, 0.1, 0.3, 4), aL: waveArm(u, 0.25, 2.0, 2.3, 10), hRoll: 0.06 * Math.sin(u * 4) * smooth(0.5, 0.8, u),
  }) },
  hopHappy: { dur: 0.8, fn: (u) => ({
    y: hop(u, 0, 0.5, 9), sy: 1 - 0.08 * hop(u, 0.5, 0.2, 1), sx: 1 + 0.06 * hop(u, 0.5, 0.2, 1),
    aL: { out: 38 * Math.sin(Math.PI * clamp(u / 0.6)) }, aR: { out: 38 * Math.sin(Math.PI * clamp(u / 0.6)) },
  }) },
  curious: { dur: 1.1, fn: (u) => ({ hRoll: 0.22 * Math.sin(Math.PI * clamp(u / 1.1)), hPitch: 0.06 * Math.sin(Math.PI * clamp(u / 1.1)), expr: "neutral" }) },
  lookAround: { dur: 3.4, fn: (u) => {
    const lx = -smooth(0.3, 0.8, u) + 2 * smooth(1.5, 2.1, u) - smooth(2.8, 3.3, u);
    return { lx, ly: 0.15 * Math.sin(u * 2), expr: u > 0.25 && u < 3.2 ? "neutral" : "happy" };
  } },
  yawn: { dur: 2.2, fn: (u) => {
    const open = smooth(0.35, 0.9, u) - smooth(1.4, 1.9, u);
    const arms = smooth(0.2, 0.7, u) - smooth(1.5, 2.0, u);
    return { expr: open > 0.05 ? "surprised" : "happy", blink: smooth(0.3, 0.5, u) - smooth(1.6, 1.8, u), mouthS: 1 + 0.9 * open, hPitch: -0.2 * open,
      aL: { f: arms, out: lerp(0, 14, arms) }, aR: { f: arms, out: lerp(0, 14, arms) }, sy: 1 + 0.02 * open };
  } },
  sleep: { dur: 3.2, loop: true, fn: (u) => ({
    expr: "sleepy", pitch: 0.08, hPitch: 0.22 + 0.06 * Math.sin((u / 3.2) * 2 * Math.PI), sy: 1 + 0.006 * Math.sin((u / 3.2) * 2 * Math.PI),
    aL: { out: 4 }, aR: { out: 4 },
  }) },
  wake: { dur: 0.9, fn: (u) => ({ expr: "surprised", y: hop(u, 0.05, 0.35, 8), aL: { out: 30 * Math.sin(Math.PI * clamp(u / 0.7)) }, aR: { out: 30 * Math.sin(Math.PI * clamp(u / 0.7)) } }) },
  // estimate ready: two hops, both arms up, logo spins
  cheer: { dur: 2.4, fn: (u) => {
    const a = smooth(0.1, 0.45, u) - smooth(1.9, 2.3, u), w = Math.sin(u * 2 * Math.PI * 3) * 9 * a;
    return { expr: "happy", y: hop(u, 0.2, 0.4, 9) + hop(u, 0.75, 0.4, 9), sy: 1 - 0.06 * hop(u, 0.6, 0.15, 1) - 0.06 * hop(u, 1.15, 0.15, 1),
      aL: { f: a, out: lerp(0, 14 + w, a) }, aR: { f: a, out: lerp(0, 14 - w, a) }, spin: 2 * Math.PI * smooth(0.5, 1.4, u) };
  } },
  // upload did not finish: worried, hands to the chest, small tremble
  worried: { dur: 2.6, fn: (u) => {
    const a = smooth(0.1, 0.4, u) - smooth(2.1, 2.5, u);
    return { expr: "worried", roll: 0.025 * Math.sin(u * 28) * a, hPitch: 0.1 * a, sy: 1 - 0.015 * a, aL: { out: -26 * a }, aR: { out: -26 * a } };
  } },
  // file could not be read: worried and a polite bow
  sorry: { dur: 2.6, fn: (u) => {
    const bow = smooth(0.3, 0.8, u) - smooth(1.6, 2.1, u), a = smooth(0.1, 0.4, u) - smooth(2.1, 2.5, u);
    return { expr: "worried", pitch: 0.5 * bow, hPitch: 0.08 * bow, aL: { out: -22 * a }, aR: { out: -22 * a } };
  } },
  // form sent: nod, one arm raised
  thanks: { dur: 2.4, fn: (u) => {
    const nod = Math.max(0, Math.sin(u * 2 * Math.PI * 1.6)) * smooth(0.3, 0.5, u) * (1 - smooth(1.7, 1.9, u));
    return { expr: "happy", y: hop(u, 0.15, 0.35, 5), hPitch: 0.22 * nod, aR: waveArm(u, 0.2, 1.9, 0, 0) };
  } },
  // low signal: pressed flat (the 2D sprites take over at the end)
  flatten: { dur: 1.0, fn: (u) => ({ zs: lerp(1, 0.035, smooth(0.15, 0.7, u)), yaw: 0.55 * Math.sin(Math.PI * smooth(0, 0.8, u)), expr: "surprised", sy: 1 - 0.05 * hop(u, 0.5, 0.3, 1) }) },
  // signal back: pops out to 3D
  inflate: { dur: 1.0, fn: (u) => ({ zs: lerp(0.035, 1, outBack(smooth(0, 0.7, u))), yaw: -0.4 * Math.sin(Math.PI * smooth(0.1, 0.9, u)), y: hop(u, 0.5, 0.35, 6), expr: "happy" }) },
  // hide button: ducks out of sight, and later peeks back
  duck: { dur: 0.55, fn: (u) => ({ slide: smooth(0.05, 0.5, u), expr: "surprised" }) },
  peek: { dur: 3.4, fn: (u) => {
    const slide = 1 - 0.62 * smooth(0, 0.5, u) - 0.38 * smooth(2.0, 2.5, u);
    const lx = -smooth(0.7, 1.0, u) + 2 * smooth(1.2, 1.6, u) - smooth(1.7, 1.95, u);
    return { slide, lx, expr: u > 2.0 ? "happy" : "neutral", y: hop(u, 2.45, 0.35, 6), aL: waveArm(u, 2.55, 3.1, 2.3, 9) };
  } },
};

// The still image (and 2D frames) of each face
export const FACES: Expr[] = ["happy", "neutral", "surprised", "worried", "sleepy"];
export { clamp, lerp, D };

// surprised reaction to something happening (the approved surprised face, arms out, a hop)
CLIPS.wow = { dur: 1.1, fn: (u) => {
  const a = smooth(0, 0.2, u) - smooth(0.7, 1.0, u);
  return { expr: u < 0.85 ? "surprised" : "happy", y: hop(u, 0, 0.4, 7), sy: 1 - 0.05 * hop(u, 0.38, 0.2, 1), aL: { out: 38 * a }, aR: { out: 38 * a }, hPitch: -0.1 * a };
} };
