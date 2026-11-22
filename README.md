# Z2H Design Studio website

Public website for Z2H Design Studio. Separate from the operations app (z2h-ops).

- Next.js 15, React 19, no database.
- Pages: Home, Services, Gallery, Instant estimate, Contact, Blog (`content/blog/*.md`).
- Instant estimate: shown in a frame from the ops app (`NEXT_PUBLIC_ESTIMATE_URL`, default `https://z2h-ops.vercel.app/estimate`).
- Facts (phone, address, WhatsApp, social links): `src/lib/site.ts`.
- Services and materials: `src/data/services.ts`. Gallery photos: `src/data/gallery.json`, files in `public/photos`.
- Blog posts: add a markdown file in `content/blog` with `title`, `description`, `date`, `answer`, `tags` at the top.
- Fonts (Big Shoulders Stencil Display, Big Shoulders Display, Instrument Sans) are in `public/fonts`.

Settings (Vercel environment variables):

| Name | Use |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Final address, for the sitemap and search tags |
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp number, digits only, e.g. 94706760506 |
| `NEXT_PUBLIC_ESTIMATE_URL` | Address of the instant estimate page |
| `NEXT_PUBLIC_NOINDEX` | Set to `1` on the test site so search engines stay away. Remove at go-live |

Run: `npm install`, then `npm run dev`. Check: `npm run typecheck` and `npm run build`.
