"use client";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Item = { slug: string; src: string; cat: string; alt: string; title: string; w: number; h: number };
const CATS = [
  { key: "all", label: "All" },
  { key: "realities", label: "Realities" },
  { key: "lifestyles", label: "Unique Lifestyles" },
  { key: "design", label: "Design Studio" },
];
const NAME: Record<string, string> = { realities: "Realities", lifestyles: "Unique Lifestyles", design: "Design Studio" };

export default function GalleryGrid({ items }: { items: Item[] }) {
  const sp = useSearchParams();
  const initial = sp.get("studio");
  const [cat, setCat] = useState(CATS.some((c) => c.key === initial) ? (initial as string) : "all");
  const [open, setOpen] = useState<number | null>(null);
  const dlg = useRef<HTMLDialogElement>(null);
  const shown = cat === "all" ? items : items.filter((i) => i.cat === cat);

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
      <div className="grid">
        {shown.map((p, i) => (
          <figure key={p.slug}>
            <button type="button" onClick={() => setOpen(i)} aria-label={`View larger: ${p.title}`}>
              <Image src={p.src} alt={p.alt} width={p.w} height={p.h} sizes="(max-width:900px) 50vw, 25vw" loading={i < 8 ? "eager" : "lazy"} />
            </button>
            <figcaption><small>{NAME[p.cat]}</small>{p.title}</figcaption>
          </figure>
        ))}
      </div>
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
