import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  devIndicators: false,
  // WebP avoids the slower first-request AVIF encode while keeping photos small.
  images: { formats: ["image/webp"] },
  async redirects() {
    return [{ source: "/:path*", has: [{ type: "host", value: "www.spproperties.co.in" }], destination: "https://spproperties.co.in/:path*", permanent: true }];
  },
};
// Keep Fast Refresh separate from the finished folder uploaded to Netlify.
const configureNext = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    return {
      ...nextConfig,
      distDir: ".next-dev",
      async rewrites() { return [{ source: "/admin", destination: "/admin/index.html" }]; },
    };
  }

  return {
    reactStrictMode: nextConfig.reactStrictMode,
    poweredByHeader: nextConfig.poweredByHeader,
    devIndicators: nextConfig.devIndicators,
    output: "export",
    distDir: "dist",
    // A static export has no Next image server. Netlify handles responsive images.
    images: { loader: "custom", loaderFile: "./lib/netlify-image-loader.ts" },
    // Production redirects and headers live in public/_redirects and public/_headers.
  };
};

export default configureNext;
