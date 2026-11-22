"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { WaIcon } from "./Icons";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/estimate", label: "Instant estimate" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header({ waUrl, waLive }: { waUrl: string; waLive: boolean }) {
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  const on = (h: string) => (h === "/" ? path === "/" : path === h || path.startsWith(h + "/"));
  function toggleTheme() {
    const el = document.documentElement;
    const dark = el.getAttribute("data-theme") === "dark" || (!el.getAttribute("data-theme") && matchMedia("(prefers-color-scheme: dark)").matches);
    const next = dark ? "light" : "dark";
    el.setAttribute("data-theme", next);
    try { localStorage.setItem("z2h-theme", next); } catch {}
  }
  return (
    <nav className="top" aria-label="Main">
      <div className="wrap">
        <Link className="brand" href="/"><span className="mark" aria-hidden="true" />Z2H Design Studio</Link>
        <div className="links">
          {LINKS.map((l) => <Link key={l.href} href={l.href} className={on(l.href) ? "on" : ""} aria-current={on(l.href) ? "page" : undefined}>{l.label}</Link>)}
        </div>
        <div className="nav-cta">
          <button className="theme" type="button" onClick={toggleTheme} aria-label="Switch light or dark mode">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          </button>
          <a className="btn btn-ghost" href={waUrl} {...(waLive ? { target: "_blank", rel: "noopener" } : {})}><WaIcon />WhatsApp</a>
          <Link className="btn btn-primary" href="/estimate">Get a price</Link>
          <button className="menu-btn" type="button" aria-expanded={open} aria-controls="mm" aria-label="Menu" onClick={() => setOpen(!open)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
          </button>
        </div>
      </div>
      <div id="mm" className={"mobile-menu" + (open ? " open" : "")}>
        {LINKS.map((l) => <Link key={l.href} href={l.href} className={on(l.href) ? "on" : ""}>{l.label}</Link>)}
        <a href={waUrl} {...(waLive ? { target: "_blank", rel: "noopener" } : {})}>WhatsApp</a>
      </div>
    </nav>
  );
}
