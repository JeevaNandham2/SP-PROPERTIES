import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "lenis/dist/lenis.css";
import "./globals.css";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingActions } from "@/components/layout/FloatingActions";
import { NavigationPrefetch } from "@/components/layout/NavigationPrefetch";
import { OpeningAnimation } from "@/components/layout/OpeningAnimation";
import { JsonLd } from "@/components/seo/JsonLd";
import { businessSchema, websiteSchema } from "@/lib/seo";
import { site } from "@/content/site";
import { pageSeo } from "@/content/seo";

const display = localFont({
  src: [
    { path: "./fonts/BodoniModa.ttf", style: "normal" },
    { path: "./fonts/BodoniModa-Italic.ttf", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
});
const sans = localFont({ src: "./fonts/Jost.ttf", weight: "100 900", variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: pageSeo.home.title, template: `%s | ${site.name}` },
  description: pageSeo.home.description,
  applicationName: site.name,
  openGraph: { siteName: site.name, locale: "en_IN", type: "website" },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#FBF8F2", width: "device-width", initialScale: 1 };

const GA = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${sans.variable}`}>
      <body>
        <OpeningAnimation />
        <NavigationPrefetch />
        <SmoothScroll />
        <ScrollReveal />
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">{children}</main>
        <Footer />
        <FloatingActions />
        <JsonLd data={businessSchema()} />
        <JsonLd data={websiteSchema()} />
        {GA && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA}');`}</Script>
          </>
        )}
      </body>
    </html>
  );
}
