export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (a: number, b: number, v: number) => { const x = clamp((v - a) / (b - a)); return x * x * (3 - 2 * x); };
export const outBack = (x: number) => { const c1 = 1.9, c3 = c1 + 1; x = clamp(x); return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const D = Math.PI / 180;
// a hop: height h (mm) between t0 and t0+dur
export const hop = (t: number, t0: number, dur: number, h: number) => { const u = (t - t0) / dur; return u > 0 && u < 1 ? h * Math.sin(Math.PI * u) : 0; };
