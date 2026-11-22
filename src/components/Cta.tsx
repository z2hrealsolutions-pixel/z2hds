import Link from "next/link";
import { waHref, waIsLive } from "@/lib/site";
import { WaIcon } from "./Icons";

export default function Cta({ title = "What are you imagining?", text = "Upload a file for a price in seconds, or tell us about it on WhatsApp." }: { title?: string; text?: string }) {
  return (
    <div className="wrap" style={{ marginTop: 40 }}>
      <div className="cta">
        <div><h2>{title}</h2><p>{text}</p></div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn btn-primary" href="/estimate">Get an instant price</Link>
          <a className="btn btn-ghost" href={waHref("Hello Z2H, I would like to talk about a project.")} {...(waIsLive() ? { target: "_blank", rel: "noopener" } : {})}><WaIcon />Chat on WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
