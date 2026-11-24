// One place for the facts shown across the site. Change them here.
export const SITE = {
  name: "Z2H Design Studio",
  legalName: "Z2H Design Studio (PVT) LTD",
  // Set the final address of the website here once the domain is connected.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://z2hdesignstudio.com",
  phone: "+94 70 22 99 100",
  phoneHref: "tel:+94702299100",
  email: "info@z2hdesignstudio.com",
  addressLines: ["6, Suramya Mawatha,", "Wattegedara, Maharagama"],
  addressOneLine: "6, Suramya Mawatha, Wattegedara, Maharagama",
  hours: "Open 24 hours, every day",
  // WhatsApp number in international format without + or spaces. Same number as calls.
  // If this is ever emptied, WhatsApp buttons send visitors to the Contact page instead.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "94702299100",
  // Social links will be added later. Leave a value empty to hide it.
  social: { facebook: "", instagram: "", tiktok: "", linkedin: "", youtube: "" } as Record<string, string>,
  // The instant estimate runs in the studio app and is shown here in a frame.
  estimateUrl: process.env.NEXT_PUBLIC_ESTIMATE_URL ?? "https://z2h-ops.vercel.app/estimate",
};

export function waHref(text?: string): string {
  if (!SITE.whatsapp) return "/contact#whatsapp";
  return `https://wa.me/${SITE.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
export const waIsLive = () => Boolean(SITE.whatsapp);
