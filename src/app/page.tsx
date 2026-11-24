import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Cta from "@/components/Cta";
import { ArrowIcon, WaIcon } from "@/components/Icons";
import { FAQ } from "@/lib/faq";
import { SERVICES, MATERIAL_NAMES } from "@/data/services";
import gallery from "@/data/gallery.json";
import { waHref, waIsLive } from "@/lib/site";

const P = (slug: string) => gallery.find((g) => g.slug === slug)!;
const home8 = ["realities-wedding-couple-statues", "uniqs-twisted-knot-vases", "design-wireframe-structure", "realities-cosplay-creature-prop", "uniqs-masquerade-mask-events", "realities-couple-statue-display-case", "design-flexible-tpu-geometric-shell", "uniqs-planter-pot-with-legs"].map(P);
const catName: Record<string, string> = { realities: "Realities", uniqs: "UniQs", design: "Design Studio" };

export default function Home() {
  const wa = waHref("Hello Z2H, I would like to talk about a project.");
  const waProps = waIsLive() ? { target: "_blank", rel: "noopener" } : {};
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }} />
      <header className="hero"><div className="wrap">
        <div className="hero-head">
          <span className="eyebrow">3D printing · 3D modelling · Product development</span>
          <h1>Imagination<br />to <em>Reality.</em></h1>
        </div>
        <div className="hero-copy">
          <p className="lead">Searching for 3D printing near me? We design and 3D print prototypes, working parts, custom statues, and unique gifts in Maharagama, Sri Lanka. Upload a file for a price range in seconds, or share your imagination with us on WhatsApp and we will make it a reality.</p>
          <div className="ctas">
            <Link className="btn btn-primary" href="/estimate">Get an instant price <ArrowIcon /></Link>
            <a className="btn btn-ghost" href={wa} {...waProps}><WaIcon />Chat on WhatsApp</a>
            <Link className="btn btn-text" href="/gallery">See our work</Link>
          </div>
          <div className="facts">
            <div><b>24 hours</b>open, every day</div>
            <div><b>Multi-colour</b>printing in one part</div>
            <div><b>STL · 3MF · OBJ</b>priced in seconds</div>
          </div>
        </div>
        <div className="mosaic">
          <figure className="tall"><Image src="/photos/design-robotic-hand-prototype.webp" alt="Black 3D printed robotic hand prototype next to a human hand" fill priority sizes="(max-width:900px) 55vw, 400px" /><figcaption>Robotic hand prototype</figcaption></figure>
          <figure><Image src="/photos/realities-multicolour-bust-on-plinth.webp" alt="Multi-colour 3D printed bust of a man in a suit and red tie, on a black plinth" fill priority sizes="(max-width:900px) 45vw, 340px" style={{ objectPosition: "50% 30%" }} /><figcaption>Multi-colour bust</figcaption></figure>
          <figure><Image src="/photos/uniqs-light-up-letters-ttj.webp" alt="3D printed light-up letters spelling TTJ, glowing warm white" fill sizes="(max-width:900px) 45vw, 340px" /><figcaption>Light-up letters</figcaption></figure>
        </div>
      </div></header>

      <div className="mats"><div className="wrap">
        <Link href="/services/materials" className="mats-link">Materials we print in</Link>
        {MATERIAL_NAMES.map((m) => <span key={m} className="chip">{m}</span>)}
        <span className="push">Pick up in Maharagama, or delivery by PickMe Flash or Uber</span>
      </div></div>

      <section><div className="wrap">
        <div className="head">
          <div><span className="eyebrow">Three stories, one team</span><h2>Whatever you are making, start here.</h2></div>
        </div>
        <div className="brands">
          <Link className="brand-card" href="/gallery?studio=design">
            <div className="img" style={{ position: "relative" }}><Image src="/photos/design-custom-jig-bracket.webp" alt="Black 3D printed jig bracket, a functional part designed in CAD" fill sizes="(max-width:900px) 100vw, 400px" style={{ objectFit: "cover" }} /></div>
            <div className="body"><span className="tag">Engineering</span><h3>Design Studio <span>by Z2H</span></h3><p>CAD modelling, prototypes, jigs and product development by mechatronics engineers, from a sketch to a part that works.</p><span className="go">See Design Studio →</span></div>
          </Link>
          <Link className="brand-card" href="/gallery?studio=realities">
            <div className="img" style={{ position: "relative" }}><Image src="/photos/realities-50cm-statue-scales-of-justice.webp" alt="50 cm single-colour 3D printed statue of a man holding the scales of justice" fill sizes="(max-width:900px) 100vw, 400px" style={{ objectFit: "cover", objectPosition: "50% 35%" }} /></div>
            <div className="body"><span className="tag">Statues and figurines</span><h3>Realities <span>by Z2H DS</span></h3><p>Personal statues, busts and figurines made from your photos, in one colour or many, up to 50 cm tall and beyond.</p><span className="go">See Realities →</span></div>
          </Link>
          <Link className="brand-card" href="/gallery?studio=uniqs">
            <div className="img" style={{ position: "relative" }}><Image src="/photos/uniqs-spiral-textured-vase.webp" alt="Brown 3D printed vase with a spiral lattice texture" fill sizes="(max-width:900px) 100vw, 400px" style={{ objectFit: "cover" }} /></div>
            <div className="body"><span className="tag">Everyday design</span><h3>UniQs <span>by Z2H DS</span></h3><p>Lamps, vases, planters, key tags, organisers and gifts that you will not find in a shop, made to your size and colour.</p><span className="go">See UniQs →</span></div>
          </Link>
        </div>
      </div></section>

      <section style={{ paddingTop: 0 }}><div className="wrap">
        <div className="head">
          <div><span className="eyebrow">Services</span><h2>Everything from imagination to the finished part.</h2></div>
        </div>
        <div className="svc">
          {SERVICES.map((s, i) => (
            <Link key={s.slug} href={`/services#${s.slug}`} style={{ display: "contents" }}>
              <div><span className="n">{String(i + 1).padStart(2, "0")}</span><h3 dangerouslySetInnerHTML={{ __html: s.homeTitle ?? s.title }} /><p>{s.short}</p></div>
            </Link>
          ))}
        </div>
      </div></section>

      <section style={{ paddingTop: 0 }}><div className="wrap">
        <div className="band">
          <div>
            <span className="eyebrow">Instant estimate</span>
            <h2>Know the price before you message us.</h2>
            <p>No sign ups, no waiting, get your estimate right away.</p>
            <ol>
              <li><b>1</b><span>Upload an STL, 3MF or OBJ file, choose the material and how many you need.</span></li>
              <li><b>2</b><span>Turn your model in 3D and see the price range in seconds.</span></li>
              <li><b>3</b><span>Get the confirmation on WhatsApp</span></li>
            </ol>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}><Link className="btn btn-primary" href="/estimate">Try the instant estimate</Link><a className="btn btn-ghost" href={wa} {...waProps}>No file? Chat with us</a></div>
          </div>
          <div className="est">
            <div className="view">
              <img className="vase3d" src="/img/vase-4-colour.webp" alt="3D view of a four-colour 3D printed vase, as shown by the instant estimate" width={361} height={560} />
              <span className="mark wm" aria-hidden="true" />
            </div>
            <div className="rng"><div><small>Price range, 1 piece</small><strong>LKR 9,600 – 14,600</strong></div><span className="chip" style={{ background: "#1F2B42", color: "#EEF3FF", borderColor: "#2A3850" }}>PLA, basic finish</span></div>
            <div className="meta"><div><b>4</b>colours</div><div><b>189 g</b>filament</div><div><b>12.9 h</b>print time</div></div>
          </div>
        </div>
      </div></section>

      <section style={{ paddingTop: 0 }}><div className="wrap">
        <div className="head">
          <div><span className="eyebrow">Gallery</span><h2>Made at Z2H.</h2></div>
        </div>
        <div className="filters">
          <Link href="/gallery"><span className="on" style={{ padding: "9px 16px", borderRadius: 999, border: "1px solid var(--ink)", background: "var(--ink)", color: "var(--bg)", fontSize: 14, fontWeight: 600 }}>All</span></Link>
          <Link href="/gallery?studio=design"><span>Design Studio</span></Link>
          <Link href="/gallery?studio=realities"><span>Realities</span></Link>
          <Link href="/gallery?studio=uniqs"><span>UniQs</span></Link>
        </div>
        <div className="grid">
          {home8.map((p) => (
            <figure key={p.slug}>
              <Link href="/gallery"><Image src={p.src} alt={p.alt} width={p.w} height={p.h} sizes="(max-width:900px) 50vw, 25vw" style={{ width: "100%", height: "auto" }} /></Link>
              <figcaption><small>{catName[p.cat]}</small>{p.title}</figcaption>
            </figure>
          ))}
        </div>
        <div className="center"><Link className="btn btn-ghost" href="/gallery">See the full gallery</Link></div>
      </div></section>

      <section style={{ paddingTop: 0 }}><div className="wrap">
        <div className="biz">
          <div className="ph"><Image src="/photos/realities-batch-king-busts.webp" alt="A batch of identical 3D printed king busts, printed for a bulk order" fill sizes="(max-width:900px) 100vw, 560px" style={{ objectFit: "cover" }} /><span className="tagline">Bulk order, printed and checked one by one</span></div>
          <div>
            <span className="eyebrow">For businesses and schools</span>
            <h2>Bulk orders, branded gifts and prototypes.</h2>
            <p className="muted" style={{ fontSize: 17 }}>Startups, companies, schools and universities work with us for batches that look the same from the first piece to the last, and for parts that have to work.</p>
            <ul>
              <li><b>Batch printing</b><span>Tens to hundreds of the same part.</span></li>
              <li><b>Awards and corporate gifts</b><span>Trophies, logos and keepsakes with your branding.</span></li>
              <li><b>Prototypes for startups</b><span>From the first model to a version you can test.</span></li>
              <li><b>Schools and universities</b><span>Student projects, models and lab parts.</span></li>
            </ul>
            <Link className="btn btn-primary" href="/contact?topic=bulk#form">Talk to us about a bulk order</Link>
          </div>
        </div>
      </div></section>

      <section style={{ paddingTop: 0 }}><div className="wrap">
        <div className="head"><div><span className="eyebrow">How it works</span><h2>From your imagination to your door.</h2></div></div>
        <div className="steps">
          <div><h3>Share your imagination</h3><p>Upload a file, or send a photo or sketch on WhatsApp.</p></div>
          <div><h3>Get your price</h3><p>See a range at once, then a final price after we check the file.</p></div>
          <div><h3>Pay the deposit</h3><p>50% to start printing. Bank transfer or cash.</p></div>
          <div><h3>We print and check</h3><p>Cleaned, finished and checked against your file before packing.</p></div>
          <div><h3>Collect or deliver</h3><p>Pick up in Maharagama, or delivery by PickMe Flash or Uber. Pay the balance before it leaves.</p></div>
        </div>
      </div></section>

      <section style={{ paddingTop: 0 }}><div className="wrap">
        <div className="faq">
          <div><span className="eyebrow">Questions</span><h2>Good to know.</h2><p className="muted" style={{ marginTop: 16 }}>Something else? Message us on WhatsApp. We are open 24 hours.</p></div>
          <div className="qa">
            {FAQ.map((f, i) => <details key={f.q} open={i === 0}><summary>{f.q}</summary><p>{f.a}</p></details>)}
          </div>
        </div>
      </div></section>

      <Cta />
    </>
  );
}
