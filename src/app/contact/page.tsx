import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";
import { SITE, waHref, waIsLive } from "@/lib/site";
import { WaIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Contact: visit, call or message Z2H Design Studio",
  description: "Z2H Design Studio, 6 Suramya Mawatha, Wattegedara, Maharagama, Sri Lanka. Open 24 hours. Call or WhatsApp +94 70 22 99 100, or email info@z2hdesignstudio.com.",
  alternates: { canonical: "/contact" },
};

const MAP_Q = encodeURIComponent("6 Suramya Mawatha, Wattegedara, Maharagama, Sri Lanka");

export default function ContactPage() {
  const live = waIsLive();
  return (
    <>
      <div className="phead"><div className="wrap">
        <div className="crumbs"><Link href="/">Home</Link> / Contact</div>
        <h1>Contact</h1>
        <p className="lead">Tell us what you are imagining.</p>
      </div></div>

      <div className="wrap psec" style={{ paddingTop: 40 }}>
        <div className="cgrid">
          <div className="ccard" id="whatsapp">
            <h2>WhatsApp</h2>
            {live
              ? <><p>The fastest way. Send a photo, a sketch or a file and tell us what you need.</p>
                  <div className="acts"><a className="btn btn-primary" href={waHref("Hello Z2H, I would like to talk about a project.")} target="_blank" rel="noopener"><WaIcon />Chat on WhatsApp</a></div></>
              : <><p className="big">Number coming soon</p><p>Our WhatsApp line is being set up. Until then, call or email us, or use the message form below.</p></>}
          </div>
          <div className="ccard">
            <h2>Call or email</h2>
            <a className="big" href={SITE.phoneHref}>{SITE.phone}</a>
            <a className="big" href={`mailto:${SITE.email}`} style={{ fontSize: 19 }}>{SITE.email}</a>
            <span className="hours"><span className="dot" />{SITE.hours}</span>
          </div>
          <div className="ccard">
            <h2>Visit</h2>
            <p className="big" style={{ fontSize: 20 }}>{SITE.addressLines[0]}<br />{SITE.addressLines[1]}</p>
            <p>Pick-up is from our studio in Maharagama.</p>
            <div className="acts"><a className="btn btn-ghost" href={`https://www.google.com/maps/search/?api=1&query=${MAP_Q}`} target="_blank" rel="noopener">Open in Google Maps</a></div>
          </div>
          <div className="ccard">
            <h2>Company</h2>
            <p>{SITE.legalName}</p>
            <p>Delivery by PickMe Flash or Uber.</p>
          </div>
        </div>

        <div className="map-box">
          <iframe title="Map of Z2H Design Studio, Maharagama" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={`https://www.google.com/maps?q=${MAP_Q}&output=embed`} />
        </div>
      </div>

      <section className="psec" id="form" style={{ paddingTop: 0 }}><div className="wrap">
        <div className="faq">
          <div>
            <span className="eyebrow">Send a message</span>
            <h2>What are you imagining?</h2>
            <p className="muted" style={{ marginTop: 16 }}>Fill this in and choose how to send it. The message opens in WhatsApp or in your email app, ready to send. We do not store what you type here.</p>
          </div>
          <ContactForm />
        </div>
      </div></section>
    </>
  );
}
