"use client";
import { useEffect, useState, type ComponentType } from "react";

// Loads Ziya after the page is up, so he never slows down the first paint.
export default function ZiyaMount() {
  const [C, setC] = useState<ComponentType | null>(null);
  useEffect(() => { let on = true; import("./Ziya").then((m) => { if (on) setC(() => m.default); }); return () => { on = false; }; }, []);
  return C ? <C /> : null;
}
