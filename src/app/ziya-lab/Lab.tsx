"use client";
import { useEffect, useRef } from "react";
import { basePose, CLIPS, merge, type Override, type Pose } from "@/components/ziya/pose";

declare global { interface Window { ziyaLab?: { ready: boolean; draw: (o: Override, t?: number) => string; clip: (name: string, u: number, extra?: Override) => string; style: (s: "smooth" | "toon") => void; size: [number, number]; dur: Record<string, number> } } }

export default function Lab() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let dead = false; let dispose = () => {};
    (async () => {
      const q = new URLSearchParams(location.search);
      const { loadModel } = await import("@/components/ziya/model");
      const { createRig, VIEW } = await import("@/components/ziya/rig");
      const data = await loadModel("/ziya/ziya.zm.gz");
      if (dead || !ref.current) return;
      const pr = Number(q.get("pr") || "1");
      const rig = createRig(ref.current, data, { pixelRatio: pr, style: q.get("style") === "toon" ? "toon" : "smooth", preserve: true });
      const cv = ref.current;
      const draw = (o: Override, t = 0) => { const p: Pose = merge(basePose(), o); rig.apply(p, t); rig.render(); return cv.toDataURL("image/png"); };
      window.ziyaLab = { ready: true, draw, size: [Math.round(VIEW.w * pr), Math.round(VIEW.h * pr)], dur: Object.fromEntries(Object.entries(CLIPS).map(([k, v]) => [k, v.dur])), style: (s) => rig.setStyle(s),
        clip: (name, u, extra) => { const c = CLIPS[name]; return draw({ ...(c ? c.fn(Math.min(u, c.dur)) : {}), ...(extra || {}) }, u); } };
      dispose = () => rig.dispose();
    })();
    return () => { dead = true; dispose(); };
  }, []);
  return <canvas ref={ref} style={{ position: "fixed", left: 0, top: 0, width: 360, height: 513, zIndex: 2147483000, background: "transparent" }} />;
}
