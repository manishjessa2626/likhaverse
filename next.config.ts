import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@sentry/nextjs"],
  serverExternalPackages: ["pino", "pino-pretty"],
  turbopack: {},
  allowedDevOrigins: ["likhaverse"],
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  ...(process.env.SENTRY_DSN
    ? {
        sentry: {
          hideSourceMaps: false,
          widenClientFileUpload: true,
          tunnelRoute: "/monitoring",
        },
      }
    : {}),
}

export default nextConfig
