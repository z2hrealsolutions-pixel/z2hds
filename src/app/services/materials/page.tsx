import type { Metadata } from "next";
import Link from "next/link";
import Cta from "@/components/Cta";
import { MATERIALS } from "@/data/services";

export const metadata: Metadata = {
  title: "3D printing materials: PLA, PETG, ABS/ASA, TPU and more",
  description: "The 3D printing materials Z2H Design Studio prints in, in Maharagama: PLA+, PLA, PLA variants, PETG, PETG variants, ABS/ASA, TPU and Lightweight PLA, and what each is good for.",
  alternates: { canonical: "/services/materials" },
};

export default function MaterialsPage() {
  return (
    <>
      <div className="phead"><div className="wrap">
        <div className="crumbs"><Link href="/">Home</Link> / <Link href="/services">Services</Link> / <Link href="/services#3d-printing">3D printing</Link> / Materials</div>
        <h1>Materials</h1>
        <p className="lead">The plastics we 3D print in, and what each one is good for. Not sure which to choose? Tell us what the part will do and we will suggest one.</p>
      </div></div>

      <div className="wrap psec" style={{ paddingTop: 40 }}>
        <div className="tbl-wrap">
          <table className="mat-table">
            <thead><tr><th>Material</th><th>Good for</th></tr></thead>
            <tbody>{MATERIALS.map((m) => <tr key={m.name}><td>{m.name}</td><td>{m.use}</td></tr>)}</tbody>
          </table>
        </div>
        <div className="note-box">
          <b>Want to know more?</b> Read our guides to <Link href="/blog/3d-printing-materials-and-filament" style={{ color: "var(--accent-text)", textDecoration: "underline" }}>3D printing materials and filament</Link> and <Link href="/blog/pla-petg-abs-tpu-which-3d-printing-material" style={{ color: "var(--accent-text)", textDecoration: "underline" }}>which material to choose</Link>.
        </div>
      </div>

      <Cta title="Ready to print?" text="Upload a file and choose a material to see the price range, or ask us on WhatsApp." />
    </>
  );
}
