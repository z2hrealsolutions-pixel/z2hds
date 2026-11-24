import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/services", "/services/materials", "/gallery", "/estimate", "/blog", "/contact"].map((p) => ({ url: SITE.url + p, changeFrequency: "monthly" as const, priority: p === "" ? 1 : 0.8 }));
  const posts = getPosts().map((p) => ({ url: `${SITE.url}/blog/${p.slug}`, lastModified: p.updated ?? p.date, changeFrequency: "yearly" as const, priority: 0.6 }));
  return [...pages, ...posts];
}
