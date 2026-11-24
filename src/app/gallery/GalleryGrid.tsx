"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Item = { slug: string; src: string; cat: string; alt: string; title: string; w: number; h: number };
const CATS = [
  { key: "all", label: "All" },
  { key: "design", label: "Design Studio" },
  { key: "realities", label: "Realities" },
  { key: "uniqs", label: "UniQs" },
];
const NAME: Record<string, string> = { design: "Design Studio", realities: "Realities", uniqs: "UniQs" };
const FULL: Record<string, string> = { design: "Design Studio by Z2H", realities: "Realities by Z2H DS", uniqs: "UniQs by Z2H DS" };

export default function GalleryGrid({ items }: { items: Item[] }) {
  const [cat, setCat] = useState("all");
  // read ?studio= after load, so the full gallery is in the page as sent by the server
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get("studio");
    if (s && CATS.some((c) => c.key === s)) setCat(s);
  }, []);
  const [open, setOpen] = useState<number | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const ORDER = CATS.slice(1).map((c) => c.key);
  const shown = (cat === "all" ? items : items.filter((i) => i.cat === cat)).slice().sort((a, b) => ORDER.indexOf(a.cat) - ORDER.indexOf(b.cat));

  useEffect(() => {
    const d = dlg.current;
    if (!d) return;
    if (open !== null && !d.open) d.showModal();
    if (open === null && d.open) d.close();
  }, [open]);

  const step = (n: number) => setOpen((o) => (o === null ? o : (o + n + shown.length) % shown.length));
  const cur = open !== null ? shown[open] : null;

  return (
    <>
      <div className="filters" role="group" aria-label="Filter by studio">
        {CATS.map((c) => <button key={c.key} type="button" className={cat === c.key ? "on" : ""} aria-pressed={cat === c.key} onClick={() => setCat(c.key)}>{c.label}</button>)}
      </div>
      {(cat === "all" ? CATS.slice(1).map((c) => c.key) : [cat]).map((key) => (
        <section key={key} className="gal-sec" aria-label={NAME[key]}>
          {cat === "all" && <h2 className="gal-h">{FULL[key]}</h2>}
          <div className="grid">
            {shown.map((p, i) => p.cat !== key ? null : (
              <figure key={p.slug}>
                <button type="button" onClick={() => setOpen(i)} aria-label={`View larger: ${p.title}`}>
                  <Image src={p.src} alt={p.alt} width={p.w} height={p.h} sizes="(max-width:900px) 50vw, 25vw" loading={i < 8 ? "eager" : "lazy"} />
                </button>
                <figcaption><small>{NAME[p.cat]}</small>{p.title}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      ))}
      <dialog ref={dlg} className="lb" onClose={() => setOpen(null)} onClick={(e) => { if (e.target === dlg.current) setOpen(null); }} aria-label="Photo viewer">
        {cur && (
          <div className="box">
            <Image src={cur.src} alt={cur.alt} width={cur.w} height={cur.h} sizes="96vw" priority />
            <div className="cap"><small>{NAME[cur.cat]}</small>{cur.title}</div>
            <div className="bar">
              <button type="button" onClick={() => step(-1)}>Previous</button>
              <button type="button" onClick={() => step(1)}>Next</button>
              <button type="button" onClick={() => setOpen(null)}>Close</button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
