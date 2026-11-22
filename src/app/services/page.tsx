import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Cta from "@/components/Cta";
import { SERVICES, MATERIALS } from "@/data/services";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services: 3D printing, figurines, CAD, electronics, laser cutting",
  description: "3D printing in single and multi-colour, custom figurines, 3D modelling and CAD, electronics and embedded product development, simulation and analysis, and laser cutting in Maharagama, Sri Lanka.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ItemList", itemListElement: SERVICES.map((s, i) => ({ "@type": "ListItem", position: i + 1, item: { "@type": "Service", name: s.title, description: s.long, provider: { "@id": `${SITE.url}/#business` }, url: `${SITE.url}/services#${s.slug}` } })) }} />
      <div className="phead"><div className="wrap">
        <div className="crumbs"><Link href="/">Home</Link> / Services</div>
        <h1>Services</h1>
        <p className="lead">Six ways we turn your imagination into a finished part. Use one, or combine them in a single project.</p>
      </div></div>

      <div className="wrap">
        {SERVICES.map((s, i) => (
          <article className="svc-row" id={s.slug} key={s.slug}>
            <div>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <h2>{s.title}</h2>
              <p>{s.long}</p>
              <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              <div className="acts">
                <Link className="btn btn-primary" href={s.cta.href}>{s.cta.label}</Link>
              </div>
            </div>
            <div className="ph">
              {s.photo
                ? <Image src={s.photo.src} alt={s.photo.alt} fill sizes="(max-width:900px) 100vw, 560px" style={{ objectFit: "cover", objectPosition: s.photo.pos ?? "50% 50%" }} />
                : <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "var(--band)", color: "var(--band-ink)" }}>
                    <span className="mark" style={{ height: 120, opacity: .9 }} aria-hidden="true" />
                  </div>}
            </div>
          </article>
        ))}
      </div>

      <section className="psec" style={{ paddingTop: 24 }}><div className="wrap">
        <div className="head">
          <div><span className="eyebrow">Materials</span><h2>Five materials, one for every job.</h2></div>
          <p>Not sure which to choose? Tell us what the part will do and we will suggest one.</p>
        </div>
        <div className="tbl-wrap">
          <table className="mat-table">
            <thead><tr><th>Material</th><th>Good for</th></tr></thead>
            <tbody>{MATERIALS.map((m) => <tr key={m.name}><td>{m.name}</td><td>{m.use}</td></tr>)}</tbody>
          </table>
        </div>
      </div></section>

      <Cta title="Have a project in mind?" text="Send a file, a photo or a sketch. We reply fast, and we are open 24 hours." />
    </>
  );
}
