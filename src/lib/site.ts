// One place for the facts shown across the site. Change them here.
export const SITE = {
  name: "Z2H Design Studio",
  legalName: "Z2H Design Studio (PVT) LTD",
  regNo: "PV 00367267",
  // Set the final address of the website here once the domain is connected.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://z2hdesignstudio.com",
  phone: "+94 70 676 0506",
  phoneHref: "tel:+94706760506",
  email: "info@z2hdesignstudio.com",
  addressLines: ["6, Suramya Mawatha,", "Wattegedara, Maharagama"],
  addressOneLine: "6, Suramya Mawatha, Wattegedara, Maharagama",
  hours: "Open 24 hours, every day",
  // WhatsApp number in international format without + or spaces, e.g. "94706760506".
  // While this is empty, WhatsApp buttons send visitors to the Contact page instead.
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? "",
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
