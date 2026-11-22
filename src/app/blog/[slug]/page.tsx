import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/components/JsonLd";
import Cta from "@/components/Cta";
import { fmtDate, getPost, getPosts } from "@/lib/blog";
import { SITE } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return getPosts().map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", title: p.title, description: p.description, publishedTime: p.date, modifiedTime: p.updated ?? p.date },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const p = getPost(slug);
  if (!p) notFound();
  const url = `${SITE.url}/blog/${p.slug}`;
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.description,
        datePublished: p.date, dateModified: p.updated ?? p.date, mainEntityOfPage: url, url,
        author: { "@type": "Organization", name: SITE.name, url: SITE.url }, publisher: { "@id": `${SITE.url}/#business` },
        image: `${SITE.url}/photos/realities-multicolour-bust-on-plinth.webp`, inLanguage: "en",
      }} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url }, { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE.url}/blog` }, { "@type": "ListItem", position: 3, name: p.title, item: url } ] }} />
      <div className="phead" style={{ borderBottom: 0, paddingBottom: 0 }}><div className="wrap"><div className="article">
        <div className="crumbs"><Link href="/">Home</Link> / <Link href="/blog">Blog</Link></div>
        <h1 style={{ fontSize: "clamp(38px,5.6vw,72px)" }}>{p.title}</h1>
        <div className="byline"><span>By Z2H Design Studio</span><span>{fmtDate(p.date)}</span><span>{p.readMins} min read</span></div>
      </div></div></div>
      <div className="wrap psec" style={{ paddingTop: 8 }}>
        <article className="article">
          {p.answer && <div className="answer"><b>The short answer</b>{p.answer}</div>}
          <div className="prose" dangerouslySetInnerHTML={{ __html: p.html }} />
        </article>
        <div className="article post-cta">
          <div className="note-box"><b>Want a price for your own part?</b> Upload your file to the <Link href="/estimate" style={{ color: "var(--accent-text)", textDecoration: "underline" }}>instant estimate</Link>, or <Link href="/contact" style={{ color: "var(--accent-text)", textDecoration: "underline" }}>send us a message</Link>. We are open 24 hours.</div>
        </div>
      </div>
      <Cta />
    </>
  );
}
