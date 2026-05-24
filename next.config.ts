import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default es ~1MB. Subimos a 25MB para que el upload de PDFs
      // (máx 20MB) pase por server actions sin reventar.
      bodySizeLimit: "25mb",
    },
  },
};

export default nextConfig;
