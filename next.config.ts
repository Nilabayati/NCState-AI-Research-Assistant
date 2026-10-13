import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(process.env.NEXT_STATIC_EXPORT === "1" ? { output: "export" as const } : {}),
  basePath,
  trailingSlash: process.env.NEXT_STATIC_EXPORT === "1",
  allowedDevOrigins: ["127.0.0.1"],
  devIndicators: false,
};

export default nextConfig;
