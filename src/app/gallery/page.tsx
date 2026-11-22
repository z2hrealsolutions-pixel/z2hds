import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import Cta from "@/components/Cta";
import GalleryGrid from "./GalleryGrid";
import gallery from "@/data/gallery.json";

export const metadata: Metadata = {
  title: "Gallery: 3D printed statues, gifts and prototypes",
  description: "Recent work from Z2H Design Studio in Maharagama: portrait statues and busts, light-up letters, vases and gifts, and prototypes and working parts.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <>
      <div className="phead"><div className="wrap">
        <div className="crumbs"><Link href="/">Home</Link> / Gallery</div>
        <h1>Made at Z2H</h1>
        <p className="lead">{gallery.length} recent jobs from our three studios. Tap a photo to see it larger.</p>
      </div></div>
      <div className="wrap psec" style={{ paddingTop: 36 }}>
        <Suspense fallback={null}><GalleryGrid items={gallery} /></Suspense>
      </div>
      <Cta title="Want something like this?" />
    </>
  );
}
