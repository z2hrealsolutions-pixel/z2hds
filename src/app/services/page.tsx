import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Cta from "@/components/Cta";
import Slides from "@/components/Slides";
import { SERVICES } from "@/data/services";
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
      </div></div>

      <div className="wrap">
        {SERVICES.map((s, i) => (
          <article className="svc-row" id={s.slug} key={s.slug}>
            <div>
              <span className="n">{String(i + 1).padStart(2, "0")}</span>
              <h2>{s.title}</h2>
              {s.studio && <Link className="studio-tag" href={s.studio.href}><span className="mark" aria-hidden="true" />{s.studio.name} <span>{s.studio.by}</span></Link>}
              <p>{s.long}</p>
              <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
              <div className="acts">
                <Link className="btn btn-primary" href={s.cta.href}>{s.cta.label}</Link>
                {s.more && <Link className="btn btn-ghost" href={s.more.href}>{s.more.label}</Link>}
              </div>
            </div>
            <div className="ph">
              {s.slides
                ? <Slides slides={s.slides} />
                : s.photo
                  ? <Image src={s.photo.src} alt={s.photo.alt} fill sizes="(max-width:900px) 100vw, 560px" style={{ objectFit: "cover", objectPosition: s.photo.pos ?? "50% 50%" }} />
                  : <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: "var(--band)", color: "var(--band-ink)" }}>
                      <span className="mark" style={{ height: 120, opacity: .9 }} aria-hidden="true" />
                    </div>}
            </div>
          </article>
        ))}
      </div>

      <Cta title="Have a project in mind?" text="Send a file, a photo or a sketch. We reply fast, and we are open 24 hours." />
    </>
  );
}
