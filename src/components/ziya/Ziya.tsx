"use client";
import { useEffect, useRef, useState } from "react";
import { Director, type Frame, type Tier } from "./director";
import { Sprites } from "./sprites";
import { VIEW } from "./rig";

type RigT = import("./rig").Rig;
const K = { pref: "z2h-ziya", hidden: "z2h-ziya-hidden", seen: "z2h-ziya-seen", session: "z2h-ziya-session" };
const store = {
  get(k: string, s = false) { try { return (s ? sessionStorage : localStorage).getItem(k); } catch { return null; } },
  set(k: string, v: string | null, s = false) { try { const o = s ? sessionStorage : localStorage; if (v == null) o.removeItem(k); else o.setItem(k, v); } catch { /* private mode */ } },
};
export const EVENTS = ["file-dropped", "estimate-ready", "upload-error", "file-invalid", "form-sent", "footer"] as const;

interface Conn { saveData?: boolean; effectiveType?: string; downlink?: number; rtt?: number; addEventListener?: (t: string, f: () => void) => void; removeEventListener?: (t: string, f: () => void) => void }
const conn = () => (navigator as unknown as { connection?: Conn }).connection;
// true when the connection or the device looks too weak for live 3D
function weak(): string | null {
  const c = conn(), n = navigator as unknown as { deviceMemory?: number };
  if (c?.saveData) return "data saver is on";
  if (c?.effectiveType && /(^|-)2g|3g/.test(c.effectiveType)) return "slow connection";
  if (c?.downlink != null && c.downlink > 0 && c.downlink < 1.2) return "slow connection";
  if (n.deviceMemory && n.deviceMemory <= 2) return "low memory";
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return "few processor cores";
  return null;
}
function hasWebGL() { try { const c = document.createElement("canvas"); return !!(c.getContext("webgl2") || c.getContext("webgl")); } catch { return false; } }

export default function Ziya() {
  const figRef = useRef<HTMLDivElement>(null), canvasRef = useRef<HTMLCanvasElement>(null), spriteRef = useRef<HTMLDivElement>(null);
  const dimRef = useRef<HTMLDivElement>(null), bubRef = useRef<HTMLDivElement>(null), zzzRef = useRef<HTMLDivElement>(null), menuRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(false);
  const [lite, setLite] = useState(false);
  const [menu, setMenu] = useState(false);
  const [demo, setDemo] = useState(false);
  const api = useRef<{ event: (n: string) => void; hide: () => void; show: () => void; toggleLite: () => void; tier: () => Tier; send: (n: string) => void } | null>(null);

  useEffect(() => {
    let dead = false, raf = 0;
    const dir = new Director(); const sprites = new Sprites(); let rig: RigT | null = null; let rigLoading: Promise<boolean> | null = null;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pref = store.get(K.pref); let tier: Tier = "3d";
    const initHidden = store.get(K.hidden) === "1"; let hiddenFlag = initHidden;
    setHidden(initHidden); setLite(pref === "lite"); setDemo(/[?&]ziya=demo/.test(location.search) || store.get("z2h-ziya-demo", true) === "1");
    if (/[?&]ziya=demo/.test(location.search)) store.set("z2h-ziya-demo", "1", true);
    const mobile = () => innerWidth < 700 || matchMedia("(pointer: coarse)").matches;
    const clock = () => performance.now() / 1000;
    let started = false, running = false, frames = 0, slowAcc = 0, lastT = 0, renderedAt = 0, offline = false;
    let bubKey = -1, bubHide = 0;
    const ptrOK = () => !mobile();

    const setTier = (t: Tier) => {
      tier = t; dir.tier = t;
      if (canvasRef.current) canvasRef.current.style.display = t === "3d" ? "block" : "none";
      if (spriteRef.current) spriteRef.current.style.display = t === "3d" ? "none" : "block";
    };
    const need2d = ["faces", "look", "walkR", "walkL"];
    const load3d = () => {
      if (rigLoading) return rigLoading;
      rigLoading = (async () => {
        try {
          if (!hasWebGL()) return false;
          const [{ loadModel }, { createRig }] = await Promise.all([import("./model"), import("./rig")]);
          const data = await loadModel("/ziya/ziya.zm.gz"); if (dead || !canvasRef.current) return false;
          rig = createRig(canvasRef.current, data, { pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5) }); return true;
        } catch { return false; }
      })();
      return rigLoading;
    };
    const idle = (f: () => void) => { const w = window as unknown as { requestIdleCallback?: (f: () => void) => void }; if (w.requestIdleCallback) w.requestIdleCallback(f); else setTimeout(f, 800); };

    const resize = () => { dir.resize(innerWidth, innerHeight, mobile()); };
    const targetOf = (): { x: number; y: number } | null => {
      const el = document.querySelector("[data-ziya-target]"); if (!el) return null; const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight || r.width < 40) return null; return { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, innerHeight * 0.4) };
    };
    const fire = (name: string) => {
      if (!started || dead) return;
      const t = ["file-dropped", "estimate-ready", "upload-error", "file-invalid", "form-sent"].includes(name) ? targetOf() : null;
      if (t && ptrOK()) dir.pointer(t.x, t.y, clock());
      dir.event(name, t?.x);
    };

    // ---- drawing
    const draw = (f: Frame) => {
      const fig = figRef.current; if (!fig) return;
      fig.style.transform = `translate3d(${(f.x - VIEW.w / 2).toFixed(1)}px,${(f.slide * VIEW.h * f.scale).toFixed(1)}px,0) scale(${f.scale.toFixed(4)})`;
      fig.style.visibility = f.hidden ? "hidden" : "visible";
      if (tier === "3d" && rig) { rig.apply(f.pose, clock()); rig.render(); }
      else if (spriteRef.current) sprites.draw(spriteRef.current, f.intent);
      if (dimRef.current) dimRef.current.style.opacity = f.hero ? "1" : "0";
      // speech bubble
      const bub = bubRef.current; if (bub) {
        if (f.bubble) {
          if (f.bubble.key !== bubKey) { bubKey = f.bubble.key; bub.textContent = f.bubble.text; bub.classList.remove("on"); void bub.offsetWidth; bub.classList.add("on"); }
          const bw = bub.offsetWidth, bh = bub.offsetHeight; const right = f.headX + f.headHalf + 16 + bw < innerWidth - 8;
          const left = right ? f.headX + f.headHalf + 14 : f.headX - f.headHalf - 14 - bw; bub.dataset.side = right ? "r" : "l";
          bub.style.transform = `translate3d(${Math.max(8, left).toFixed(0)}px,${Math.max(8, f.headY - bh - 4).toFixed(0)}px,0)`;
          bubHide = 0;
        } else if (bubKey !== -1) { bub.classList.remove("on"); bubKey = -1; bubHide = 1; }
      }
      const z = zzzRef.current; if (z) { z.style.opacity = f.zzz ? "1" : "0"; z.style.transform = `translate3d(${(f.headX + f.headHalf * 0.5).toFixed(0)}px,${(f.headY - 40).toFixed(0)}px,0)`; }
      const m = menuRef.current; if (m) m.style.transform = `translate3d(${Math.min(innerWidth - 150, f.x + 52 * f.scale * 3 * 0.5).toFixed(0)}px,${(innerHeight - 10 - 70).toFixed(0)}px,0)`;
    };
    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop); const now = ts / 1000;
      const dtm = lastT ? ts - lastT : 16; lastT = ts;
      const f = dir.update(now);
      // idle frames at half rate, to spare phones
      if (!f.busy && f.intent.kind === "pose" && tier === "3d" && (frames++ & 1)) return;
      draw(f);
      // too slow? fall back to the flat version
      if (tier === "3d" && document.visibilityState === "visible") {
        slowAcc = slowAcc * 0.97 + Math.min(dtm, 200) * 0.03;
        if (renderedAt === 0) renderedAt = now;
        if (now - renderedAt > 5 && slowAcc > 48) { renderedAt = now + 1e9; goFlat("lag"); }
      }
      if (f.hidden && !figHidden) { figHidden = true; setHidden(true); store.set(K.hidden, "1"); stopLoop(); }
    };
    let figHidden = false;
    const startLoop = () => { if (running || dead) return; running = true; lastT = 0; raf = requestAnimationFrame(loop); };
    const stopLoop = () => { running = false; cancelAnimationFrame(raf); };

    // ---- going flat / back to 3D
    const goFlat = async (why: "lowsignal" | "lag") => {
      if (tier !== "3d") return;
      await Promise.all(need2d.map((n) => sprites.load(n)));
      dir.onClipEnd = (n) => { if (n === "flatten") { setTier("2d"); if (why === "lag" && rig) { rig.dispose(); rig = null; rigLoading = null; } } };
      dir.playSystem("flatten", why === "lag" ? "Switching to lite mode so it runs smoothly." : "Low signal. Switching to lite mode.");
    };
    const goRound = async () => {
      if (tier === "3d" || store.get(K.pref) === "lite" || reduced) return;
      const ok = await load3d(); if (!ok || dead) return;
      setTier("3d"); dir.onClipEnd = undefined; dir.playSystem("inflate", "Signal is back!"); renderedAt = 0; slowAcc = 0;
    };
    const net = () => {
      const w = weak(); const bad = offline || (w && /connection|data saver/.test(w));
      if (bad) void goFlat("lowsignal"); else if (!w) void goRound();
    };
    const onOffline = () => { offline = true; void goFlat("lowsignal"); };
    const onOnline = () => { offline = false; setTimeout(() => { if (!offline) net(); }, 2500); };

    // ---- start
    const boot = async () => {
      if (started || dead) return;
      if (hiddenFlag) return;       // only the little tab is shown
      resize();
      const first = !store.get(K.seen);
      const sess = store.get(K.session, true);
      const kind: "welcome" | "welcomeBack" | "none" = sess ? "none" : first ? "welcome" : "welcomeBack";
      const why = weak();
      if (reduced) tier = "still"; else if (pref === "lite" || why || !hasWebGL() || typeof DecompressionStream === "undefined") tier = "2d"; else tier = "3d";
      try { await sprites.init(); } catch { /* 3D can still work */ }
      if (dead) return;
      let useTier: Tier = tier;
      if (tier === "3d") {
        // wait up to 1.5 s for the 3D version, then fall back to the light one (3D joins in later)
        const got = await Promise.race([load3d(), new Promise<boolean>((r) => setTimeout(() => r(false), 1500))]);
        if (dead) return;
        if (!got) { useTier = "2d"; void load3d().then((ok) => { if (ok && !dead && store.get(K.pref) !== "lite" && !offline) upgrade(); }); }
      }
      const clipName = kind === "welcome" ? (useTier === "3d" ? null : "c_welcomeLite") : kind === "welcomeBack" ? "c_welcomeBack" : null;
      if (useTier !== "3d") await Promise.all([...(useTier === "still" ? ["faces"] : ["faces", "look"]), ...(clipName && useTier !== "still" ? [clipName] : [])].map((n) => sprites.load(n)));
      if (dead) return;
      if (kind === "welcomeBack" && useTier === "3d") { /* no sprite needed */ }
      setTier(useTier); dir.tier = useTier;
      store.set(K.seen, "1"); store.set(K.session, "1", true);
      if (useTier === "still") { dir.start("none", clock(), true); if (kind === "welcome") dir.say("Hi, I'm Ziya,\nWelcome to Z2H!", 4.5); }
      else dir.start(kind, clock(), useTier !== "3d");
      started = true; startLoop();
      if (useTier === "3d") idle(() => { void Promise.all(need2d.map((n) => sprites.load(n))); });
      else idle(() => { void sprites.load("walkR"); void sprites.load("walkL"); });
    };
    const upgrade = () => {
      // 3D has arrived while the light version was running: swap when Ziya is between things
      const t = setInterval(() => { if (dead) return clearInterval(t); if (!dir.isBusy()) { clearInterval(t); if (rig) { setTier("3d"); renderedAt = 0; slowAcc = 0; } } }, 500);
    };

    const afterLoad = () => { if (document.visibilityState === "visible") void boot(); else { const f = () => { if (document.visibilityState === "visible") { document.removeEventListener("visibilitychange", f); void boot(); } }; document.addEventListener("visibilitychange", f); } };
    if (document.readyState === "complete") idle(afterLoad); else addEventListener("load", () => idle(afterLoad), { once: true });

    // ---- inputs
    const onMove = (e: PointerEvent) => { if (e.pointerType === "touch") return; dir.pointer(e.clientX, e.clientY, clock()); };
    const onAny = () => dir.input(clock());
    const onLeave = () => dir.pointerGone();
    const onVis = () => { if (document.visibilityState === "visible") { lastT = 0; } };
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; event?: string }; if (!d || d.type !== "z2h-ziya" || typeof d.event !== "string") return;
      if (!(EVENTS as readonly string[]).includes(d.event)) return;
      const frames2 = Array.from(document.querySelectorAll<HTMLIFrameElement>("iframe[data-ziya-target]")); if (!frames2.some((f) => f.contentWindow === e.source)) return;
      fire(d.event);
    };
    const onCustom = (e: Event) => { const n = (e as CustomEvent<string>).detail; if (typeof n === "string") fire(n); };
    addEventListener("pointermove", onMove, { passive: true }); addEventListener("scroll", onAny, { passive: true }); addEventListener("keydown", onAny); addEventListener("touchstart", onAny, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave); addEventListener("resize", resize); document.addEventListener("visibilitychange", onVis);
    addEventListener("message", onMsg); addEventListener("ziya:event", onCustom);
    addEventListener("offline", onOffline); addEventListener("online", onOnline); conn()?.addEventListener?.("change", net);
    // footer: say goodbye the first time it comes into view
    let io: IntersectionObserver | null = null; const ft = document.querySelector("footer");
    if (ft && "IntersectionObserver" in window) { io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting) && !store.get("z2h-ziya-bye", true)) { store.set("z2h-ziya-bye", "1", true); fire("footer"); } }, { threshold: 0.6 }); io.observe(ft); }
    if (!hiddenFlag && navigator.onLine === false) onOffline();

    api.current = {
      event: (n) => fire(n), send: (n) => fire(n), tier: () => tier,
      hide: () => { setMenu(false); fire("hide"); },
      show: () => { hiddenFlag = false; store.set(K.hidden, null); setHidden(false); figHidden = false; const go = async () => { if (!started) { await boot(); } else { startLoop(); } dir.hidden = false; dir.event("show"); startLoop(); }; void go(); },
      toggleLite: () => {
        const on = store.get(K.pref) !== "lite"; store.set(K.pref, on ? "lite" : null); setLite(on);
        if (on) void goFlat("lowsignal"); else void goRound();
      },
    };
    (window as unknown as { __ziya?: unknown }).__ziya = { hide: () => api.current?.hide(), show: () => api.current?.show(), dir, fire, setTier: (t: Tier) => setTier(t), sprites, tier: () => tier, rigReady: () => !!rig, flat: () => goFlat("lowsignal"), round: () => goRound(), replayWelcome: () => dir.start("welcome", clock(), tier !== "3d") };

    return () => {
      dead = true; stopLoop(); io?.disconnect(); rig?.dispose();
      removeEventListener("pointermove", onMove); removeEventListener("scroll", onAny); removeEventListener("keydown", onAny); removeEventListener("touchstart", onAny);
      document.documentElement.removeEventListener("mouseleave", onLeave); removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVis);
      removeEventListener("message", onMsg); removeEventListener("ziya:event", onCustom); removeEventListener("offline", onOffline); removeEventListener("online", onOnline); conn()?.removeEventListener?.("change", net);
    };
  }, []);

  // the menu closes by itself
  useEffect(() => { if (!menu) return; const t = setTimeout(() => setMenu(false), 6000); return () => clearTimeout(t); }, [menu]);

  const A = () => api.current;
  return (
    <>
      <div ref={dimRef} className="ziya-dim" aria-hidden="true" />
      <div className="ziya" aria-label="Ziya, the Z2H mascot" role="group" hidden={hidden}>
        <div className="ziya-fig" ref={figRef} style={{ width: VIEW.w, height: VIEW.h, visibility: "hidden" }}>
          <canvas ref={canvasRef} className="ziya-canvas" aria-hidden="true" />
          <div ref={spriteRef} className="ziya-sprite" aria-hidden="true" style={{ display: "none" }} />
          <button type="button" className="ziya-hit" aria-label="Say hi to Ziya" onClick={() => { A()?.event("click"); setMenu(true); }} />
        </div>
        <div ref={bubRef} className="ziya-bubble" role="status" aria-live="polite" />
        <div ref={zzzRef} className="ziya-zzz" aria-hidden="true">z z z</div>
        <div ref={menuRef} className={"ziya-menu" + (menu ? " open" : "")}>
          <button type="button" onClick={() => A()?.hide()}>Hide Ziya</button>
          <button type="button" onClick={() => { A()?.toggleLite(); setMenu(false); }} aria-pressed={lite}>Lite Ziya: {lite ? "on" : "off"}</button>
        </div>
      </div>
      {hidden && <button type="button" className="ziya-tab" onClick={() => A()?.show()}><span aria-hidden="true" /> Show Ziya</button>}
      {demo && <DemoPanel send={(n) => A()?.send(n)} />}
    </>
  );
}

const DEMO: [string, string][] = [["Welcome again", "__welcome"], ["Wow, nice model! (file dropped)", "file-dropped"], ["Estimate ready", "estimate-ready"], ["Upload error", "upload-error"], ["Bad file", "file-invalid"], ["Form sent", "form-sent"], ["Footer goodbye", "footer"], ["Low signal (flatten)", "__flat"], ["Signal back (3D)", "__round"], ["Look around", "__look"], ["Yawn", "__yawn"], ["Sleep", "__sleep"], ["Roam to other corner", "__roam"], ["Peek-a-boo (hide, then show)", "__peek"]];
function DemoPanel({ send }: { send: (n: string) => void }) {
  const z = () => (window as unknown as { __ziya?: { dir: import("./director").Director; flat: () => void; round: () => void; replayWelcome: () => void; fire: (n: string) => void; hide: () => void; show: () => void } }).__ziya;
  const run = (k: string) => {
    const a = z(); if (!a) return;
    if (k === "__welcome") a.replayWelcome(); else if (k === "__flat") a.flat(); else if (k === "__round") a.round();
    else if (k === "__look") a.dir.debug("lookAround"); else if (k === "__yawn") a.dir.debug("yawn"); else if (k === "__sleep") a.dir.debug("sleep"); else if (k === "__roam") a.dir.debug("roam");
    else if (k === "__peek") { a.hide(); setTimeout(() => a.show(), 2200); }
    else send(k);
  };
  return (
    <details className="ziya-demo" open>
      <summary>Ziya test panel</summary>
      <p>Try each moment. Nothing here is on the live site.</p>
      <div>{DEMO.map(([l, k]) => <button key={k} type="button" onClick={() => run(k)}>{l}</button>)}</div>
    </details>
  );
}
