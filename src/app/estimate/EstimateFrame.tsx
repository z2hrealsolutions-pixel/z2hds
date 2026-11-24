"use client";
import { useEffect, useRef, useState } from "react";

// The estimator lives in the studio app. It tells this page its height with postMessage
// ({ type: "z2h-estimate-height", height }), so the frame always fits its content.
export default function EstimateFrame({ src, origin }: { src: string; origin: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState<number | null>(null);
  // the frame is loaded only after the listener is in place, so its first height message is never missed
  const [listening, setListening] = useState(false);
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.origin !== origin || e.source !== ref.current?.contentWindow) return;
      const d = e.data as { type?: string; height?: unknown };
      if (d && d.type === "z2h-estimate-height" && typeof d.height === "number" && d.height > 0 && d.height < 20000) setH(Math.ceil(d.height));
    }
    window.addEventListener("message", onMsg);
    setListening(true);
    return () => window.removeEventListener("message", onMsg);
  }, [origin]);
  return (
    <div className="est-frame">
      {/* 420 px until the estimator reports its real height */}
      <iframe ref={ref} data-ziya-target="estimate" src={listening ? src : undefined} title="Instant 3D printing estimate" style={{ height: h ?? 420 }} allow="" referrerPolicy="no-referrer-when-downgrade" />
    </div>
  );
}
