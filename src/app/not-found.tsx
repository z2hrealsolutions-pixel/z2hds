import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap psec" style={{ textAlign: "center", padding: "120px 16px" }}>
      <span className="eyebrow">Page not found</span>
      <h1 style={{ fontSize: "clamp(48px,9vw,120px)", textTransform: "uppercase", margin: "12px 0" }}>Lost in the print</h1>
      <p className="muted" style={{ marginBottom: 28 }}>That page does not exist. Try one of these instead.</p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link className="btn btn-primary" href="/">Home</Link><Link className="btn btn-ghost" href="/services">Services</Link><Link className="btn btn-ghost" href="/estimate">Instant estimate</Link>
      </div>
    </div>
  );
}
