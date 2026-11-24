import type { Metadata } from "next";
import Link from "next/link";
import Cta from "@/components/Cta";
import GalleryGrid from "./GalleryGrid";
import gallery from "@/data/gallery.json";

export const metadata: Metadata = {
  title: "Gallery: 3D printed statues, gifts and prototypes",
  description: "Recent work from Z2H Design Studio in Maharagama: prototypes, CAD models and simulations, portrait statues and busts, and unique gifts.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <div className="phead"><div className="wrap">
        <div className="crumbs"><Link href="/">Home</Link> / Gallery</div>
        <h1>Made at Z2H</h1>
      </div></div>
      <div className="wrap psec" style={{ paddingTop: 36 }}>
        <GalleryGrid items={gallery} />
      </div>
      <Cta title="Want something like this?" />
    </>
  );
}
