import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import ZiyaMount from "@/components/ziya/ZiyaMount";
import { SITE, waHref, waIsLive } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Z2H Design Studio | 3D printing and design in Maharagama, Sri Lanka", template: "%s | Z2H Design Studio" },
  description: "3D printing, custom figurines, 3D modelling, product development and laser cutting in Maharagama, Sri Lanka. Upload a file for an instant price range. Open 24 hours.",
  applicationName: "Z2H Design Studio",
  openGraph: { type: "website", siteName: "Z2H Design Studio", locale: "en_LK", images: [{ url: "/photos/realities-multicolour-bust-on-plinth.webp", alt: "Multi-colour 3D printed bust made by Z2H Design Studio" }] },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "./" },
  robots: process.env.NEXT_PUBLIC_NOINDEX === "1" ? { index: false, follow: false } : { index: true, follow: true },
};
export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F5F7FC" }, { media: "(prefers-color-scheme: dark)", color: "#0C1018" }] };

const business = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE.url}/#business`,
  name: SITE.name,
  legalName: SITE.legalName,
  url: SITE.url,
  image: `${SITE.url}/photos/realities-multicolour-bust-on-plinth.webp`,
  logo: `${SITE.url}/z2h-mark.png`,
  telephone: SITE.phone,
  email: SITE.email,
  description: "3D printing, custom figurines, 3D modelling and CAD, electronics and embedded product development, simulation and analysis, and laser cutting in Maharagama, Sri Lanka.",
  address: { "@type": "PostalAddress", streetAddress: "6, Suramya Mawatha, Wattegedara", addressLocality: "Maharagama", addressCountry: "LK" },
  openingHoursSpecification: [{ "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "00:00", closes: "23:59" }],
  currenciesAccepted: "LKR",
  sameAs: Object.values(SITE.social).filter(Boolean),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('z2h-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}" }} />
        <JsonLd data={business} />
      </head>
      <body>
        <a className="skip" href="#main">Skip to the content</a>
        <div className="strip"><div className="wrap">
          <span><span className="dot" />{SITE.hours}</span>
          <span>{SITE.addressOneLine}</span>
          <a className="push" href={SITE.phoneHref}>{SITE.phone}</a>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div></div>
        <Header waUrl={waHref("Hello Z2H, I would like to talk about a project.")} waLive={waIsLive()} />
        <main id="main">{children}</main>
        <Footer />
        <ZiyaMount />
      </body>
    </html>
  );
}
