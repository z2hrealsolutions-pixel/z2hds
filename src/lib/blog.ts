import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";

export type Post = { slug: string; title: string; description: string; date: string; updated?: string; answer: string; readMins: number; html: string; tags: string[] };

const DIR = path.join(process.cwd(), "content", "blog");

function parse(raw: string): { meta: Record<string, string>; body: string } {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  return { meta, body: m[2] };
}

export function getPosts(): Post[] {
  if (!fs.existsSync(DIR)) return [];
  return fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).map((f) => {
    const { meta, body } = parse(fs.readFileSync(path.join(DIR, f), "utf8"));
    const words = body.split(/\s+/).length;
    return {
      slug: f.replace(/\.md$/, ""),
      title: meta.title ?? f,
      description: meta.description ?? "",
      date: meta.date ?? "2026-11-23",
      updated: meta.updated,
      answer: meta.answer ?? "",
      tags: (meta.tags ?? "").split(",").map((t) => t.trim()).filter(Boolean),
      readMins: Math.max(2, Math.round(words / 200)),
      html: marked.parse(body, { async: false }) as string,
    };
  }).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);
export const fmtDate = (d: string) => new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
