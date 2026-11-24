import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  const socials = Object.entries(SITE.social).filter(([, v]) => v);
  return (
    <footer>
      <div className="wrap">
        <div className="fgrid">
          <div>
            <Link className="brand" href="/"><span className="mark" aria-hidden="true" />Z2H Design Studio</Link>
            <p className="small" style={{ marginTop: 14, maxWidth: "22em" }}>3D printing, 3D modelling and product development in Maharagama, Sri Lanka.</p>
            <p className="small" style={{ marginTop: 14 }}>{SITE.legalName}</p>
          </div>
          <div>
            <h4>Visit</h4>
            <ul><li>{SITE.addressLines[0]}<br />{SITE.addressLines[1]}</li><li className="small">{SITE.hours}</li></ul>
          </div>
          <div>
            <h4>Talk to us</h4>
            <ul>
              <li><a href={SITE.phoneHref}>{SITE.phone}</a></li>
              <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
              {socials.length > 0
                ? <li className="small">{socials.map(([k, v], i) => <span key={k}>{i > 0 && " · "}<a href={v} target="_blank" rel="noopener">{k[0].toUpperCase() + k.slice(1)}</a></span>)}</li>
                : <li className="small">Social links coming soon</li>}
            </ul>
          </div>
          <div>
            <h4>Explore</h4>
            <div className="fl">
              <Link href="/services">Services</Link><Link href="/gallery">Gallery</Link><Link href="/estimate">Instant estimate</Link><Link href="/blog">Blog</Link><Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>
        <div className="legal"><span>© {new Date().getFullYear()} {SITE.legalName}</span><span>3D printing in Maharagama, Sri Lanka</span></div>
      </div>
    </footer>
  );
}
