import { basePose, CLIPS, merge, type Expr, type Pose } from "./pose";
import { clamp, lerp } from "./util";
import { FIGURE_MM, PX_PER_MM, VIEW } from "./rig";

export type Tier = "3d" | "2d" | "still";
export type Intent =
  | { kind: "clip"; name: string; u: number }
  | { kind: "walk"; dir: 1 | -1; phase: number }
  | { kind: "pose"; expr: Expr; lx: number; ly: number; blink: number };

export interface Frame {
  x: number; scale: number; slide: number; pose: Pose; intent: Intent;
  bubble: { text: string; key: number } | null;
  headX: number; headY: number; headHalf: number;
  hidden: boolean; hero: boolean; zzz: boolean; busy: boolean;
}

type Action =
  | { t: "walk"; to: number; scaleTo?: number; name?: string }
  | { t: "clip"; name: string; say?: string; sayFor?: number; loopFor?: number }
  | { t: "wait"; s: number }
  | { t: "say"; text: string; s: number }
  | { t: "sleep" };

const FLOOR_PX = 10;                                  // gap between Ziya's feet and the bottom of the window
const SAY: Record<string, string> = {
  welcome: "Hi, I'm Ziya,\nWelcome to Z2H!", welcomeBack: "Welcome back!", click: "Hi again!", "file-dropped": "Wow, nice model!",
  "estimate-ready": "Your price is ready!", "upload-error": "The upload did not finish. Try again?", "file-invalid": "Sorry, I can't read that file. Try STL, 3MF or OBJ.",
  "form-sent": "Thanks! We will reply soon.", footer: "Thanks for visiting!", lowsignal: "Low signal. Switching to lite mode.", signalback: "Signal is back!", lag: "Switching to lite mode so it runs smoothly.",
};
const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const trap = (u: number) => { const a = 0.14; u = clamp(u); return u < a ? (u * u) / (2 * a * (1 - a)) : u > 1 - a ? 1 - ((1 - u) * (1 - u)) / (2 * a * (1 - a)) : (u - a / 2) / (1 - a); };

export class Director {
  vw = 1280; vh = 720; mobile = false; tier: Tier = "3d"; hidden = false;
  figurePx = 190;
  private x = 0; private scale = 0.42; private hero = false;
  private queue: Action[] = []; private cur: (Action & { t0: number; from?: number; fromScale?: number; dur?: number; started?: boolean }) | null = null;
  private now = 0; private last = 0;
  private walkAmt = 0; private yawS = 0; private phase = 0; private dir: 1 | -1 = 1; private vx = 0;
  private corner: "L" | "R" = "R";
  private ptr: { x: number; y: number; t: number; has: boolean } = { x: 0, y: 0, t: -99, has: false };
  private lookS = { x: 0, y: 0 };
  private nextDecide = 0; private nextBlink = 2; private blinkT = -1;
  private lastInput = 0; private curiousAt = -99; private sleeping = false;
  private bubble: { text: string; key: number; until: number } | null = null; private bubbleKey = 0;
  private evtAt: Record<string, number> = {};
  private slideV = 0; private hiddenNow = false; private clipName = ""; private clipU = 0; private heroRun = false;
  onClipEnd?: (name: string) => void;

  // ---- setup
  resize(vw: number, vh: number, mobile: boolean) {
    this.vw = vw; this.vh = vh; this.mobile = mobile;
    this.figurePx = mobile ? 130 : 190;
    if (!this.heroRun) { this.scale = this.mascotScale(); this.x = clamp(this.x, this.leftX(), this.rightX()); }
  }
  mascotScale() { return this.figurePx / (FIGURE_MM * PX_PER_MM); }
  heroScale() { return Math.min(1, (Math.min(this.vh * 0.62, 460)) / (FIGURE_MM * PX_PER_MM)); }
  private halfW() { return 45 * PX_PER_MM * this.scale; }
  leftX() { return 14 + 45 * PX_PER_MM * this.mascotScale(); }
  rightX() { return this.vw - 14 - 45 * PX_PER_MM * this.mascotScale(); }
  private cornerX(c: "L" | "R") { return c === "L" ? this.leftX() : this.rightX(); }

  // ---- inputs
  pointer(x: number, y: number, now: number) { this.ptr = { x, y, t: now, has: true }; this.input(now); }
  input(now: number) { this.lastInput = now; if (this.sleeping) { this.sleeping = false; this.queue.length = 0; this.cur = null; this.queue.push({ t: "clip", name: "wake" }); } }
  pointerGone() { this.ptr.has = false; }

  start(kind: "welcome" | "welcomeBack" | "none", now: number, lite: boolean) {
    this.now = now; this.last = now; this.lastInput = now; this.corner = Math.random() < 0.5 ? "L" : "R";
    if (kind === "welcome" && !lite && this.tier === "3d") {
      this.heroRun = true; this.hero = true; this.scale = this.heroScale(); this.x = this.vw / 2;
      this.queue.push({ t: "clip", name: "welcome", say: SAY.welcome, sayFor: 1.8 });
      this.queue.push({ t: "walk", to: this.cornerX(this.corner), scaleTo: this.mascotScale(), name: "heroWalk" });
    } else {
      this.scale = this.mascotScale(); this.x = this.cornerX(this.corner);
      if (kind === "welcome") this.queue.push({ t: "clip", name: "welcomeLite", say: SAY.welcome, sayFor: 1.8 });
      else if (kind === "welcomeBack") this.queue.push({ t: "clip", name: "welcomeBack", say: SAY.welcomeBack, sayFor: 1.4 });
    }
    this.nextDecide = now + 9 + (kind === "welcome" ? 3 : 0);
  }

  // something happened on the page
  event(name: string, targetX?: number) {
    const key = name; if (this.now - (this.evtAt[key] ?? -9) < 1.5) return; this.evtAt[key] = this.now;
    if (this.tier === "still") { if (SAY[name]) this.say(SAY[name], 3.2); return; }
    const walkTo = () => { if (targetX == null || this.hidden) return false; const to = clamp(targetX, this.leftX(), this.rightX()); if (Math.abs(to - this.x) < 60) return false; this.queue.push({ t: "walk", to }); return true; };
    this.queue = this.queue.filter((a) => a.t === "wait" ? false : true); if (this.queue.length > 5) this.queue.length = 5;
    this.sleeping = false;
    const back = () => { this.queue.push({ t: "wait", s: 3.2 }); this.queue.push({ t: "walk", to: this.cornerX(Math.random() < 0.5 ? "L" : "R") }); };
    switch (name) {
      case "file-dropped": this.queue.push({ t: "clip", name: "wow" }); if (walkTo()) { this.queue.push({ t: "clip", name: "hopHappy", say: SAY[name], sayFor: 2.6 }); back(); } else this.queue.push({ t: "say", text: SAY[name], s: 2.6 }); break;
      case "estimate-ready": walkTo(); this.queue.push({ t: "clip", name: "cheer", say: SAY[name], sayFor: 2.8 }); back(); break;
      case "upload-error": walkTo(); this.queue.push({ t: "clip", name: "worried", say: SAY[name], sayFor: 3 }); back(); break;
      case "file-invalid": walkTo(); this.queue.push({ t: "clip", name: "sorry", say: SAY[name], sayFor: 3.6 }); back(); break;
      case "form-sent": walkTo(); this.queue.push({ t: "clip", name: "thanks", say: SAY[name], sayFor: 2.6 }); back(); break;
      case "footer": this.queue.push({ t: "clip", name: "goodbye", say: SAY[name], sayFor: 2.4 }); break;
      case "click": this.queue.push({ t: "clip", name: "hopHappy", say: SAY.click, sayFor: 1.4 }); break;
      case "hide": this.queue.length = 0; this.cur = null; this.queue.push({ t: "clip", name: "duck" }); break;
      case "show": this.hidden = false; this.queue.length = 0; this.cur = null; this.queue.push({ t: "clip", name: "peek" }); break;
    }
  }
  isBusy() { return !!this.cur || this.queue.length > 0; }
  // used by the test panel
  debug(what: "lookAround" | "yawn" | "sleep" | "roam") {
    if (what === "sleep") { this.queue.length = 0; this.cur = null; this.sleeping = true; return; }
    if (what === "roam") { const other: "L" | "R" = this.x < this.vw / 2 ? "R" : "L"; this.queue.push({ t: "clip", name: "hopHappy" }, { t: "walk", to: this.cornerX(other) }); return; }
    this.queue.push({ t: "clip", name: what });
  }
  say(text: string, s: number) { this.bubble = { text, key: ++this.bubbleKey, until: this.now + s }; }
  playSystem(name: "flatten" | "inflate", text?: string) {
    this.queue.length = 0; this.cur = null; this.queue.push({ t: "clip", name, say: text, sayFor: 3 });
  }

  // ---- one frame
  update(now: number): Frame {
    const dt = clamp(now - this.last, 0, 0.1); this.last = now; this.now = now;
    if (this.bubble && now > this.bubble.until) this.bubble = null;

    const p = basePose();
    let moving = false; let name = ""; let u = 0; let overrides: ReturnType<typeof merge> | null = null;
    if (this.hidden && !this.cur && !this.queue.length) { p.slide = 1; this.hiddenNow = true; return this.out(p, { kind: "pose", expr: "happy", lx: 0, ly: 0, blink: 0 }, false); }

    // pick the next action
    if (!this.cur) {
      const a = this.queue.shift();
      if (a) { this.cur = { ...a, t0: now }; }
      else if (this.sleeping) this.cur = { t: "sleep", t0: now };
      else this.decide(now);
    }
    const c = this.cur;
    if (c) {
      const el = now - c.t0;
      if (c.t === "walk") {
        if (!c.started) { c.started = true; c.from = this.x; c.fromScale = this.scale; c.dur = Math.max(0.5, (Math.abs(c.to - this.x) / (1.25 * this.figurePx)) * 1.08); if (c.name === "heroWalk") c.dur = 2.0; if (Math.abs(c.to - this.x) < 2) c.dur = 0.01; }
        const k = trap(el / c.dur!), nx = lerp(c.from!, c.to, k); const dx = nx - this.x; this.x = nx; this.vx = dx / Math.max(dt, 1e-3);
        if (c.scaleTo != null) this.scale = lerp(c.fromScale!, c.scaleTo, k);
        if (Math.abs(dx) > 0.01) this.dir = dx > 0 ? 1 : -1;
        this.phase += Math.abs(dx) / (0.6 * this.figurePx * (this.scale / this.mascotScale()));
        moving = true;
        if (el >= c.dur!) { this.cur = null; if (c.name === "heroWalk") { this.hero = false; this.heroRun = false; this.scale = this.mascotScale(); } }
      } else if (c.t === "clip") {
        const clip = CLIPS[c.name]; name = c.name; u = el;
        if (!c.started) { c.started = true; if (c.say) this.say(c.say, c.sayFor ?? 2.4); if (c.name === "duck") { /* hidden after the clip */ } }
        overrides = clip.fn(Math.min(el, clip.dur)) as never;
        if (el >= clip.dur) {
          this.cur = null;
          if (c.name === "duck") { this.hidden = true; this.hiddenNow = true; }
          this.onClipEnd?.(c.name);
        }
      } else if (c.t === "wait") { if (el >= c.s) this.cur = null; }
      else if (c.t === "say") { if (!c.started) { c.started = true; this.say(c.text, c.s); } if (el >= c.s) this.cur = null; }
      else if (c.t === "sleep") { name = "sleep"; u = el; overrides = CLIPS.sleep.fn(el % CLIPS.sleep.dur) as never; if (!this.sleeping) this.cur = null; }
    }

    // base pose: look, blink, thinking, breathing
    const hy = this.headY(), hx = this.x;
    let tx = 0, ty = 0;
    if (this.ptr.has && !this.mobile) { tx = clamp((this.ptr.x - hx) / 420, -1, 1); ty = clamp(-(this.ptr.y - hy) / 300, -1, 1); }
    const kk = 1 - Math.exp(-dt / 0.12); this.lookS.x += (tx - this.lookS.x) * kk; this.lookS.y += (ty - this.lookS.y) * kk;
    const wAmt = this.walkAmt; p.lx = this.lookS.x * (1 - 0.55 * wAmt); p.ly = this.lookS.y * (1 - 0.55 * wAmt);
    if (now > this.nextBlink && this.blinkT < 0) { this.blinkT = now; this.nextBlink = now + rnd(2.4, 6); }
    if (this.blinkT >= 0) { const b = (now - this.blinkT) / 0.17; if (b >= 1) this.blinkT = -1; else p.blink = 1 - Math.abs(2 * b - 1); }
    const still = now - this.ptr.t; if (this.ptr.has && !this.mobile && !this.cur && still > 1.6 && still < 4) { p.expr = "neutral"; p.hRoll = 0.1; }

    // walk cycle state (smoothed so legs ease in and out)
    const mv = moving && Math.abs(this.vx) > 8;
    this.walkAmt += ((mv ? 1 : 0) - this.walkAmt) * (1 - Math.exp(-dt / 0.09));
    this.yawS += ((mv ? this.dir * 48 * Math.PI / 180 : 0) - this.yawS) * (1 - Math.exp(-dt / 0.13));
    p.walk = this.walkAmt; p.phase = this.phase; p.yaw = this.yawS;
    if (overrides) merge(p, overrides as never);

    // curious when the pointer comes close
    if (!this.mobile && this.ptr.has && !this.cur && !this.queue.length && this.tier !== "still" && now - this.curiousAt > 9 && Math.hypot(this.ptr.x - hx, this.ptr.y - hy) < 170 && now - this.ptr.t < 0.4) {
      this.curiousAt = now; this.queue.push({ t: "clip", name: "curious" });
    }

    // choose what the 2D version should show
    let intent: Intent;
    if (this.walkAmt > 0.35 && !overrides) intent = { kind: "walk", dir: this.dir, phase: this.phase };
    else if (name && CLIPS[name] && name !== "duck") intent = { kind: "clip", name, u };
    else intent = { kind: "pose", expr: p.expr, lx: p.lx, ly: p.ly, blink: p.blink };
    this.hiddenNow = false;
    return this.out(p, intent, name === "sleep");
  }

  private headY() { return this.vh - FLOOR_PX - 99.8 * PX_PER_MM * this.scale; }

  private out(p: Pose, intent: Intent, zzz: boolean): Frame {
    const s = this.scale, hp = 33 * PX_PER_MM * s;
    return {
      x: this.x, scale: s, slide: p.slide, pose: p, intent, bubble: this.bubble ? { text: this.bubble.text, key: this.bubble.key } : null,
      headX: this.x, headY: this.vh - FLOOR_PX - (99.8 * PX_PER_MM * s) - p.y * PX_PER_MM * s, headHalf: hp, hidden: this.hidden && p.slide >= 1, hero: this.hero, zzz, busy: !!this.cur || this.queue.length > 0,
    };
  }

  // Every 7 to 13 seconds Ziya decides: 75% stay put (maybe look around or yawn), 25% walk to the other corner.
  private decide(now: number) {
    if (this.tier === "still" || this.hidden || this.heroRun) return;
    if (now - this.lastInput > 75 && !this.sleeping) { this.sleeping = true; this.cur = { t: "sleep", t0: now }; return; }
    if (now < this.nextDecide) return;
    this.nextDecide = now + rnd(7, 13);
    if (Math.random() < 0.25) {
      const other: "L" | "R" = this.x < this.vw / 2 ? "R" : "L"; this.corner = other;
      this.queue.push({ t: "clip", name: "hopHappy" }); this.queue.push({ t: "walk", to: this.cornerX(other) });
    } else if (now - this.lastInput > 25 && Math.random() < 0.4) this.queue.push({ t: "clip", name: "yawn" });
    else if (Math.random() < 0.5) this.queue.push({ t: "clip", name: "lookAround" });
  }
}
export { VIEW };
