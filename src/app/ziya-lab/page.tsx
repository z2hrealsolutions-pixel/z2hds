import { notFound } from "next/navigation";
import Lab from "./Lab";

export const metadata = { title: "Ziya lab", robots: { index: false, follow: false } };
// Only used to render the 2D sprites and test the animation. Switched off on the live site.
export default function Page() {
  if (process.env.NEXT_PUBLIC_ZIYA_LAB !== "1" && process.env.NODE_ENV === "production") notFound();
  return <Lab />;
}
