import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import Cta from "@/components/Cta";
import { SITE, waHref, waIsLive } from "@/lib/site";

export const metadata: Metadata = {
  title: "Instant 3D printing estimate: upload a file, see the price",
  description: "Upload an STL, 3MF or OBJ file and see a 3D printing price range in seconds. No sign-up. Z2H Design Studio, Maharagama, Sri Lanka.",
  alternates: { canonical: "/estimate" },
};

export default function EstimatePage() {
  const src = `${SITE.estimateUrl}?embed=1`;
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebApplication", name: "Z2H instant 3D printing estimate", url: `${SITE.url}/estimate`, applicationCategory: "BusinessApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "LKR" }, provider: { "@id": `${SITE.url}/#business` } }} />
      <div className="phead"><div className="wrap">
        <div className="crumbs"><Link href="/">Home</Link> / Instant estimate</div>
        <h1>Instant estimate</h1>
        <p className="lead">Upload your 3D file and see a price range in seconds. No sign-up, and nobody to wait for.</p>
      </div></div>

      <div className="wrap psec" style={{ paddingTop: 40 }}>
        <div className="est-side">
          <div><span className="n">01</span><b>Upload</b><p>An STL, 3MF or OBJ file. Choose the material and how many you need.</p></div>
          <div><span className="n">02</span><b>See the range</b><p>Turn your model in 3D and see the size, the print time and the price range.</p></div>
          <div><span className="n">03</span><b>Confirm</b><p>Send it to us on WhatsApp. We check the file and give you the final price.</p></div>
        </div>

        <div className="est-frame">
          <iframe src={src} title="Instant 3D printing estimate" loading="lazy" allow="" referrerPolicy="no-referrer-when-downgrade" />
        </div>
        <p className="soon" style={{ marginTop: 14 }}>Estimator not loading? <a href={`${SITE.estimateUrl}`} target="_blank" rel="noopener" style={{ color: "var(--accent-text)", textDecoration: "underline" }}>Open it in its own page</a>.</p>

        <div className="note-box">
          <b>What the price range includes.</b> Printing, material and finishing, with our usual quantity discounts. Delivery, rush jobs, and design or modelling work are extra. We confirm everything on WhatsApp before you pay anything.
        </div>
        <div className="note-box" style={{ marginTop: 14 }}>
          <b>No 3D file?</b> That is fine. Send a photo, a sketch or just a description on{" "}
          <a href={waHref("Hello Z2H, I do not have a 3D file yet. Can you help?")} {...(waIsLive() ? { target: "_blank", rel: "noopener" } : {})} style={{ color: "var(--accent-text)", textDecoration: "underline" }}>WhatsApp</a>{" "}
          or on the <Link href="/contact" style={{ color: "var(--accent-text)", textDecoration: "underline" }}>contact page</Link>. We can model it for you.
        </div>
      </div>
      <Cta />
    </>
  );
}
