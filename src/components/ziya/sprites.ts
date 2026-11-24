import type { Intent } from "./director";
import { FACES } from "./pose";
import { VIEW } from "./rig";

interface Man { fw: number; fh: number; strips: Record<string, { n: number; fps: number; bytes: number }> }
const BASE = "/ziya/sprites/";

// The 2D version: flat pre-rendered strips, one image per animation, fetched only when needed.
export class Sprites {
  man: Man | null = null; private img = new Map<string, HTMLImageElement | "loading" | "fail">();
  async init() { const r = await fetch(BASE + "manifest.json"); if (!r.ok) throw new Error("manifest"); this.man = (await r.json()) as Man; }
  has(name: string) { return !!this.man?.strips[name]; }
  ready(name: string) { return this.img.get(name) instanceof HTMLImageElement; }
  load(name: string): Promise<boolean> {
    if (!this.has(name)) return Promise.resolve(false);
    const cur = this.img.get(name); if (cur instanceof HTMLImageElement) return Promise.resolve(true); if (cur === "fail") return Promise.resolve(false);
    return new Promise((res) => {
      if (cur === "loading") { const t = setInterval(() => { const c = this.img.get(name); if (c !== "loading") { clearInterval(t); res(c instanceof HTMLImageElement); } }, 80); return; }
      this.img.set(name, "loading"); const im = new Image(); im.decoding = "async";
      im.onload = () => { this.img.set(name, im); res(true); }; im.onerror = () => { this.img.set(name, "fail"); setTimeout(() => this.img.delete(name), 20000); res(false); };
      im.src = BASE + name + ".webp";
    });
  }
  bytes(names: string[]) { return names.reduce((s, n) => s + (this.man?.strips[n]?.bytes || 0), 0); }

  // which strip and frame to show; null when the strip is not here yet
  pick(it: Intent): { strip: string; i: number } | null {
    if (!this.man) return null;
    const S = this.man.strips;
    if (it.kind === "clip") {
      const s = S["c_" + it.name];
      if (s) { if (this.ready("c_" + it.name)) return { strip: "c_" + it.name, i: Math.min(s.n - 1, Math.floor(it.u * s.fps)) }; void this.load("c_" + it.name); }
      return null;
    }
    if (it.kind === "walk") {
      const nm = it.dir > 0 ? "walkR" : "walkL"; if (!this.ready(nm)) { void this.load(nm); return null; }
      return { strip: nm, i: Math.floor((((it.phase % 1) + 1) % 1) * 8) % 8 };
    }
    if (it.expr === "happy") {
      if (it.blink > 0.5 && this.ready("faces")) return { strip: "faces", i: 5 };
      const q = (v: number) => (v < -0.4 ? 0 : v > 0.4 ? 2 : 1);
      if (this.ready("look")) return { strip: "look", i: q(it.ly) * 3 + q(it.lx) };   // look strip rows: down, middle, up
    }
    return this.ready("faces") ? { strip: "faces", i: Math.max(0, FACES.indexOf(it.expr)) } : null;
  }
  draw(el: HTMLElement, it: Intent) {
    const p = this.pick(it) || (this.ready("faces") ? { strip: "faces", i: 0 } : null);
    if (!p || !this.man) return;
    const s = this.man.strips[p.strip];
    if (el.dataset.strip !== p.strip) { el.dataset.strip = p.strip; el.style.backgroundImage = `url(${BASE}${p.strip}.webp)`; el.style.backgroundSize = `${s.n * VIEW.w}px ${VIEW.h}px`; }
    const pos = `-${p.i * VIEW.w}px 0`; if (el.dataset.pos !== pos) { el.dataset.pos = pos; el.style.backgroundPosition = pos; }
  }
}
