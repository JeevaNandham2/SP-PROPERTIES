import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "SP Properties — Flats and construction in Ambattur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function SocialImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/logo-mark.png"));
  return new ImageResponse(
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#fbf8f2", padding: "60px 72px", color: "#1e2f5b", fontFamily: "sans-serif", position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 112, height: 136, background: "#1e2f5b", borderRadius: 16 }}>
            {/* A data URL keeps the social image independent of an external image host. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/png;base64,${logo.toString("base64")}`} width={64} height={106} alt="" />
          </div>
          <span style={{ fontSize: 27, letterSpacing: 4 }}>SP PROPERTIES</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: 68, lineHeight: 1.1 }}>Flats. Construction.</span>
          <span style={{ fontSize: 68, lineHeight: 1.1 }}>Rooted in Ambattur.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 24 }}>
          <span style={{ width: 50, height: 4, background: "#f9bf2c" }} />
          <span>2 &amp; 3 BHK flats · Construction · Interiors</span>
        </div>
      </div>
      <div style={{ display: "flex", position: "absolute", right: 0, top: 0, bottom: 0, width: 18, background: "#f9bf2c" }} />
    </div>,
    size,
  );
}
