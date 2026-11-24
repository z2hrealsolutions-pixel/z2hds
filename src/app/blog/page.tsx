import type { Metadata } from "next";
import Link from "next/link";
import Cta from "@/components/Cta";
import { fmtDate, getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog: 3D printing guides for Sri Lanka",
  description: "Guides from Z2H Design Studio in Maharagama: what 3D printing is, 3D printing machines, materials and filament, costs, file types, multi-colour printing and statues from photos.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  const posts = getPosts();
  return (
    <>
      <div className="phead"><div className="wrap">
        <div className="crumbs"><Link href="/">Home</Link> / Blog</div>
        <h1>Blog</h1>
      </div></div>
      <div className="wrap psec" style={{ paddingTop: 40 }}>
        <div className="blog-grid">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="post-card">
              <span className="meta">{fmtDate(p.date)} · {p.readMins} min read</span>
              <h2>{p.title}</h2>
              <p>{p.description}</p>
              <span className="go">Read the guide →</span>
            </Link>
          ))}
        </div>
      </div>
      <Cta />
    </>
  );
}
