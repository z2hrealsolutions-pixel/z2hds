"use client";
import Image from "next/image";
import { useState } from "react";

type Slide = { src: string; alt: string; caption: string };

// A small slideshow for the services page. Images are shown whole (not cropped), because they are screenshots with a colour scale.
export default function Slides({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const go = (n: number) => setI((i + n + slides.length) % slides.length);
  const cur = slides[i];
  return (
    <div className="slides" aria-roledescription="slideshow" aria-label="Simulation examples">
      {slides.map((s, k) => (
        <Image key={s.src} src={s.src} alt={s.alt} fill sizes="(max-width:900px) 100vw, 560px" className={k === i ? "on" : ""} aria-hidden={k !== i} priority={k === 0} />
      ))}
      <div className="slides-bar">
        <button type="button" onClick={() => go(-1)} aria-label="Previous image">‹</button>
        <span className="slides-cap" aria-live="polite">{cur.caption}</span>
        <span className="slides-dots">{slides.map((s, k) => <button key={s.src} type="button" className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`Show image ${k + 1}`} aria-current={k === i} />)}</span>
        <button type="button" onClick={() => go(1)} aria-label="Next image">›</button>
      </div>
    </div>
  );
}
