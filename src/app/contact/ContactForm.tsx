"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { SITE } from "@/lib/site";

const TOPICS: Record<string, string> = {
  print: "3D printing",
  figurine: "Custom figurine",
  cad: "3D modelling and CAD",
  electronics: "Electronics and embedded product",
  simulation: "Simulation and analysis",
  laser: "Laser cutting and engraving",
  bulk: "Bulk order, business or school",
  other: "Something else",
};

const field: React.CSSProperties = { font: "inherit", width: "100%", padding: "13px 14px", border: "1px solid var(--line)", borderRadius: 12, background: "var(--surface)", color: "var(--ink)" };
const label: React.CSSProperties = { display: "grid", gap: 6, fontSize: 14, fontWeight: 600, minWidth: 0 };

export default function ContactForm() {
  const sp = useSearchParams();
  const t = sp.get("topic");
  const [topic, setTopic] = useState(t && TOPICS[t] ? t : "print");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [msg, setMsg] = useState("");

  const body = () => `Hello Z2H, I am ${name || "(name)"}.\nTopic: ${TOPICS[topic]}\n\n${msg || "(tell us about your project)"}\n\nMy phone: ${phone || "(phone)"}`;
  const ok = name.trim().length > 1 && msg.trim().length > 4;
  const mail = `mailto:${SITE.email}?subject=${encodeURIComponent("Enquiry: " + TOPICS[topic])}&body=${encodeURIComponent(body())}`;
  const wa = SITE.whatsapp ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(body())}` : "";

  return (
    <form style={{ display: "grid", gap: 16, minWidth: 0 }} onSubmit={(e) => e.preventDefault()} aria-label="Message form">
      <label style={label}>Your name<input style={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label>
      <label style={label}>Phone number<input style={field} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" /></label>
      <label style={label}>What is it about?
        <select style={field} value={topic} onChange={(e) => setTopic(e.target.value)}>
          {Object.entries(TOPICS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label style={label}>Tell us about it<textarea style={{ ...field, minHeight: 140, resize: "vertical" }} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="What do you want made? Size, colour, how many, and when you need it." required /></label>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {wa
          ? <a className="btn btn-primary" href={ok ? wa : undefined} aria-disabled={!ok} target="_blank" rel="noopener" style={ok ? undefined : { opacity: .45, pointerEvents: "none" }}>Send on WhatsApp</a>
          : <span className="btn btn-ghost" style={{ opacity: .6 }} title="WhatsApp number coming soon">WhatsApp: coming soon</span>}
        <a className="btn btn-primary" href={ok ? mail : undefined} aria-disabled={!ok} style={ok ? undefined : { opacity: .45, pointerEvents: "none" }}>Send by email</a>
      </div>
      <p className="soon">Add your photos or files after the message opens, in WhatsApp or in your email.</p>
    </form>
  );
}
