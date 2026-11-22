import { getPosts } from "@/lib/blog";
import { SERVICES } from "@/data/services";
import { SITE } from "@/lib/site";

export const dynamic = "force-static";

// A plain-text summary of the studio for AI assistants and search tools.
export function GET() {
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.name} is a 3D printing and product design studio in Maharagama, Sri Lanka. It prints in single and multi-colour, makes custom figurines from photos, and offers 3D modelling and CAD, electronics and embedded product development, simulation and analysis, and laser cutting. Customers can upload an STL, 3MF or OBJ file to an instant estimate and see a price range in seconds.`,
    "",
    "## Facts",
    `- Company: ${SITE.legalName}, Reg. No. ${SITE.regNo}`,
    `- Address: ${SITE.addressOneLine}`,
    `- Hours: ${SITE.hours}`,
    `- Phone: ${SITE.phone}`,
    `- Email: ${SITE.email}`,
    "- Materials: PLA+, PETG, ABS, TPU (flexible), Lightweight PLA",
    "- Instant estimate files: STL, 3MF, OBJ",
    "- Single piece size: up to about 25 cm; larger parts are printed in pieces and joined (statues of 50 cm and more)",
    "- Payment: 50% deposit to start, balance before delivery or at pick-up",
    "- Collection in Maharagama, or delivery by PickMe Flash or Uber",
    "- Studios: Realities by Z2H DS (statues and figurines), Unique Lifestyles by Z2H DS (gifts and home), Design Studio by Z2H (engineering)",
    "",
    "## Pages",
    `- [Home](${SITE.url}/)`,
    `- [Services](${SITE.url}/services)`,
    `- [Gallery](${SITE.url}/gallery)`,
    `- [Instant estimate](${SITE.url}/estimate)`,
    `- [Contact](${SITE.url}/contact)`,
    "",
    "## Services",
    ...SERVICES.map((s) => `- ${s.title}: ${s.long}`),
    "",
    "## Guides",
    ...getPosts().map((p) => `- [${p.title}](${SITE.url}/blog/${p.slug}): ${p.description}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
